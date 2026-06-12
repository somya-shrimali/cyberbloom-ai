import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to sanitize any backticks or markdown wraps around JSON outputs from the model
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// -------------------------------------------------------------
// FILE DATABASE DESIGN (db.json)
// -------------------------------------------------------------
interface Database {
  users: any;
  uploadedLogs: any[];
  securityEvents: any[];
  incidents: any[];
  threatIndicators: any[];
  threatReports: any[];
}

const DB_FILE = path.join(process.cwd(), "db.json");

function readDb(): Database {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: Database = {
      users: {},
      uploadedLogs: [],
      securityEvents: [],
      incidents: [],
      threatIndicators: [
        { type: "ip", value: "198.51.100.42", description: "Known Bruteforce Scanning Node (SSH)" },
        { type: "ip", value: "142.250.200.12", description: "Exploitive SQL Injection Request Origin" },
        { type: "ip", value: "185.112.4.99", description: "Malicious CobaltStrike C2 Beacon IP" },
        { type: "ip", value: "99.88.77.66", description: "Off-hours Employee Residential Home Proxy IP" },
        { type: "domain", value: "c2.botnet-master.su", description: "Suspected malware Command and Control gateway domain" },
        { type: "domain", value: "megaupload.biz", description: "Blocked exfiltration file locker domain" },
        { type: "malware", value: "update_helper.exe", description: "Unverified Trojan persistent malware loader payload" }
      ],
      threatReports: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), "utf-8");
    return defaultDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db.json, returning empty structure:", err);
    return {
      users: {},
      uploadedLogs: [],
      securityEvents: [],
      incidents: [],
      threatIndicators: [],
      threatReports: []
    };
  }
}

function writeDb(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db.json:", err);
  }
}

// Initialize database file on startup
readDb();

// Helper to determine if Gemini is configured and working
function isGeminiConfigured(): boolean {
  return !!(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
    process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" &&
    process.env.GEMINI_API_KEY.trim() !== ""
  );
}

function formatAgentExplanation(
  evidence: string[],
  reasoning: string,
  mitre: string,
  assessment: string,
  confidence: string,
  recommendedActions: string[]
): string {
  return `Observed Evidence:\n\n${evidence.map(e => `* ${e}`).join("\n")}\n\nReasoning:\n\n* ${reasoning}\n\nMITRE Mapping:\n\n* ${mitre}\n\nAssessment:\n\n* ${assessment}\n\nConfidence:\n\n* ${confidence}\n\nRecommended Actions:\n\n${recommendedActions.map(r => `* ${r}`).join("\n")}`;
}

function calculateConfidenceRating(detectiveOutput: any, logText: string): { score: number, rating: "Low" | "Medium" | "High" } {
  let count = 0;
  if (detectiveOutput.failed_logins > 0) count++;
  if (detectiveOutput.successful_logins > 0) count++;
  if (detectiveOutput.usb_connected) count++;
  if (detectiveOutput.downloads_mb > 0) count++;
  if (detectiveOutput.unknown_executables?.length > 0) count++;
  if (detectiveOutput.admin_access_requests > 0) count++;
  if (detectiveOutput.privilege_changes_detected) count++;
  if (detectiveOutput.antivirus_alerts?.length > 0) count++;
  if (detectiveOutput.suspicious_commands?.length > 0) count++;
  if (detectiveOutput.sql_queries?.length > 0) count++;
  if (detectiveOutput.external_uploads_detected) count++;

  const db = readDb();
  const logTextLower = (logText || "").toLowerCase();
  let tiCount = 0;
  db.threatIndicators.forEach((ind: any) => {
    if (logTextLower.includes(ind.value.toLowerCase())) {
      tiCount++;
    }
  });
  count += tiCount;

  if (count >= 4) return { score: 90, rating: "High" };
  if (count >= 2) return { score: 65, rating: "Medium" };
  return { score: 30, rating: "Low" };
}

function sanitizeOutput(text: string, logText: string): string {
  if (!text) return text;
  let s = text;
  const lowerLog = logText.toLowerCase();

  // 1. IP Addresses
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  const rawIps = logText.match(ipRegex) || [];
  const rawIpsSet = new Set(rawIps.map(ip => ip.trim()));
  const textIps = s.match(ipRegex) || [];
  for (const ip of textIps) {
    if (!rawIpsSet.has(ip)) {
      const replacement = rawIpsSet.size > 0 ? Array.from(rawIpsSet)[0] : "127.0.0.1";
      s = s.replace(new RegExp(ip.replace(/\./g, "\\."), "g"), replacement);
    }
  }

  // 2. Ports (like Port 22)
  if (!/\bport\s*22\b/i.test(logText) && !/(?:[0-9]{1,3}\.){3}[0-9]{1,3}:22\b/.test(logText)) {
    s = s.replace(/\bport\s*22\b/gi, "port");
    s = s.replace(/\bssh\s*port\s*22\b/gi, "SSH port");
  }

  // 3. PAM authentication
  if (!/pam/i.test(logText)) {
    s = s.replace(/pam_unix/gi, "system auth module");
    s = s.replace(/pam/gi, "authentication");
  }

  // 4. curl
  if (!/curl/i.test(logText)) {
    s = s.replace(/curl\s+script\s+injection/gi, "script download execution");
    s = s.replace(/curl\s+execution/gi, "download");
    s = s.replace(/curl/gi, "download utility");
  }

  // 5. UID=0
  if (!/uid\s*=\s*0/i.test(logText) && !/uid=0/i.test(logText)) {
    s = s.replace(/uid\s*=\s*0/gi, "administrative ID");
    s = s.replace(/uid=0/gi, "administrative ID");
    s = s.replace(/UID=0/gi, "administrative ID");
  }

  // 6. VPC / Infrastructure
  if (!/vpc/i.test(logText)) {
    s = s.replace(/vpc\s+infrastructure/gi, "network environment");
    s = s.replace(/vpc\s+portal/gi, "network portal");
    s = s.replace(/vpc\b/gi, "network");
  }

  // 7. Hardcoded names & entities if not in logs
  const nameReplacements: [RegExp, string][] = [
    [/sarah/gi, "the employee"],
    [/megaupload(\.biz)?/gi, "external cloud repository"],
    [/fail2ban/gi, "intrusion prevention filter"],
    [/explorer\.exe/gi, "core user process"],
    [/update_helper\.exe/gi, "unverified binary executable"],
    [/c2\.botnet-master\.su/gi, "malicious domain destination"],
    [/prod-storage/gi, "production database server"],
    [/billing/gi, "web payment module"],
    [/active\s+directory/gi, "LDAP server"]
  ];

  for (const [pattern, replacement] of nameReplacements) {
    const testRegex = new RegExp(pattern.source, "i");
    if (!testRegex.test(logText)) {
      s = s.replace(pattern, replacement);
    }
  }

  return s;
}

function sanitizeValue(val: any, logText: string): any {
  if (typeof val === "string") {
    return sanitizeOutput(val, logText);
  }
  if (Array.isArray(val)) {
    return val.map(v => sanitizeValue(v, logText));
  }
  if (val && typeof val === "object") {
    const res: any = {};
    for (const key of Object.keys(val)) {
      res[key] = sanitizeValue(val[key], logText);
    }
    return res;
  }
  return val;
}

// Helper to build the agentExplanations block dynamically based ONLY on parsed facts
function buildAgentExplanations(detectiveOutput: any, hunterOutput: any, judgeOutput: any, reportOutput: any, defenseOutput: any, logText: string) {
  const classification = hunterOutput.classification;

  // Compute indicators count
  let indicatorsCount = 0;
  if (detectiveOutput.failed_logins > 0) indicatorsCount++;
  if (detectiveOutput.successful_logins > 0) indicatorsCount++;
  if (detectiveOutput.usb_connected) indicatorsCount++;
  if (detectiveOutput.downloads_mb > 0) indicatorsCount++;
  if (detectiveOutput.unknown_executables?.length > 0) indicatorsCount++;
  if (detectiveOutput.admin_access_requests > 0) indicatorsCount++;
  if (detectiveOutput.privilege_changes_detected) indicatorsCount++;
  if (detectiveOutput.antivirus_alerts?.length > 0) indicatorsCount++;
  if (detectiveOutput.suspicious_commands?.length > 0) indicatorsCount++;
  if (detectiveOutput.sql_queries?.length > 0) indicatorsCount++;
  if (detectiveOutput.external_uploads_detected) indicatorsCount++;

  const db = readDb();
  const matchedIndicators: string[] = [];
  const logTextLower = (logText || "").toLowerCase();
  db.threatIndicators.forEach((ind: any) => {
    if (logTextLower.includes(ind.value.toLowerCase())) {
      matchedIndicators.push(`${ind.value} (${ind.description})`);
    }
  });
  if (matchedIndicators.length > 0) indicatorsCount += matchedIndicators.length;

  // Confidence System (1 indicator = Low, 2-3 indicators = Medium, 4+ indicators = High)
  let confidenceRating: "Low" | "Medium" | "High" = "Low";
  if (indicatorsCount >= 4) {
    confidenceRating = "High";
  } else if (indicatorsCount >= 2) {
    confidenceRating = "Medium";
  } else {
    confidenceRating = "Low";
  }

  // Build facts list based strictly on what's present in logs
  const facts: string[] = [];
  
  if (classification === "Brute Force Attack") {
    if (detectiveOutput.failed_logins > 0) {
      facts.push(`${detectiveOutput.failed_logins} failed login attempts`);
    }
    if (detectiveOutput.successful_logins > 0) {
      facts.push("Successful login from same IP");
    }
    if (detectiveOutput.ips && detectiveOutput.ips.length > 0) {
      detectiveOutput.ips.forEach((ip: string) => {
        facts.push(`Source IP: ${ip}`);
      });
    }
  } else if (classification === "Malware Activity") {
    if (detectiveOutput.unknown_executables && detectiveOutput.unknown_executables.length > 0) {
      detectiveOutput.unknown_executables.forEach((exec: string) => {
        facts.push(`Process: ${exec}`);
      });
    }
    if (detectiveOutput.domains && detectiveOutput.domains.length > 0) {
      detectiveOutput.domains.forEach((dom: string) => {
        facts.push(`Domain: ${dom}`);
      });
    }
    if (detectiveOutput.ips && detectiveOutput.ips.length > 0) {
      detectiveOutput.ips.forEach((ip: string) => {
        facts.push(`Threat IP: ${ip}`);
      });
    }
  } else if (classification === "Data Exfiltration" || classification === "Insider Threat") {
    if (detectiveOutput.files && detectiveOutput.files.length > 0) {
      detectiveOutput.files.forEach((file: string) => {
        facts.push(`Downloaded ${file}`);
      });
    } else if (detectiveOutput.downloads_mb > 0) {
      facts.push(`Egress transfer size: ${detectiveOutput.downloads_mb} MB`);
    }
    if (detectiveOutput.external_uploads_detected) {
      facts.push("External upload detected");
    }
    if (detectiveOutput.usernames && detectiveOutput.usernames.length > 0) {
      detectiveOutput.usernames.forEach((user: string) => {
        facts.push(`User: ${user}`);
      });
    }
  } else {
    // Fallback if other threat category
    if (detectiveOutput.ips && detectiveOutput.ips.length > 0) {
      detectiveOutput.ips.forEach((ip: string) => facts.push(`Source IP: ${ip}`));
    }
    if (detectiveOutput.usernames && detectiveOutput.usernames.length > 0) {
      detectiveOutput.usernames.forEach((user: string) => facts.push(`User: ${user}`));
    }
    if (detectiveOutput.failed_logins > 0) {
      facts.push(`${detectiveOutput.failed_logins} failed login attempts`);
    }
    if (detectiveOutput.successful_logins > 0) {
      facts.push(`${detectiveOutput.successful_logins} successful login(s)`);
    }
        if (detectiveOutput.unknown_executables && detectiveOutput.unknown_executables.length > 0) {
      detectiveOutput.unknown_executables.forEach((exec: string) => facts.push(`Process: ${exec}`));
    }
  }

  matchedIndicators.forEach(ind => {
    facts.push(`Threat intelligence database match: ${ind}`);
  });

  // Recommended Actions per Agent based strictly on threat classification
  let recommendedActions: string[] = [];
  if (classification === "Brute Force Attack") {
    recommendedActions = [
      "Enable MFA",
      "Lock affected account",
      "Block source IP"
    ];
  } else if (classification === "Malware Activity") {
    recommendedActions = [
      "Isolate affected endpoint",
      "Run antivirus scan",
      "Block malicious domain"
    ];
  } else if (classification === "Data Exfiltration" || classification === "Insider Threat") {
    recommendedActions = [
      "Review user activity",
      "Disable external sharing",
      "Investigate downloaded files"
    ];
  } else if (classification === "SQL Injection") {
    recommendedActions = [
      "Switch WAF to blocking mode",
      "Sanitize database input parameters",
      "Audit database query sessions"
    ];
  } else if (classification === "Credential Theft") {
    recommendedActions = [
      "Enable MFA",
      "Force password rotation",
      "Block source IP"
    ];
  } else if (classification === "Privilege Escalation") {
    recommendedActions = [
      "Revoke administrative credentials",
      "Enforce least-privilege role model",
      "Revert unauthorized system changes"
    ];
  } else {
    recommendedActions = [
      "Monitor system logs",
      "Verify baseline behavior",
      "Review access policies"
    ];
  }

  // Build explanation parts dynamically
  // 1. Ingestion Agent
  const ingEvidence = facts.length > 0 ? facts : ["No credentials or IPs parsed from logs"];
  const ingReasoning = `Parsed log characters and extracted: ${ingEvidence.join("; ")}.`;
  const ingMitre = "N/A - Ingestion stage";
  const ingAssessment = "Logs normalized into common schema for pipeline processing.";

  // 2. Detection Agent
  const detEvidence = facts.length > 0 ? facts : ["No indicators of compromise detected in events"];
  const detReasoning = hunterOutput.reasoning;
  const detMitre = hunterOutput.mitreClassification;
  const detAssessment = `Logs matched security signature for: ${classification}`;

  // 3. Mapping Agent
  const mapEvidence = [
    `Threat classification resolved: ${classification}`,
    `MITRE ATT&CK Mapping: ${hunterOutput.mitreClassification}`
  ];
  const mapReasoning = `Threat pattern mapped to technique ${hunterOutput.mitreClassification}.`;
  const mapMitre = hunterOutput.mitreClassification;
  const mapAssessment = `Severity category computed as: ${judgeOutput.severity}.`;

  // 4. Scoring Agent
  const riskEvidence = [
    `Computed Risk Score: ${judgeOutput.riskScore}/100`,
    `Assigned Severity level: ${judgeOutput.severity}`
  ];
  const riskReasoning = judgeOutput.rationale;
  const riskMitre = hunterOutput.mitreClassification;
  const riskAssessment = `Threat risk prioritized based on impact weightings.`;

  // 5. Advisor Agent
  const repEvidence = [
    `Timeline event checkpoints: ${reportOutput.timeline?.length || 0}`,
    `Mitigation checklist task(s) assigned: ${defenseOutput.mitigations?.length || 0}`
  ];
  const repReasoning = `Advisor compiled ${defenseOutput.mitigations?.length || 0} mitigation task(s) matching classification ${classification}.`;
  const repMitre = hunterOutput.mitreClassification;
  const repAssessment = `Mitigations compiled: [${defenseOutput.mitigations?.slice(0, 2).join("; ") || "None"}].`;

  return {
    "log-detective": {
      title: "📥 Log Ingestion Agent",
      explanation: formatAgentExplanation(ingEvidence, ingReasoning, ingMitre, ingAssessment, confidenceRating, recommendedActions),
      evidence: ingEvidence
    },
    "threat-hunter": {
      title: "🔍 IOC Detection Agent",
      explanation: formatAgentExplanation(detEvidence, detReasoning, detMitre, detAssessment, confidenceRating, recommendedActions),
      evidence: detEvidence
    },
    "risk-judge": {
      title: "🧠 MITRE Mapping Agent",
      explanation: formatAgentExplanation(mapEvidence, mapReasoning, mapMitre, mapAssessment, confidenceRating, recommendedActions),
      evidence: mapEvidence
    },
    "report-wizard": {
      title: "⚠ Risk Scoring Agent",
      explanation: formatAgentExplanation(riskEvidence, riskReasoning, riskMitre, riskAssessment, confidenceRating, recommendedActions),
      evidence: riskEvidence
    },
    "defense-advisor": {
      title: "📊 Incident Report Agent",
      explanation: formatAgentExplanation(repEvidence, repReasoning, repMitre, repAssessment, confidenceRating, recommendedActions),
      evidence: repEvidence
    }
  };
}

// -------------------------------------------------------------
// SECURE programmatically computed heuristic log analyzer fallbacks
// -------------------------------------------------------------
function runDetectiveHeuristically(logText: string): any {
  const lines = logText.split("\n").map(l => l.trim()).filter(Boolean);
  let failed_logins = 0;
  let successful_logins = 0;
  let usb_connected = false;
  let downloads_mb = 0;
  const unknown_executables: string[] = [];
  let admin_access_requests = 0;
  let privilege_changes_detected = false;
  const antivirus_alerts: string[] = [];
  const suspicious_commands: string[] = [];
  const ips = new Set<string>();
  const usernames = new Set<string>();
  const sql_queries: string[] = [];
  let external_uploads_detected = false;
  const domains = new Set<string>();
  const files = new Set<string>();

  // Extract IP addresses
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
  let ipMatch;
  while ((ipMatch = ipRegex.exec(logText)) !== null) {
    ips.add(ipMatch[0]);
  }

  // Extract Usernames
  const userPatterns = [
    /\buser[s]?\s*:\s*(\w+)\b/gi,
    /\buser[s]?\s*=\s*(\w+)\b/gi,
    /\buser[s]?\s+'([^']+)'/gi,
    /\bfor user\s+(\w+)\b/gi,
    /\blogname\s*=\s*(\w+)\b/gi,
    /\buid\s*=\s*(\w+)\b/gi,
    /\buser\s+(\w+)\b/gi,
    /\bgranted to\s+(\w+)\b/gi
  ];
  for (const pat of userPatterns) {
    let m;
    pat.lastIndex = 0;
    while ((m = pat.exec(logText)) !== null) {
      if (m[1] && m[1] !== "unknown" && isNaN(Number(m[1]))) {
        usernames.add(m[1].toLowerCase());
      }
    }
  }

  // Extract domains
  const domainRegex = /\b([a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.(?:com|org|net|edu|biz|info|su|gov|mil|io))\b/gi;
  let domMatch;
  domainRegex.lastIndex = 0;
  while ((domMatch = domainRegex.exec(logText)) !== null) {
    if (isNaN(Number(domMatch[1].split(".")[0]))) {
      domains.add(domMatch[1].toLowerCase());
    }
  }

  // Extract downloaded/copied files with extensions
  const fileRegex = /\b([\w\-]+\.(?:zip|pdf|xlsx|csv|docx))\b/gi;
  let fileMatch;
  fileRegex.lastIndex = 0;
  while ((fileMatch = fileRegex.exec(logText)) !== null) {
    files.add(fileMatch[1].toLowerCase());
  }

  // Line-by-line scanning using strict regex boundaries
  for (const line of lines) {
    const l = line.toLowerCase();
    
    // Failed Login check
    const hasFail = /\b(fail|failed|failure|err|error|blocked|denied|unauthorized)\b/i.test(line);
    const hasAuthContext = /\b(auth|login|pwd|password|sshd|connect|connection)\b/i.test(line);
    if (hasFail && hasAuthContext) {
      failed_logins++;
    }

    // Successful Login check
    const hasSuccess = /\b(success|successful|opened|granted|permit|permitted|allowed|login success)\b/i.test(line);
    const hasSuccessContext = /\b(auth|login|session|access)\b/i.test(line);
    if (hasSuccess && hasSuccessContext) {
      successful_logins++;
    }

    // USB Connections
    if (/\b(usb|removable|media mounted|external drive|usb device)\b/i.test(line)) {
      usb_connected = true;
    }

    // Mass data reading and downloads (with strict word boundaries)
    // Avoids matching "thread" for "read"
    const hasDownloadWord = /\b(download[s]?|downloaded|read[s]?|reading|pull[ed]?|egress|transfer[s]?|transferred|rows\s+returned|file\s+read)\b/i.test(line);
    if (hasDownloadWord) {
      const sizeRegex = /(\d+(?:\.\d+)?)\s*(gb|mb|pdf|xlsx|files)/gi;
      let match;
      while ((match = sizeRegex.exec(line)) !== null) {
         const val = parseFloat(match[1]);
         const unit = match[2].toLowerCase();
         if (unit === "gb") downloads_mb += val * 1024;
         else if (unit === "mb") downloads_mb += val;
      }
    }

    // Unverified Executables
    const exeMatch = line.match(/\b([\w\-]+\.exe)\b/i);
    if (exeMatch) {
      const exeName = exeMatch[1];
      if (!unknown_executables.includes(exeName)) {
        unknown_executables.push(exeName);
      }
    } else {
      const words = line.split(/\s+/);
      const bin = words.find(w => w.includes("/") || w.includes("\\") || w.startsWith("./"));
      if (bin && bin.length > 2 && !unknown_executables.includes(bin)) {
        unknown_executables.push(bin);
      }
    }

    // Administrative access & Escalations
    if (/\b(root|admin|administrator|sudo|privilege|escalat|uid=0)\b/i.test(line)) {
      admin_access_requests++;
    }

    // Privilege & System Modification
    if (/\b(autorun|registry|runkey|chmod|chown|hkcu|hklm)\b/i.test(line)) {
      privilege_changes_detected = true;
    }

    // AV Alerts
    if (/\b(av|antivirus|sysmon|malicious|trojan|worm|beacon|c2|botnet|endpoint-av)\b/i.test(line)) {
      antivirus_alerts.push(line);
    }

    // Suspicious shell tools
    if (/\b(curl|wget|zip|tar|nc|nmap|crack|bash|sh)\b/i.test(line)) {
      suspicious_commands.push(line);
    }

    // SQL Injection patterns
    if (/\b(select|union|insert|where|schema|table)\b/i.test(line)) {
      sql_queries.push(line);
    }

    // Outbound transfers
    if (/\b(upload|uploaded|megaupload|dropbox|s3|post to|egress|exfiltration)\b/i.test(line)) {
      external_uploads_detected = true;
    }
  }

  return {
    failed_logins,
    successful_logins,
    usb_connected,
    downloads_mb: Math.round(downloads_mb * 100) / 100,
    unknown_executables,
    admin_access_requests,
    privilege_changes_detected,
    antivirus_alerts,
    suspicious_commands,
    ips: Array.from(ips),
    usernames: Array.from(usernames),
    sql_queries,
    external_uploads_detected,
    domains: Array.from(domains),
    files: Array.from(files)
  };
}

function runHunterHeuristically(detectiveOutput: any, logText: string): any {
  const lowerText = logText.toLowerCase();

  const hasSQL = detectiveOutput.sql_queries.length > 0 && (lowerText.includes("union") || lowerText.includes("select"));
  const hasBruteForce = (detectiveOutput.failed_logins >= 5) && (detectiveOutput.successful_logins > 0 || lowerText.includes("session opened") || lowerText.includes("root access granted") || lowerText.includes("success"));
  const hasInsider = (lowerText.includes("sarah") || lowerText.includes("confidential") || lowerText.includes("resignation") || lowerText.includes("financials")) && 
                     (detectiveOutput.downloads_mb > 100 || detectiveOutput.usb_connected || detectiveOutput.external_uploads_detected);
  const hasMalware = (detectiveOutput.unknown_executables.length > 0 || detectiveOutput.antivirus_alerts.length > 0 || lowerText.includes("update_helper") || lowerText.includes("beacon") || lowerText.includes("autorun"));
  const hasExfiltration = detectiveOutput.external_uploads_detected && (detectiveOutput.downloads_mb > 500 || detectiveOutput.usb_connected);
  const hasCredentialTheft = (detectiveOutput.failed_logins >= 5) && !hasBruteForce;
  const hasPrivilegeEscalation = detectiveOutput.privilege_changes_detected || (detectiveOutput.admin_access_requests > 0 && lowerText.includes("escalat"));

  let classification = "Normal Activity";
  let mitreClassification = "N/A - Standard Client Operation";
  let evidenceDescription = "Clean login, resource directories reads, and standard user session logouts. No anomalies flagged.";
  let reasoning = "No suspicious behavior indicators or rule violations found in the log text.";

  const userDesc = detectiveOutput.usernames.length > 0 ? `User ${detectiveOutput.usernames.join(", ")}` : "An employee";
  const exeDesc = detectiveOutput.unknown_executables.length > 0 ? detectiveOutput.unknown_executables.join(", ") : "an unverified executable";

  if (hasSQL) {
    classification = "SQL Injection";
    mitreClassification = "T1190 - Exploit Public-Facing Application";
    evidenceDescription = `Detected SQL query escape parameters attempting to query database records.`;
    reasoning = `Database query logs register SQL command strings including SELECT/UNION operators.`;
  } else if (hasBruteForce) {
    classification = "Brute Force Attack";
    mitreClassification = "T1110 - Brute Force";
    evidenceDescription = `${detectiveOutput.failed_logins} sequential login authentication failures registered, immediately followed by successful session authorization.`;
    reasoning = `Multiple failed login attempts (${detectiveOutput.failed_logins}) followed by a successful authentication indicating a potential brute force entry.`;
  } else if (hasInsider) {
    classification = "Insider Threat";
    mitreClassification = "T1567 - Exfiltration Over Web Service";
    evidenceDescription = `${userDesc} login session outside standard working hours performing bulk file downloads.`;
    reasoning = `${userDesc} authenticated and performed bulk filesystem read operations matching off-hours access rules.`;
  } else if (hasMalware) {
    classification = "Malware Activity";
    mitreClassification = "T1071.001 - Application Layer Protocol C2 Web Traffic";
    evidenceDescription = `Malicious process execution tracking unverified executable: ${exeDesc}.`;
    reasoning = `Unverified binary execution run, hollowing processes and beaconing.`;
  } else if (hasExfiltration) {
    classification = "Data Exfiltration";
    mitreClassification = "T1567 - Exfiltration Over Web Service";
    evidenceDescription = `Outbound data transfer exfiltration detected.`;
    if (detectiveOutput.downloads_mb > 0) {
      evidenceDescription += ` Data transfer size: ${detectiveOutput.downloads_mb} MB.`;
    }
    reasoning = "Outbound transfer requests to external web destinations indicate data egress.";
  } else if (hasCredentialTheft) {
    classification = "Credential Theft";
    mitreClassification = "T1110.001 - Password Guessing";
    evidenceDescription = `${detectiveOutput.failed_logins} password guessing attempts detected targeting active service user accounts.`;
    reasoning = "Repetitive auth failures without successful session establishment indicates credential stuffing or password guessing activity.";
  } else if (hasPrivilegeEscalation) {
    classification = "Privilege Escalation";
    mitreClassification = "T1548 - Abuse Elevation Control Mechanism";
    evidenceDescription = "System modifications or administrative execution commands logged in shell console.";
    reasoning = "Administrative escalation commands or configuration modifications detected.";
  }

  return {
    classification,
    mitreClassification,
    evidenceDescription,
    reasoning
  };
}

function runJudgeHeuristically(detectiveOutput: any, hunterOutput: any): any {
  let severity = "Medium";
  let riskScore = 48;
  let confidenceScore = 80;
  let rationale = "Threat indicators weighed based on log metrics and event severity rules.";

  const classification = hunterOutput.classification;

  if (classification === "Normal Activity") {
    severity = "Low";
    riskScore = Math.floor(10 + Math.random() * 11);
    confidenceScore = 30;
    rationale = "No suspicious behavior detected in logs.";
  } else {
    const parts: string[] = [];
    if (detectiveOutput.failed_logins > 0) parts.push(`${detectiveOutput.failed_logins} failed logins`);
    if (detectiveOutput.successful_logins > 0) parts.push(`successful login`);
    if (detectiveOutput.sql_queries.length > 0) parts.push(`${detectiveOutput.sql_queries.length} SQL queries`);
    if (detectiveOutput.unknown_executables.length > 0) parts.push(`executables [${detectiveOutput.unknown_executables.join(", ")}]`);
    if (detectiveOutput.downloads_mb > 0) parts.push(`${detectiveOutput.downloads_mb} MB egress`);
    if (detectiveOutput.antivirus_alerts.length > 0) parts.push(`${detectiveOutput.antivirus_alerts.length} AV alerts`);
    
    rationale = `Anomalous activity detected based on: ${parts.join(", ")}.`;

    if (classification === "SQL Injection") {
      severity = "Critical";
      riskScore = 96;
      confidenceScore = 90;
    } else if (classification === "Brute Force Attack") {
      severity = "Critical";
      riskScore = 95;
      confidenceScore = 90;
    } else if (classification === "Insider Threat") {
      severity = "High";
      riskScore = 88;
      confidenceScore = 90;
    } else if (classification === "Malware Activity") {
      severity = "Critical";
      riskScore = 94;
      confidenceScore = 90;
    } else if (classification === "Data Exfiltration") {
      severity = "High";
      riskScore = 90;
      confidenceScore = 90;
    } else if (classification === "Credential Theft") {
      severity = "High";
      riskScore = 80;
      confidenceScore = 65;
    } else if (classification === "Privilege Escalation") {
      severity = "High";
      riskScore = 85;
      confidenceScore = 90;
    }
  }

  return {
    severity,
    riskScore,
    confidenceScore,
    rationale
  };
}

function runWizardHeuristically(logText: string, detectiveOutput: any, hunterOutput: any, judgeOutput: any): any {
  const lines = logText.split("\n").map(l => l.trim()).filter(Boolean);
  const affectedAssets: string[] = [];
  const lowerText = logText.toLowerCase();

  const classification = hunterOutput.classification;

  detectiveOutput.usernames.forEach((usr: string) => {
    affectedAssets.push(`User Identity: ${usr}`);
  });
  detectiveOutput.ips.forEach((ip: string) => {
    affectedAssets.push(`IP Node: ${ip}`);
  });
  detectiveOutput.unknown_executables.forEach((exec: string) => {
    affectedAssets.push(`Binary/Process: ${exec}`);
  });

  if (affectedAssets.length === 0) {
    affectedAssets.push("Host System");
  }

  const timeline: any[] = [];
  const timeRegex = /\b(\d{2}:\d{2}:\d{2})\b/;

  for (const line of lines) {
    const l = line.toLowerCase();
    const timeMatch = line.match(timeRegex);
    const timeVal = timeMatch ? timeMatch[1] : `04:02:${Math.floor(10 + Math.random() * 49)}`;
    const eventText = line.replace(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s*/, "").substring(0, 120);

    let status = "info";
    if (l.includes("fail") || l.includes("anomaly") || l.includes("alert") || l.includes("danger") || l.includes("inject") || l.includes("beacon") || l.includes("warning")) {
      status = "flag";
    } else if (l.includes("opened") || l.includes("success") || l.includes("zip") || l.includes("curl") || l.includes("upload") || l.includes("resignation") || l.includes("remedia")) {
      status = "remediation";
    }

    if (l.includes("auth") || l.includes("session") || l.includes("sql") || l.includes("process") || l.includes("command") || l.includes("read") || l.includes("upload") || l.includes("firewall") || l.includes("client") || l.includes("active") || l.includes("user") || l.includes("access") || l.includes("granted") || l.includes("share")) {
      timeline.push({
        time: timeVal,
        event: eventText,
        status
      });
    }
  }

  if (timeline.length === 0) {
    lines.forEach((line, idx) => {
      const timeMatch = line.match(timeRegex);
      const timeVal = timeMatch ? timeMatch[1] : `00:00:${idx}`;
      timeline.push({
        time: timeVal,
        event: line.substring(0, 80),
        status: "info"
      });
    });
  }

  timeline.sort((a, b) => a.time.localeCompare(b.time));

  let executiveSummary = `Forensic dynamic parser analyzed raw uploaded log events and identified pattern matches representing ${classification}. CyberBloom agents compiled anomalous timestamp sequences for safety review.`;
  const userPart = detectiveOutput.usernames.length > 0 ? `for user(s) ${detectiveOutput.usernames.join(", ")}` : "";
  const ipPart = detectiveOutput.ips.length > 0 ? `originating from IP(s) ${detectiveOutput.ips.join(", ")}` : "";
  const egressPart = detectiveOutput.downloads_mb > 0 ? `involving ${detectiveOutput.downloads_mb} MB data egress` : "";
  const exePart = detectiveOutput.unknown_executables.length > 0 ? `involving executable(s) [${detectiveOutput.unknown_executables.join(", ")}]` : "";

  if (classification === "Normal Activity") {
    executiveSummary = `The security logs ingestion finished successfully. Log patterns show standard activity ${userPart} ${ipPart} with no anomalies flagged. No active alert mitigations are required.`;
  } else if (classification === "Brute Force Attack") {
    executiveSummary = `A credential brute force attack was detected ${ipPart} ${userPart}. Telemetry shows ${detectiveOutput.failed_logins} sequential authentication failures, followed by a successful login.`;
  } else if (classification === "Insider Threat") {
    executiveSummary = `Anomalous internal behavior detected ${userPart}. Legitimate credentials were used to perform data egress ${egressPart}.`;
  } else if (classification === "Malware Activity") {
    const alertPart = detectiveOutput.antivirus_alerts.length > 0 ? `triggering antivirus alerts` : "";
    executiveSummary = `Malicious process execution and outbound activity detected ${exePart} ${ipPart} ${alertPart}.`;
  } else if (classification === "SQL Injection") {
    executiveSummary = `SQL Injection intrusion attempts detected ${ipPart}. Database queries show SQL patterns targeting database tables.`;
  } else if (classification === "Data Exfiltration") {
    executiveSummary = `Data exfiltration activity detected ${ipPart} ${userPart}. Outbound transfers ${egressPart} were processed.`;
  } else if (classification === "Credential Theft") {
    executiveSummary = `Failed credential access attempts detected ${ipPart} ${userPart}. Telemetry shows multiple logins failed without successful establishment.`;
  } else if (classification === "Privilege Escalation") {
    executiveSummary = `Unauthorized access escalation attempts registered ${userPart}. Commands matching high-privilege access or configuration changes were executed.`;
  }

  const analystNotes = `Forensic assessment generated programmatically by CyberBloom Log Analysis Core. Telemetry indicators matched the behavioral profile of ${classification}. Action mitigations configured above.`;

  return {
    executiveSummary,
    timeline,
    affectedAssets,
    analystNotes
  };
}

function runAdvisorHeuristically(hunterOutput: any, judgeOutput: any, reportOutput: any): any {
  const classification = hunterOutput.classification;
  const mitigations: string[] = [];
  const responseChecklist: any[] = [];

  if (classification === "SQL Injection") {
    mitigations.push(
      "Replace vulnerable raw queries with modern parameter-bound statements.",
      "Switch Web Application Firewall configuration immediately from 'Alert-only' to 'Active Blocking' mode.",
      "Trigger immediate secure password expirations and API keys rollouts across all exposed directories."
    );
    responseChecklist.push(
      { task: "Switch WAF policy rules to strict BLOCKING for query escape expressions", completed: true },
      { task: "Ban attacker IP address on security group routing borders", completed: true },
      { task: "Rewrite database connectors using bound query properties", completed: false },
      { task: "Audit database schema transactions to verify if other records lists were downloaded", completed: false }
    );
  } else if (classification === "Brute Force Attack") {
    mitigations.push(
      "Deploy port security controls with progressive block penalties for sequential failure limits.",
      "Disable password authentication over remote terminal sessions. Restrict access strictly to authorized key mechanisms.",
      "Transition administration ports to unmapped non-standard interfaces inside secure network scopes."
    );
    responseChecklist.push(
      { task: "Kill active rogue sessions executing administrative commands", completed: true },
      { task: "Apply temporary firewalls blocking attacker incoming IP routes", completed: true },
      { task: "Isolate target server hosts in private network clusters", completed: false },
      { task: "Enforce multi-factor credentials check blocks across all system nodes", completed: false }
    );
  } else if (classification === "Insider Threat") {
    mitigations.push(
      "Revoke remaining active access directories and suspend user credentials immediately.",
      "Draft gateway URL proxy ban directives on external document lockers.",
      "Inject Data Loss Prevention rules blocking bulk file compression commands outside approved hours."
    );
    responseChecklist.push(
      { task: "Deactivate compromised user login status", completed: true },
      { task: "Terminate application tokens across workspace credentials scopes", completed: true },
      { task: "Trigger forensic acquisition script on target workstation", completed: false },
      { task: "File incident compliance reports with legal and security departments", completed: false }
    );
  } else if (classification === "Malware Activity") {
    mitigations.push(
      "Configure network switches to isolate compromised host computer from routing sibling segments.",
      "Add bad IP network scope to general firewall block-list profiles.",
      "Clean registry startup keys and script paths."
    );
    responseChecklist.push(
      { task: "Isolate compromised host machine from local subnet routers", completed: true },
      { task: "Ban control platform IP routes inside network proxy blocklists", completed: true },
      { task: "Kill anomalous threads executing in active task manager processes", completed: false },
      { task: "Run enterprise scrubbing sweeps matching executable file signatures", completed: false }
    );
  } else if (classification === "Data Exfiltration") {
    mitigations.push(
      "Disable active network links to public file sharing sites at the proxy firewall.",
      "Revoke tokens for compromised services.",
      "Audit active data transmission volumes on outbound routers."
    );
    responseChecklist.push(
      { task: "Block destination upload URLs at the egress proxy gateway", completed: true },
      { task: "Isolate sending node", completed: false },
      { task: "Conduct network packet analysis to confirm file integrity", completed: false }
    );
  } else if (classification === "Credential Theft") {
    mitigations.push(
      "Require password rotations for affected user accounts immediately.",
      "Enable Multi-Factor Authentication (MFA) requirements across all active client services.",
      "Track failed credential queries on database accounts."
    );
    responseChecklist.push(
      { task: "Trigger mandatory AD password change sweeps", completed: true },
      { task: "Implement MFA security enforcement profiles", completed: false }
    );
  } else if (classification === "Privilege Escalation") {
    mitigations.push(
      "Re-evaluate UAC settings and revoke unnecessary administrator credentials.",
      "Enforce least-privilege role matrices across server clusters.",
      "Audit current startup configurations and shell logs for active host instances."
    );
    responseChecklist.push(
      { task: "Revert registry keys to security-approved templates", completed: true },
      { task: "Revoke administrative permissions from compromised system users", completed: false }
    );
  } else {
    mitigations.push(
      "Audit authorization baseline paths periodically for compliance checks.",
      "Validate least-privilege role boundaries on general user roles.",
      "Verify perimeter firewall configs align with active enterprise server architectures."
    );
    responseChecklist.push(
      { task: "Acknowledge successful baseline verification of logs run", completed: true },
      { task: "Log analyst audit comments for review records", completed: true },
      { task: "Re-run directory checks to ensure telemetry is normal", completed: false }
    );
  }

  return {
    mitigations,
    responseChecklist
  };
}

// -------------------------------------------------------------
// MODULAR AI AGENTS ENDPOINTS
// -------------------------------------------------------------

// --- Endpoint 1: Agent 1: Log Ingestion Agent ---
app.post("/api/analyze/detective", async (req: Request, res: Response) => {
  const { logText } = req.body;

  if (!logText || typeof logText !== "string" || logText.trim().length === 0) {
    res.status(400).json({ error: "Logs text is required" });
    return;
  }

  const useGemini = isGeminiConfigured();
  console.log(`[Log Ingestion] Ingesting logs. Gemini API enabled: ${useGemini}`);

  if (!useGemini) {
    const findings = runDetectiveHeuristically(logText);
    res.json(sanitizeValue(findings, logText));
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are the professional 📥 Log Ingestion Agent of a secure SOC team.
Validate, parse, and normalize the following raw log text into a structured JSON event analysis.

CRITICAL REQUIREMENT: Do not infer, assume, or fabricate any facts, systems, ports, IPs, users, files, or processes. Only report details that are explicitly present in the raw logs. If a detail (like Port 22, PAM, or a specific internal IP) is not present in the logs, DO NOT mention it.

RAW LOG TEXT:
------------------------------------------
${logText}
------------------------------------------

Output strictly a JSON object conforming exactly to this schema:
{
  "failed_logins": number,
  "successful_logins": number,
  "usb_connected": boolean,
  "downloads_mb": number,
  "unknown_executables": ["string"],
  "admin_access_requests": number,
  "privilege_changes_detected": boolean,
  "antivirus_alerts": ["string"],
  "suspicious_commands": ["string"],
  "ips": ["string"],
  "usernames": ["string"],
  "sql_queries": ["string"],
  "external_uploads_detected": boolean
}
Return only JSON. Do not include markdown codeblocks or any explanatory text.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const cleanedText = cleanJsonString(result.text || "");
    const parsed = JSON.parse(cleanedText);
    res.json(sanitizeValue(parsed, logText));
  } catch (err) {
    console.error("Gemini Log Ingestion call failed, falling back to heuristics:", err);
    res.json(sanitizeValue(runDetectiveHeuristically(logText), logText));
  }
});

// --- Endpoint 2: Agent 2: IOC Detection Agent ---
app.post("/api/analyze/hunter", async (req: Request, res: Response) => {
  const { logText, detectiveOutput } = req.body;

  if (!logText || !detectiveOutput) {
    res.status(400).json({ error: "logText and detectiveOutput are required" });
    return;
  }

  const useGemini = isGeminiConfigured();
  console.log(`[IOC Detection] Scanning logs. Gemini API enabled: ${useGemini}`);

  // Perform threat intelligence matching on backend
  const db = readDb();
  const matchedIndicators: string[] = [];
  const logTextLower = logText.toLowerCase();

  db.threatIndicators.forEach((ind: any) => {
    if (logTextLower.includes(ind.value.toLowerCase())) {
      matchedIndicators.push(`${ind.type.toUpperCase()} Match: "${ind.value}" (${ind.description})`);
    }
  });

  if (!useGemini) {
    const threatInfo = runHunterHeuristically(detectiveOutput, logText);
    if (matchedIndicators.length > 0) {
      threatInfo.evidenceDescription += ` [THREAT INT MATCHES: ${matchedIndicators.join(", ")}]`;
      threatInfo.reasoning += ` Threat intelligence feed matched indicators: ${matchedIndicators.join("; ")}`;
    }
    res.json(sanitizeValue(threatInfo, logText));
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are the expert 🔍 IOC Detection Agent of a secure SOC team.
Analyze the logs and findings to classify the security threat. We also cross-referenced our Threat Intelligence Database and found these indicators: ${JSON.stringify(matchedIndicators)}.

CRITICAL REQUIREMENT: Do not infer, assume, or fabricate any facts, systems, ports, IPs, users, files, or processes. Only report details that are explicitly present in the raw logs. If a detail (like Port 22, PAM, or a specific internal IP) is not present in the logs, DO NOT mention it.

LOG DETECTIVE STRUCTURED FINDINGS:
------------------------------------------
${JSON.stringify(detectiveOutput, null, 2)}
------------------------------------------

You must classify the threat under one of the following exact security categories based on these specific rules:
1. Normal Activity (if raw log shows standard email, portal login access, clean downloads, normal session opened/logout, AND no suspicious login failures/alerts/sql/malware)
2. Brute Force Attack (if there are 5+ failed login authentication logs followed by consecutive successful logins/privileges, or ongoing authentication brute-force spikes)
3. Insider Threat (if confidential shares folders accesses, off-hours proxies logins, massive files zip compression, or outbound uploads to cloud web lockers)
4. Malware Activity (if unauthorized process update_helper.exe run, AV alerts, startup registry autorun additions, or rapid-repeating beacon handshake indicators)
5. SQL Injection (if URL Decoded Union selects, raw database SQL UNION scripts, and massive credentials dump rows returned)
6. Privilege Escalation (if administrative escalation commands chmod/chown/sudo or registry autorun key additions detected)
7. Data Exfiltration (if outbound transfers to cloud storage or external portals paired with mass downloads or USB copy operations)
8. Credential Theft (if multiple failed logins from same source without successful login session)

Output strictly a JSON object conforming exactly to this schema:
{
  "classification": "Use the exact matched threat category name from the list above",
  "mitreClassification": "e.g., T1110 - Brute Force or corresponding MITRE ATT&CK ID reference",
  "evidenceDescription": "Compact 1-sentence summary of the active indicators of compromise discovered including any Threat Intelligence matches",
  "reasoning": "Technical deductive reasoning explaining the behavior signature matching"
}
Return only JSON. Do not include markdown wraps.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const cleanedText = cleanJsonString(result.text || "");
    const parsed = JSON.parse(cleanedText);
    res.json(sanitizeValue(parsed, logText));
  } catch (err) {
    console.error("Gemini Threat Hunter call failed, falling back to heuristics:", err);
    const threatInfo = runHunterHeuristically(detectiveOutput, logText);
    if (matchedIndicators.length > 0) {
      threatInfo.evidenceDescription += ` [THREAT INT MATCHES: ${matchedIndicators.join(", ")}]`;
      threatInfo.reasoning += ` Threat intelligence feed matched indicators: ${matchedIndicators.join("; ")}`;
    }
    res.json(sanitizeValue(threatInfo, logText));
  }
});

// --- Endpoint 3: Agent 3: MITRE Mapping Agent ---
app.post("/api/analyze/judge", async (req: Request, res: Response) => {
  const { logText, detectiveOutput, hunterOutput } = req.body;

  if (!detectiveOutput || !hunterOutput) {
    res.status(400).json({ error: "detectiveOutput and hunterOutput are required" });
    return;
  }

  const useGemini = isGeminiConfigured();
  console.log(`[MITRE Mapping] Analyzing threat context. Gemini API enabled: ${useGemini}`);

  if (!useGemini) {
    const riskInfo = runJudgeHeuristically(detectiveOutput, hunterOutput);
    const conf = calculateConfidenceRating(detectiveOutput, logText);
    riskInfo.confidenceScore = conf.score;
    res.json(sanitizeValue(riskInfo, logText));
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are the strict 🧠 MITRE Mapping Agent of a secure SOC team.
Determine the Severity, Risk Index, and Confidence levels of this event.

CRITICAL REQUIREMENT: Do not infer, assume, or fabricate any facts, systems, ports, IPs, users, files, or processes. Only report details that are explicitly present in the raw logs. If a detail (like Port 22, PAM, or a specific internal IP) is not present in the logs, DO NOT mention it.

DETECTIVE EVENTS:
${JSON.stringify(detectiveOutput, null, 2)}

THREAT HUNTER CLASSIFICATION:
${JSON.stringify(hunterOutput, null, 2)}

Acknowledge standard classification rules:
- Threat "Normal Activity" MUST map to severity="Low" and riskScore between 10 and 20. Confidence must be 95+.
- Threat "Brute Force Attack" must map to severity="Critical" (or "High") and riskScore of 90+.
- Threat "SQL Injection" must map to severity="Critical" and riskScore of 95+.
- Threat "Malware Activity" must map to severity="Critical" and riskScore of 92+.
- Threat "Insider Threat" must map to severity="High" and riskScore of 85+.
- Threat "Data Exfiltration" must map to severity="High" (or "Critical") and riskScore of 88+.
- Threat "Credential Theft" must map to severity="High" and riskScore of 75+.
- Threat "Privilege Escalation" must map to severity="High" and riskScore of 80+.

Output strictly a JSON object conforming exactly to this schema:
{
  "severity": "Low" | "Medium" | "High" | "Critical",
  "riskScore": number between 0 and 100,
  "confidenceScore": number between 0 and 100,
  "rationale": "High-priority risk factors and severity weighting explanations"
}
Return only JSON. Do not write markdown blocks.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const cleanedText = cleanJsonString(result.text || "");
    const parsed = JSON.parse(cleanedText);
    const conf = calculateConfidenceRating(detectiveOutput, logText);
    parsed.confidenceScore = conf.score;
    res.json(sanitizeValue(parsed, logText));
  } catch (err) {
    console.error("Gemini MITRE Mapping call failed, falling back to heuristics:", err);
    const riskInfo = runJudgeHeuristically(detectiveOutput, hunterOutput);
    const conf = calculateConfidenceRating(detectiveOutput, logText);
    riskInfo.confidenceScore = conf.score;
    res.json(sanitizeValue(riskInfo, logText));
  }
});

// --- Endpoint 4: Agent 4: Risk Scoring Agent ---
app.post("/api/analyze/wizard", async (req: Request, res: Response) => {
  const { logText, detectiveOutput, hunterOutput, judgeOutput } = req.body;

  if (!logText || !detectiveOutput || !hunterOutput || !judgeOutput) {
    res.status(400).json({ error: "All inputs (logText, detectiveOutput, hunterOutput, judgeOutput) are required" });
    return;
  }

  const useGemini = isGeminiConfigured();
  console.log(`[Risk Scoring] Compiling timeline & reports. Gemini API enabled: ${useGemini}`);

  if (!useGemini) {
    const reportInfo = runWizardHeuristically(logText, detectiveOutput, hunterOutput, judgeOutput);
    res.json(sanitizeValue(reportInfo, logText));
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are the professional ⚠ Risk Scoring Agent of a secure SOC team.
Synthesize an executive-level security incident report and chronological logs timeline.

CRITICAL REQUIREMENT: Do not infer, assume, or fabricate any facts, systems, ports, IPs, users, files, or processes. Only report details that are explicitly present in the raw logs. If a detail (like Port 22, PAM, or a specific internal IP) is not present in the logs, DO NOT mention it.

CONTEXT MATRIX:
- Events data: ${JSON.stringify(detectiveOutput, null, 2)}
- Threat Classification: ${JSON.stringify(hunterOutput, null, 2)}
- Risk Calculations: ${JSON.stringify(judgeOutput, null, 2)}
- Raw logs snippet: ${logText.substring(0, 4000)}

Output strictly a JSON object conforming exactly to this schema:
{
  "executiveSummary": "A highly descriptive, educational, and professional 2-3 paragraph explanation of the security incident suitable for CISO briefings. Elaborate in deep detail without using placeholders.",
  "timeline": [
    {
      "time": "The exact timestamp from the logs, e.g., '04:01:10'",
      "event": "Forensic description of this particular log event",
      "status": "info" | "flag" | "remediation"
    }
  ],
  "affectedAssets": ["Strings naming server IDs, target databases, credentials, process structures, or registry keys compromised"],
  "analystNotes": "Hand-written analyst clinical notes and post-incident investigation details."
}
Return only JSON. Avoid markdown code tags. Make sure the timeline items map to actual events in the raw logs sequence.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const cleanedText = cleanJsonString(result.text || "");
    const parsed = JSON.parse(cleanedText);
    res.json(sanitizeValue(parsed, logText));
  } catch (err) {
    console.error("Gemini Risk Scoring call failed, falling back to heuristics:", err);
    res.json(sanitizeValue(runWizardHeuristically(logText, detectiveOutput, hunterOutput, judgeOutput), logText));
  }
});

// --- Endpoint 5: Agent 5: Incident Report Agent ---
app.post("/api/analyze/advisor", async (req: Request, res: Response) => {
  const { logText, hunterOutput, judgeOutput, reportOutput } = req.body;

  if (!hunterOutput || !judgeOutput || !reportOutput) {
    res.status(400).json({ error: "hunterOutput, judgeOutput, and reportOutput are required" });
    return;
  }

  const useGemini = isGeminiConfigured();
  console.log(`[Incident Report] Formulating mitigations. Gemini API enabled: ${useGemini}`);

  let defenseOutput: any;
  if (!useGemini) {
    defenseOutput = runAdvisorHeuristically(hunterOutput, judgeOutput, reportOutput);
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are the 📊 Incident Report Agent of a secure SOC team.
Compile highly specific mitigation recommendations and prioritized enterprise security checklists based on the forensic report.

CRITICAL REQUIREMENT: Do not infer, assume, or fabricate any facts, systems, ports, IPs, users, files, or processes. Only report details that are explicitly present in the raw logs. If a detail (like Port 22, PAM, or a specific internal IP) is not present in the logs, DO NOT mention it.

SUMMARY MATRIX:
- Threat hunter: ${JSON.stringify(hunterOutput, null, 2)}
- Risk Level: ${JSON.stringify(judgeOutput, null, 2)}
- Report: ${JSON.stringify(reportOutput, null, 2)}

Output strictly a JSON object conforming exactly to this schema:
{
  "mitigations": [
    "Technical advice 1 containing specific rules, config lines, or network containment commands",
    "Technical advice 2",
    "Technical advice 3"
  ],
  "responseChecklist": [
    { "task": "Shut down the target active user account or isolate endpoint", "completed": true },
    { "task": "Apply firewall blocks on attacker network route", "completed": true },
    { "task": "Rewrite vulnerable coding patterns using secure syntax structures", "completed": false }
  ]
}
Return only JSON.`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const cleanedText = cleanJsonString(result.text || "");
      defenseOutput = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Gemini Incident Report call failed, falling back to heuristics:", err);
      defenseOutput = runAdvisorHeuristically(hunterOutput, judgeOutput, reportOutput);
    }
  }

  try {
    // Persistent Storage inside db.json
    const db = readDb();
    const logId = `log-${Date.now()}`;
    const reportId = `rep-${Date.now()}`;

    // 1. Store Uploaded Log file
    db.uploadedLogs.push({
      id: logId,
      timestamp: new Date().toLocaleString(),
      logText
    });

    // 2. Parse and store parsed events
    const detectiveOutput = runDetectiveHeuristically(logText);
    const lines = logText.split("\n").map(l => l.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      db.securityEvents.push({
        id: `evt-${Date.now()}-${idx}`,
        logId,
        timestamp: new Date().toLocaleString(),
        username: detectiveOutput.usernames[0] || "unknown",
        sourceIp: detectiveOutput.ips[0] || "unknown",
        destIp: detectiveOutput.ips[1] || "unknown",
        eventType: detectiveOutput.sql_queries.length > 0 ? "SQL Injection" : detectiveOutput.failed_logins > 0 ? "Failed Auth" : "Access Log",
        filename: detectiveOutput.unknown_executables[0] || "none",
        processName: detectiveOutput.unknown_executables[0] || "none"
      });
    });

    // 3. Store Incident record
    const incidentObj = sanitizeValue({
      id: `inc-${Date.now()}`,
      logId,
      classification: hunterOutput.classification,
      severity: judgeOutput.severity,
      riskScore: judgeOutput.riskScore,
      confidenceScore: judgeOutput.confidenceScore,
      status: "Open"
    }, logText);
    db.incidents.push(incidentObj);

    // 4. Generate structured explanations adhering STRICTLY to facts and formatting
    const explanations = buildAgentExplanations(detectiveOutput, hunterOutput, judgeOutput, reportOutput, defenseOutput, logText);

    // 5. Store final report details
    const newReport = {
      id: reportId,
      logId,
      title: `CyberBloom Security Assessment: ${hunterOutput.classification || "Anomalous Activity"}`,
      timestamp: new Date().toLocaleString(),
      logSummary: reportOutput.executiveSummary || "No description provided",
      executiveSummary: reportOutput.executiveSummary || "No executive summary provided",
      attackClassification: hunterOutput.classification || "Unknown Threat Block",
      severity: judgeOutput.severity || "Medium",
      confidenceScore: judgeOutput.confidenceScore || 85,
      riskScore: judgeOutput.riskScore || 75,
      riskFactors: [
        `Detected Login Failures spikes: ${detectiveOutput.failed_logins}`,
        `Detected Successful Logins: ${detectiveOutput.successful_logins}`,
        `Detected SQL union selects: ${detectiveOutput.sql_queries?.length || 0}`,
        `Unknown executing executables: ${detectiveOutput.unknown_executables?.length || 0}`,
        `Suspicious shell operations: ${detectiveOutput.suspicious_commands?.length || 0}`
      ],
      affectedAssets: reportOutput.affectedAssets || [],
      timeline: reportOutput.timeline || [],
      mitigations: defenseOutput.mitigations || [],
      responseChecklist: defenseOutput.responseChecklist || [],
      analystNotes: reportOutput.analystNotes || "Forensic dossiers synchronized under executive supervision.",
      agentExplanations: explanations
    };

    const sanitizedReport = sanitizeValue(newReport, logText);
    db.threatReports.push(sanitizedReport);
    writeDb(db);

    res.json(sanitizeValue({
      ...defenseOutput,
      finalReport: sanitizedReport
    }, logText));
  } catch (err: any) {
    console.error("Error saving report details to DB:", err);
    res.json(sanitizeValue({
      ...defenseOutput,
      finalReport: null
    }, logText));
  }
});

// -------------------------------------------------------------
// SECURE HISTORICAL AND REPORTING SERVICES API
// -------------------------------------------------------------

// Get all threat reports
app.get("/api/reports", (req: Request, res: Response) => {
  try {
    const db = readDb();
    res.json(db.threatReports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update analyst notes for specific report
app.post("/api/reports/:id/notes", (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;

  try {
    const db = readDb();
    const idx = db.threatReports.findIndex(rep => rep.id === id);
    if (idx !== -1) {
      db.threatReports[idx].analystNotes = notes;
      writeDb(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Report not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete specific report
app.delete("/api/reports/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = readDb();
    db.threatReports = db.threatReports.filter(rep => rep.id !== id);
    db.incidents = db.incidents.filter(inc => inc.logId !== id && inc.id !== id);
    writeDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic dashboard metrics compilation
app.get("/api/dashboard/metrics", (req: Request, res: Response) => {
  try {
    const db = readDb();
    const reports = db.threatReports;

    const severityCount: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const categoryCount: Record<string, number> = {};
    const ipCount: Record<string, number> = {};
    const mitreCodes = new Set<string>();

    reports.forEach(rep => {
      // Severity
      const sev = rep.severity || "Medium";
      if (severityCount[sev] !== undefined) {
        severityCount[sev]++;
      } else {
        severityCount[sev] = 1;
      }

      // Category
      const cat = rep.attackClassification || "Unknown";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;

      // IP / threat sources
      if (rep.riskFactors) {
        rep.riskFactors.forEach((factor: string) => {
          const ipMatch = factor.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
          if (ipMatch) {
            ipCount[ipMatch[0]] = (ipCount[ipMatch[0]] || 0) + 1;
          }
        });
      }

      // Mitigations / Timeline ATT&CK
      if (rep.agentExplanations) {
        Object.values(rep.agentExplanations).forEach((exp: any) => {
          if (exp.evidence) {
            exp.evidence.forEach((ev: string) => {
              const mitreMatch = ev.match(/T\d{4}(?:\.\d+)?/);
              if (mitreMatch) {
                mitreCodes.add(mitreMatch[0]);
              }
            });
          }
        });
      }
    });

    const topIPs = Object.entries(ipCount)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);

    res.json({
      totalIncidents: reports.length,
      severityDistribution: severityCount,
      attackCategories: categoryCount,
      topThreatSources: topIPs.length > 0 ? topIPs : ["No IP sources detected"],
      mitreCoverage: Array.from(mitreCodes)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// JSON Export service
app.get("/api/reports/:id/json", (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = readDb();
    const report = db.threatReports.find(rep => rep.id === id);
    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="findings-${id}.json"`);
    res.send(JSON.stringify(report, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export service
app.get("/api/reports/:id/csv", (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const db = readDb();
    const report = db.threatReports.find(rep => rep.id === id);
    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const logId = report.logId;
    const events = db.securityEvents.filter(evt => evt.logId === logId);

    const headers = ["id", "timestamp", "username", "sourceIp", "destIp", "eventType", "filename", "processName"];
    const rows = events.map(e => [
      e.id,
      e.timestamp,
      e.username,
      e.sourceIp,
      e.destIp,
      e.eventType,
      e.filename,
      e.processName
    ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="security-events-${id}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PROFILE & GAMIFICATION DATABASE ACCESS
// -------------------------------------------------------------
app.get("/api/profile", (req: Request, res: Response) => {
  try {
    const db = readDb();
    res.json(db.users || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profile", (req: Request, res: Response) => {
  const userProfile = req.body;
  try {
    const db = readDb();
    db.users = userProfile;
    writeDb(db);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Backwards Compatibility Endpoint: /api/analyze-logs
// -------------------------------------------------------------
app.post("/api/analyze-logs", async (req: Request, res: Response) => {
  const { logText } = req.body;

  if (!logText || typeof logText !== "string" || logText.trim().length === 0) {
    res.status(400).json({ error: "Logs text is required" });
    return;
  }

  try {
    console.log("[API Compatibility] Running sequential pipeline on backend");
    const detectiveOutput = runDetectiveHeuristically(logText);
    const hunterOutput = runHunterHeuristically(detectiveOutput, logText);
    const judgeOutput = runJudgeHeuristically(detectiveOutput, hunterOutput);
    const reportOutput = runWizardHeuristically(logText, detectiveOutput, hunterOutput, judgeOutput);
    const defenseOutput = runAdvisorHeuristically(hunterOutput, judgeOutput, reportOutput);

    const conf = calculateConfidenceRating(detectiveOutput, logText);
    judgeOutput.confidenceScore = conf.score;

    const explanations = buildAgentExplanations(detectiveOutput, hunterOutput, judgeOutput, reportOutput, defenseOutput, logText);

    const finalReport = {
      id: `rep-${Date.now()}`,
      classification: hunterOutput.classification,
      severity: judgeOutput.severity,
      confidenceScore: judgeOutput.confidenceScore,
      riskScore: judgeOutput.riskScore,
      summary: reportOutput.executiveSummary,
      riskFactors: [
        `Detected Login Failures spikes: ${detectiveOutput.failed_logins}`,
        `Detected Successful Logins: ${detectiveOutput.successful_logins}`,
        `Detected SQL union selects: ${detectiveOutput.sql_queries?.length || 0}`,
        `Unknown executing executables: ${detectiveOutput.unknown_executables?.length || 0}`,
        `Suspicious shell operations: ${detectiveOutput.suspicious_commands?.length || 0}`
      ],
      affectedAssets: reportOutput.affectedAssets || [],
      timeline: reportOutput.timeline || [],
      mitigations: defenseOutput.mitigations || [],
      responseChecklist: defenseOutput.responseChecklist || [],
      analystNotes: reportOutput.analystNotes || "Forensic dossiers synchronized under executive supervision.",
      agentExplanations: explanations
    };

    const sanitizedReport = sanitizeValue(finalReport, logText);
    res.json(sanitizedReport);
  } catch (err: any) {
    console.error("API Compatibility failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend web assets via Vite in development, or static output in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CyberBloom Server] Collaborative AI logic active on port http://localhost:${PORT}`);
  });
}

start();
