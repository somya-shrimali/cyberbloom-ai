import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Smile, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  AlertOctagon, 
  Flame, 
  Compass, 
  Award,
  Bookmark
} from "lucide-react";
import { AcademyLesson } from "../types";

export default function AcademyPage() {
  const [activeLessonId, setActiveLessonId] = useState<string>("what-is-soc");

  const lessons: AcademyLesson[] = [
    {
      id: "what-is-soc",
      title: "What is SOC?",
      subtitle: "The Security Greenhouse Hub",
      summary: "Understand the foundational hub of cybersecurity—where digital guardians monitor, coordinate, and prune environmental dangers.",
      readTime: "3 min read",
      colorClass: "bg-[#e9d8fd]/40 border-[#e9d8fd]",
      accentColor: "text-purple-600",
      stickyNote: "💡 SOC Tip: A healthy Security Operations Center isn't just about software—it integrates people, processes, and collaborative AI to verify alerts.",
      illustrationType: "shield",
      polaroidCaption: "SOC Team Monitoring • Year 2026",
      detailedContent: {
        heading: "A Security Operations Center (SOC) is a centralized unit that deals with security issues on an organizational and technical level.",
        points: [
          { label: "Continuous Telemetry", text: "Guarantees 24/7 scanning of network boundaries and endpoint devices." },
          { label: "Coordinated Remediation", text: "Drafts immediate quarantine commands once attacks are confirmed." },
          { label: "Analyst Collaboration", text: "Envisions hybrid workflows where human expertise and AI models assess anomalies together." }
        ],
        analystProTip: "Treat warning triage like sorting seeds—invest in automated pipelines to silence non-critical spikes before they crowd out high-priority threat alerts."
      }
    },
    {
      id: "security-logs",
      title: "What are Security Logs?",
      subtitle: "The Forensic Root Files",
      summary: "Security logs are the digital rings of your system tree, chronologically recording every entry, connection, and query.",
      readTime: "4 min read",
      colorClass: "bg-[#ffd6e8]/40 border-[#ffd6e8]",
      accentColor: "text-pink-600",
      stickyNote: "📌 Log Fact: logs represent objective historical ground truths. Attackers try to delete them to hide their trails. Protect your log files!",
      illustrationType: "lens",
      polaroidCaption: "Syslog Ingest Pipeline • UTC Staging",
      detailedContent: {
        heading: "Security event logs document the historical actions, authentication failures, and data queries executed across systems.",
        points: [
          { label: "Authentication (PAM)", text: "Logs failed password attempts, invalid users, and sudden successful privilege overrides." },
          { label: "Network WAF Alerts", text: "Scans URL variables to verify if queries contain SQL code injection flags." },
          { label: "Process Audits", text: "Traces when new executable binaries launch from atypical, open directories like /Users/Public." }
        ],
        analystProTip: "Always enforce centralized log piping (e.g., SIEM feeds) so nodes cannot alter their local registries following an active compromise."
      }
    },
    {
      id: "threat-detection",
      title: "What is Threat Detection?",
      subtitle: "Weeding out malicious seeds",
      summary: "Learn how modern engines differentiate natural system anomalies from active, targeted human breaches.",
      readTime: "3 min read",
      colorClass: "bg-[#d6f4ff]/40 border-[#d6f4ff]",
      accentColor: "text-sky-600",
      stickyNote: "🔍 Detection Tip: Signature matching handles old, known Trojan, but behavioral tracing is required to isolate zero-day exploits.",
      illustrationType: "target",
      polaroidCaption: "MITRE ATT&CK Matrix Mapped",
      detailedContent: {
        heading: "Threat detection is the dynamic practice of analyzing telemetry data streams to catch attacks before they achieve exfiltration.",
        points: [
          { label: "Signature Checks", text: "Compares file MD5 structures against recognized global threat repositories." },
          { label: "Behavioral Analysis", text: "Identifies anomalies like a trusted employee downloading confidential files at 3 AM." },
          { label: "Correlation Rules", text: "Bridges WAF warnings, firewall locks, and LDAP accesses to piece together multi-step attacks." }
        ],
        analystProTip: "Utilize structured multi-agent structures to analyze logs sequentially. This produces explainable reasoning maps instead of single binary alerts."
      }
    },
    {
      id: "incident-response",
      title: "What is Incident Response?",
      subtitle: "Active Pruning & Remediation",
      summary: "Once a threat is confirmed, playbooks activate to isolate infected hosts, block egress routing, and patch entry vectors.",
      readTime: "4 min read",
      colorClass: "bg-[#fff4c2]/45 border-[#fff4c2]",
      accentColor: "text-amber-600",
      stickyNote: "🛡️ Containment Tip: Speed is absolute. Isolate infected endpoints immediately to dry up lateral network propagation lines.",
      illustrationType: "badge",
      polaroidCaption: "Quarantine Routine • Active Block",
      detailedContent: {
        heading: "Incident Response (IR) represents the organized blueprint of actions used to contain, mitigate, and recover from security breaches.",
        points: [
          { label: "Phase A: Containment", text: "Locks down host network interfaces and alters vulnerable identity states." },
          { label: "Phase B: Eradication", text: "Identifies and wipes malicious registry keys, trojans, and shell codes." },
          { label: "Phase C: Disaster Recovery", text: "Restores sanitized clean database states from secure offline backups." }
        ],
        analystProTip: "Pre-compile firewall boundary lock commands. High stress levels during active breaches lead to configuration mistakes."
      }
    },
    {
      id: "risk-assessment",
      title: "What is Risk Assessment?",
      subtitle: "Weighing Soil Hazard Indices",
      summary: "Evaluate vulnerability scores to help organizations balance security costs against risk probabilities.",
      readTime: "3 min read",
      colorClass: "bg-white border-[#2e1c14]/15",
      accentColor: "text-rose-500",
      stickyNote: "⚖️ Risk Fact: Risk = Threat × Vulnerability × Asset Value. Always prioritize securing high-value master servers over testing nodes.",
      illustrationType: "compass",
      polaroidCaption: "Risk Severity Evaluation Matrix",
      detailedContent: {
        heading: "Risk Assessment is the systematic calculation of threat probabilities combined with potential business impact metrics.",
        points: [
          { label: "Severity Scoring", text: "Measures overall payload danger (Low, Medium, High, Critical)." },
          { label: "Confidence Ratings", text: "Weights evidence certainty to prevent alarm fatigue." },
          { label: "Prioritization Playbooks", text: "Focuses response actions on critical business databases first." }
        ],
        analystProTip: "Audit risk levels continuously. A perimeter secure on Monday can become exposed on Tuesday due to a newly announced exploit."
      }
    }
  ];

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

  return (
    <div id="academy-page-root" className="max-w-6xl mx-auto py-10 px-6 md:px-12 bg-[#F7F1EB]">
      {/* Editorial Header */}
      <div id="academy-header" className="mb-12 text-center md:text-left border-b border-[#2e1c14]/10 pb-6">
        <span className="text-xs font-mono tracking-widest text-[#5d4b42]/80 uppercase block mb-1">
          FORENSIC CYBERSECURITY HANDBOOK
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2e1c14]">
          CyberBloom Academy
        </h2>
        <p className="text-[#5d4b42] text-sm font-light mt-1 max-w-2xl">
          Browse our vintage security notebook. Hover and click lesson modules to study foundational SOC concepts, log forensics, and risk estimation structures.
        </p>
      </div>

      <div id="academy-content-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Polaroid List Cards */}
        <div id="academy-polaroids-list" className="lg:col-span-4 space-y-6">
          <span className="text-[10px] font-mono tracking-wider text-[#5d4b42] block mb-2 uppercase">
            Browse Polaroid Topics
          </span>

          <div className="space-y-6">
            {lessons.map((lesson, idx) => {
              const isActive = activeLessonId === lesson.id;
              return (
                <motion.div
                  id={`academy-polaroid-card-${lesson.id}`}
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  whileHover={{ scale: 1.02, rotate: (idx % 2 === 0 ? 1 : -1) }}
                  className={`bg-white border border-[#2e1c14]/15 rounded-[24px] p-4 shadow-sm cursor-pointer transition-all ${
                    isActive ? "ring-2 ring-[#ffd6e8] shadow-md translate-x-1" : ""
                  }`}
                  style={{
                    transform: `rotate(${(idx - 2) * 1.5}deg)`,
                  }}
                >
                  {/* Photo area with illustration style color blocks */}
                  <div className={`aspect-video rounded-[16px] ${lesson.colorClass} border flex items-center justify-center relative overflow-hidden mb-3.5`}>
                    <div className="absolute top-2 left-2 text-[8px] font-mono tracking-widest text-[#5d4b42]/70 uppercase">
                      DIAGRAM {idx + 1}
                    </div>
                    
                    {/* Unique center icon representations */}
                    {lesson.illustrationType === "shield" && <ShieldCheck className="w-8 h-8 text-[#5d4b42]/80" />}
                    {lesson.illustrationType === "lens" && <Bookmark className="w-8 h-8 text-[#5d4b42]/80" />}
                    {lesson.illustrationType === "target" && <Flame className="w-8 h-8 text-[#5d4b42]/80" />}
                    {lesson.illustrationType === "badge" && <Award className="w-8 h-8 text-[#5d4b42]/80" />}
                    {lesson.illustrationType === "compass" && <Compass className="w-8 h-8 text-[#5d4b42]/80" />}
                  </div>

                  <span className="text-[9px] font-mono text-[#5d4b42]/60 uppercase">
                    {lesson.readTime}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#2e1c14] mt-1 leading-tight">
                    {lesson.title}
                  </h3>
                  <p className="text-[10.5px] text-[#5d4b42]/80 font-light mt-1 leading-relaxed truncate">
                    {lesson.summary}
                  </p>
                  
                  {/* Hand-written Polaroid Caption */}
                  <div className="text-center pt-3.5 border-t border-[#f5efe8]/60 mt-3">
                    <span className="font-serif italic text-[11px] text-[#5d4b42]/90 block">
                      &ldquo;{lesson.polaroidCaption}&rdquo;
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Polaroid Detailed Content & Handwritten Notes */}
        <div id="academy-active-inspector" className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              id="active-lesson-expanded-card"
              key={activeLessonId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#2e1c14]/12 rounded-[32px] p-6 md:p-8 shadow-sm relative overflow-hidden"
            >
              {/* Floral watermark background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#ffd6e8]/15 to-transparent pointer-events-none" />

              <div className="border-b border-[#2e1c14]/10 pb-5 mb-6">
                <span className="text-[10px] font-mono tracking-widest text-[#5d4b42]/80 uppercase block">
                  Interactive Lesson Notebook
                </span>
                <h1 className="font-serif font-bold text-3xl text-[#2e1c14] mt-2 mb-1">
                  {activeLesson.title}
                </h1>
                <p className={`text-xs italic font-serif ${activeLesson.accentColor} tracking-wide`}>
                  {activeLesson.subtitle}
                </p>
              </div>

              {/* Core lesson description */}
              <div className="space-y-6 text-xs leading-relaxed text-[#5d4b42] font-light">
                <p className="text-[13.5px] leading-relaxed text-[#4a3b32] font-normal">
                  {activeLesson.detailedContent.heading}
                </p>

                {/* Structured points bento style */}
                <div className="space-y-4 pt-1">
                  <h4 className="font-serif font-bold text-xs text-[#2e1c14] uppercase tracking-wider">
                    Core Security Dynamics
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {activeLesson.detailedContent.points.map((pt, i) => (
                      <div id={`point-card-${i}`} key={i} className="bg-[#f5efe8]/35 border border-[#2e1c14]/5 rounded-[24px] p-4 flex gap-3.5 items-start">
                        <div className="w-5 h-5 rounded-full bg-white border flex items-center justify-center text-[10px] text-[#2e1c14] font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <strong className="text-[#2e1c14] font-serif block text-xs">{pt.label}</strong>
                          <p className="text-[11px] text-[#5d4b42] font-light mt-0.5 leading-snug">{pt.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Handwritten Analyst advice block */}
                <div id="analyst-takeaway-block" className="pt-4.5 border-t border-[#f2eae1] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="font-serif font-bold text-[#2e1c14] text-[12px] block">Forensic Expert Advice</span>
                    <p className="text-[#5d4b42] font-light mt-1 text-[11.5px] leading-relaxed italic">
                      &ldquo;{activeLesson.detailedContent.analystProTip}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Draggable/Sticky Handwritten note decoration block */}
          <motion.div
            id="academy-sticky-note"
            initial={{ scale: 0.98, rotate: -0.5 }}
            animate={{ rotate: [-0.5, 0.5, -0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="sticky-note bg-[#fff4c2] text-[#2c1d11] p-5 rounded-[24px] border border-[#2e1c14]/12 max-w-md shadow-md text-xs leading-relaxed"
          >
            <div className="flex items-center gap-2 border-b border-[#2e1c14]/5 pb-2 mb-2.5 font-mono text-[9px] uppercase tracking-wider text-[#2e1c14]/70">
              <Sparkles className="w-3.5 h-3.5 text-[#5d4b42]" /> Hand-Annotated Notes
            </div>
            <p className="font-serif italic font-medium leading-relaxed pr-2">
              {activeLesson.stickyNote}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
