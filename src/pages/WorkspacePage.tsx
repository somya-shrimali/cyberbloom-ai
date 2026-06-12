import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Search, 
  Crosshair, 
  AlertTriangle, 
  BookOpen, 
  ShieldCheck, 
  ArrowDown, 
  HelpCircle,
  FileCode,
  Network,
  Cpu,
  Bookmark
} from "lucide-react";

interface WorkspaceNode {
  id: string;
  number: string;
  name: string;
  tagline: string;
  icon: any;
  colorClass: string;
  colorBorder: string;
  role: string;
  whyDetails: string;
  evidenceUsed: string[];
  tips: string;
  mitreMatch?: string;
}

export default function WorkspacePage() {
  const [activeNodeId, setActiveNodeId] = useState<string>("log-detective");

  const nodes: WorkspaceNode[] = [
    {
      id: "raw-upload",
      number: "Step 01",
      name: "Log Drop Zone",
      tagline: "Standardization of unstructured forensic logs",
      icon: Upload,
      colorClass: "bg-[#f5efe8] text-[#5d4b42]",
      colorBorder: "border-[#2e1c14]/15",
      role: "Inputs of raw text strings, syslogs, application errors, WAF records, or firewall dumps are formatted into chronologically aligned events.",
      whyDetails: "Security telemetry usually arrives in disjointed, heterogeneous formats list structures. Normalizing timestamps to a standard ISO-8601 timeline ensures later agents don't suffer correlation lag.",
      evidenceUsed: ["Plain-text system files", "API logs / raw strings", "Metadata tags", "ISO Timestamps"],
      tips: "Drives standard format extraction for Log Detective parsing queues.",
    },
    {
      id: "log-detective",
      number: "Step 02",
      name: "Log Detective",
      tagline: "Heuristics and anomaly parsing",
      icon: Search,
      colorClass: "bg-[#ffd6e8]/45 text-[#2e1c14]",
      colorBorder: "border-[#ffd6e8]",
      role: "Parses structured logs to detect timing density changes, rapid sequential runs, access anomalies, or foreign proxy routing points.",
      whyDetails: "Identifies anomalies in client sessions. It highlights failures followed abnormally fast by high-privilege access, raising alerts for root or admin activities.",
      evidenceUsed: ["pam_unix auth signatures", "WAF parameter arrays", "Endpoint-AV process launch logs", "Network byte sizes"],
      tips: "Translates raw characters into logical events with explicit evidence files.",
    },
    {
      id: "threat-hunter",
      number: "Step 03",
      name: "Threat Hunter",
      tagline: "Taxonomy classification & threat matching",
      icon: Crosshair,
      colorClass: "bg-[#e9d8fd]/45 text-[#2e1c14]",
      colorBorder: "border-[#e9d8fd]",
      role: "Aligns raw anomalies directly with standard MITRE ATT&CK vectors and OWASP guidelines.",
      whyDetails: "Classifies vectors (Brute Force, Insider threat, Malware Beaconing, SQL injection). This helps incident response teams recognize attacker intentions and techniques.",
      evidenceUsed: ["MITRE T1110 (Brute Force)", "MITRE T1567 (Exfiltration over Web)", "MITRE T1071 (C2 Protocols)", "OWASP SQL Injection UNION selectors"],
      tips: "Maps raw events into structured threat classifications with targeted MITRE categories.",
    },
    {
      id: "risk-judge",
      number: "Step 04",
      name: "Risk Judge",
      tagline: "Severity evaluation and confidence metrics",
      icon: AlertTriangle,
      colorClass: "bg-[#fff4c2]/45 text-[#2e1c14]",
      colorBorder: "border-[#fff4c2]",
      role: "Weights threat features dynamically. Assigns quantitative Risk Scores (0-100), Severity (Low-Critical), and Confidence ratings.",
      whyDetails: "Prevents warning fatigue. It filters noise by checking if credentials matched successfully, or looking for repeat events within narrow windows to distinguish targeted attacks from casual port-scans.",
      evidenceUsed: ["Repetitive event count parameters", "Privilege levels active", "Antivirus thread-injection alerts", "WAF bypass policies"],
      tips: "Calculates an objective, transparent threat score (0-100) to prioritize actions.",
    },
    {
      id: "report-wizard",
      number: "Step 05",
      name: "Report Wizard",
      tagline: "CISO-ready editorial documentation summaries",
      icon: BookOpen,
      colorClass: "bg-[#d6f4ff]/45 text-[#2e1c14]",
      colorBorder: "border-[#d6f4ff]",
      role: "Chronologically synthesizes details into cohesive executive summaries, affected assets catalogs, and impact reviews.",
      whyDetails: "Saves hours in write-ups. It connects information from all other agents to draft clear, concise event narratives suited for senior leadership.",
      evidenceUsed: ["Aggregated step outcomes", "Exploited database keys", "Process MD5 file hashes", "Active user LDAP directories"],
      tips: "Creates standard, readable printout records of security incidents.",
    },
    {
      id: "defense-advisor",
      number: "Step 06",
      name: "Defense Advisor",
      tagline: "Proactive mitigation and reaction checklists",
      icon: ShieldCheck,
      colorClass: "bg-[#fff4c2]/45 text-[#2e1c14]",
      colorBorder: "border-[#fff4c2]",
      role: "Formulates containment tasks, active routing bans, identity roll instructions, and PowerShell or SSH lockdown commands.",
      whyDetails: "Ensures secure quarantine. It drafts practical, step-by-step checklists to block attacker IPs at the firewall edge and terminate active rogue user login tokens.",
      evidenceUsed: ["IP routing records", "LDAP user directories", "WAF configuration scripts", "Registry run strings"],
      tips: "Outputs actionable command commands and remediation steps.",
    }
  ];

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[1];

  return (
    <div id="workspace-page-root" className="max-w-6xl mx-auto py-10 px-6 md:px-12 bg-[#F7F1EB]">
      {/* Editorial Header */}
      <div id="workspace-header" className="mb-10 border-b border-[#2e1c14]/10 pb-6 text-center md:text-left">
        <span className="text-xs font-mono tracking-widest text-[#5d4b42]/80 uppercase block mb-1">
          STUDIO ENGINE PLATFORM ARCHITECTURE
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2e1c14]">
          How CyberBloom Thinks
        </h2>
        <p className="text-[#5d4b42] text-sm font-light mt-1 max-w-2xl">
          We believe in Explainable AI. Our cooperative agent pipeline is not a black box—every phase cascades logical insights iteratively down the chain. Click on any step in the interactive flow below to explore its role.
        </p>
      </div>

      <div id="workspace-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive cascading visual flow diagram */}
        <div id="workspace-flow-diagram" className="lg:col-span-5 space-y-4">
          <span className="text-[10px] font-mono tracking-wider text-[#5d4b42] block mb-2 uppercase">
            Interactive Workflow Architecture
          </span>

          <div className="relative pl-4 border-l-2 border-[#2e1c14]/10 select-none space-y-4">
            {nodes.map((node, i) => {
              const IconComponent = node.icon;
              const isActive = activeNodeId === node.id;
              
              return (
                <div key={node.id} className="relative group">
                  {/* Floating bubble icon indicator on the timeline bar */}
                  <div className={`absolute left-[-25px] top-6 w-4 h-4 rounded-full border-2 border-[#F7F1EB] transition-colors duration-300 ${
                    isActive ? "bg-[#2e1c14]" : "bg-[#bfb0a6]"
                  }`} />

                  {/* Node trigger card panel */}
                  <button
                    id={`workflow-node-tab-${node.id}`}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`w-full text-left p-4 rounded-[24px] border transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? `bg-white ${node.colorBorder} shadow-md scale-[1.02] translate-x-2` 
                        : "bg-white/60 hover:bg-white border-[#2e1c14]/10"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center ${node.colorClass}`}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono tracking-wider text-[#5d4b42]/70 uppercase block">
                          {node.number} — {node.tagline}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#2e1c14] mt-0.5">
                          {node.name}
                        </h4>
                      </div>
                    </div>
                  </button>
                  
                  {/* Visual connector arrow */}
                  {i < nodes.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowDown className="w-3.5 h-3.5 text-[#2e1c14]/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Deep-dive Polaroid & explanations card */}
        <div id="workspace-explanation-panel" className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              id="active-explanation-card"
              key={activeNodeId}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#2e1c14]/12 rounded-[32px] p-6.5 shadow-sm relative overflow-hidden"
            >
              {/* Scrapbook note background graphic */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#fff4c2]/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#ffd6e8]/10 to-transparent pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#2e1c14]/5 pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-mono text-[#5d4b42] uppercase bg-[#f5efe8] px-2 py-0.5 rounded border border-[#2e1c14]/5">
                    {activeNode.number} Architecture Card
                  </span>
                  <h3 className="font-serif font-bold text-2xl text-[#2e1c14] leading-tight mt-1.5">
                    {activeNode.name}
                  </h3>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeNode.colorClass}`}>
                  {React.createElement(activeNode.icon, { className: "w-6 h-6" })}
                </div>
              </div>

              {/* Functional description */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#2e1c14] uppercase tracking-wider mb-1.5">Core Function & Role</h4>
                  <p className="text-[#5d4b42] text-[13px] font-light leading-relaxed">
                    {activeNode.role}
                  </p>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-xs text-[#2e1c14] uppercase tracking-wider mb-1.5">Why does this happen?</h4>
                  <p className="text-[#5d4b42] text-[13px] font-light leading-relaxed">
                    {activeNode.whyDetails}
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="font-serif font-bold text-xs text-[#2e1c14] uppercase tracking-wider mb-2">Evidence & Features Tracked</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeNode.evidenceUsed.map((ev, idx) => (
                      <div id={`evidence-pill-${idx}`} key={idx} className="bg-[#f5efe8]/45 border border-[#2e1c14]/5 rounded-[24px] px-3.5 py-2 flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-[#5d4b42]/80 shrink-0" />
                        <span className="text-[11px] font-mono text-[#2e1c14]">{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pro Analyst Tip Stick Note block */}
              <div className="mt-6.5 pt-4.5 border-t border-[#f5efe8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-serif font-bold text-[#2e1c14] block">Analyst Takeaway</span>
                  <p className="text-[#5d4b42] font-light mt-0.5 text-[11.5px] leading-snug">
                    {activeNode.tips}
                  </p>
                </div>
                <div className="bg-[#fff4c2] text-[#2c1d11] px-3.5 py-1.5 rounded-xl border border-[#2e1c14]/10 font-mono text-[10px] font-bold text-center shrink-0 shadow-sm">
                  Cooperative Tier
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
