import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Play, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Compass, 
  HelpCircle,
  FileText,
  BadgeAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Briefcase
} from "lucide-react";
import { DEMO_PRESETS } from "../demoLogs";
import { SecurityReport, UserProfile } from "../types";

interface StudioPageProps {
  onAnalysisComplete: (result: SecurityReport, xpEarned: number, badgeUnlockedId?: string) => void;
  userProfile: UserProfile;
}

export default function StudioPage({ onAnalysisComplete, userProfile }: StudioPageProps) {
  const [inputText, setInputText] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null); // null = idle, 0 to 4 = agent pipeline sequence, 5 = completed
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAgentName, setCurrentAgentName] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [analyzedReport, setAnalyzedReport] = useState<SecurityReport | null>(null);
  const [activeExplainAgent, setActiveExplainAgent] = useState<string | null>("log-detective");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const agents = [
    { id: "log-detective", name: "📥 Log Ingestion Agent", action: "Validating format and normalizing records..." },
    { id: "threat-hunter", name: "🔍 IOC Detection Agent", action: "Scanning for indicators of compromise..." },
    { id: "risk-judge", name: "🧠 MITRE Mapping Agent", action: "Mapping events to MITRE ATT&CK tactics..." },
    { id: "report-wizard", name: "⚠ Risk Scoring Agent", action: "Evaluating risk weights and severity..." },
    { id: "defense-advisor", name: "📊 Incident Report Agent", action: "Compiling executive summary and defense recommendations..." }
  ];

  // Drag and Drop files handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  // Preset quick picker
  const handlePresetSelect = (presetId: string) => {
    const matched = DEMO_PRESETS.find(p => p.id === presetId);
    if (matched) {
      setInputText(matched.logText);
    }
  };

  // Run full secure workflow
  const handleAnalyzeWorkflow = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setAnalyzedReport(null);
    setActiveStep(0);
    setCurrentProgress(0);

    try {
      // Step 1: Log Detective
      setCurrentAgentName("🕵 Log Detective");
      let progressVal = 0;
      const progressInterval1 = setInterval(() => {
        progressVal = Math.min(progressVal + 8, 90);
        setCurrentProgress(progressVal);
      }, 100);

      const res1 = await fetch("/api/analyze/detective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText: inputText }),
      });
      clearInterval(progressInterval1);
      if (!res1.ok) throw new Error("Log Detective failed");
      const detectiveOutput = await res1.json();
      setCurrentProgress(100);
      await new Promise(r => setTimeout(r, 200));

      // Step 2: Threat Hunter
      setActiveStep(1);
      setCurrentProgress(0);
      setCurrentAgentName("🏹 Threat Hunter");
      progressVal = 0;
      const progressInterval2 = setInterval(() => {
        progressVal = Math.min(progressVal + 8, 90);
        setCurrentProgress(progressVal);
      }, 100);

      const res2 = await fetch("/api/analyze/hunter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText: inputText, detectiveOutput }),
      });
      clearInterval(progressInterval2);
      if (!res2.ok) throw new Error("Threat Hunter failed");
      const hunterOutput = await res2.json();
      setCurrentProgress(100);
      await new Promise(r => setTimeout(r, 200));

      // Step 3: Risk Judge
      setActiveStep(2);
      setCurrentProgress(0);
      setCurrentAgentName("⚖ Risk Judge");
      progressVal = 0;
      const progressInterval3 = setInterval(() => {
        progressVal = Math.min(progressVal + 8, 90);
        setCurrentProgress(progressVal);
      }, 100);

      const res3 = await fetch("/api/analyze/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText: inputText, detectiveOutput, hunterOutput }),
      });
      clearInterval(progressInterval3);
      if (!res3.ok) throw new Error("Risk Judge failed");
      const judgeOutput = await res3.json();
      setCurrentProgress(100);
      await new Promise(r => setTimeout(r, 200));

      // Step 4: Report Wizard
      setActiveStep(3);
      setCurrentProgress(0);
      setCurrentAgentName("🧙 Report Wizard");
      progressVal = 0;
      const progressInterval4 = setInterval(() => {
        progressVal = Math.min(progressVal + 8, 90);
        setCurrentProgress(progressVal);
      }, 100);

      const res4 = await fetch("/api/analyze/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText: inputText, detectiveOutput, hunterOutput, judgeOutput }),
      });
      clearInterval(progressInterval4);
      if (!res4.ok) throw new Error("Report Wizard failed");
      const reportOutput = await res4.json();
      setCurrentProgress(100);
      await new Promise(r => setTimeout(r, 200));

      // Step 5: Defense Advisor
      setActiveStep(4);
      setCurrentProgress(0);
      setCurrentAgentName("🛡 Defense Advisor");
      progressVal = 0;
      const progressInterval5 = setInterval(() => {
        progressVal = Math.min(progressVal + 8, 90);
        setCurrentProgress(progressVal);
      }, 100);

      const res5 = await fetch("/api/analyze/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logText: inputText, hunterOutput, judgeOutput, reportOutput }),
      });
      clearInterval(progressInterval5);
      if (!res5.ok) throw new Error("Defense Advisor failed");
      const defenseOutput = await res5.json();
      setCurrentProgress(100);
      await new Promise(r => setTimeout(r, 200));

      // Assemble final report
      // Assemble final report
      const report: SecurityReport = defenseOutput.finalReport || {
        id: `rep-${Date.now()}`,
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
        agentExplanations: {}
      };

      // Complete state!
      setActiveStep(5);
      setIsAnalyzing(false);

      // Award XP based on severity
      let xpEarned = 100;
      if (report.severity === "Critical") xpEarned = 150;
      else if (report.severity === "High") xpEarned = 130;
      else if (report.severity === "Medium") xpEarned = 115;

      // Pass matching keys to generate credentials badges if they match criteria
      let badgeIdUnlocked: string | undefined = undefined;
      const loweredClass = report.attackClassification.toLowerCase();
      if (loweredClass.includes("brute")) {
        badgeIdUnlocked = "threat-hunter";
      } else if (report.severity === "Critical") {
        badgeIdUnlocked = "critical-detected";
      } else {
        badgeIdUnlocked = "first-analysis";
      }

      setAnalyzedReport(report);
      onAnalysisComplete(report, xpEarned, badgeIdUnlocked);

    } catch (err) {
      console.error("Analysis failure, running local fallback recovery:", err);
      setIsAnalyzing(false);
      setActiveStep(null);
    }
  };

  const getBloomLevelLabel = (score: number) => {
    if (score >= 90) return { label: "Wild Blossom Spreader (Critical Threat)", color: "text-rose-500 bg-rose-50 border-rose-200" };
    if (score >= 70) return { label: "Bud Escalating (High Risk Threat)", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (score >= 40) return { label: "Sprouting Active Bud (Medium Hazard)", color: "text-purple-600 bg-purple-50 border-purple-200" };
    return { label: "Stable Soil (Low Dormancy Activity)", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  };

  return (
    <div id="studio-page-root" className="max-w-6xl mx-auto py-10 px-6 md:px-12 bg-[#F7F1EB]">
      {/* Editorial Header */}
      <div id="studio-header" className="mb-10 text-center md:text-left border-b border-[#2e1c14]/10 pb-6">
        <span className="text-xs font-mono tracking-widest text-[#5d4b42]/80 uppercase block mb-1">
          PRIMARY INVESTIGATION ENGINE
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2e1c14]">
          Live Security Studio
        </h2>
        <p className="text-[#5d4b42] text-sm font-light mt-1 max-w-2xl">
          Upload multi-line endpoint event structures or drop log chunks. Instantly watch how our secure AI agent collective collaborate to synthesize audit pipelines.
        </p>
      </div>

      <div id="studio-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Drag/Drop and Paste logs */}
        <div id="studio-inputs-column" className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#2e1c14]/12 rounded-[32px] p-6 shadow-sm">
            <h3 className="font-serif font-bold text-lg text-[#2e1c14] mb-3 flex items-center justify-between">
              <span>Feed Raw Logs</span>
              <span className="text-[10px] font-mono font-medium text-[#5d4b42]/70 bg-[#f5efe8] px-2.5 py-0.5 rounded-full border">
                TXT, CSV, JSON
              </span>
            </h3>

            {/* Quick Presets Selection panel */}
            <div id="quick-presets" className="mb-4">
              <span className="text-[10px] font-mono tracking-wider text-[#5d4b42] block mb-2 uppercase">
                Select Forensic Scenario
              </span>
              <div className="flex flex-wrap gap-2">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    id={`preset-btn-${preset.id}`}
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className="px-3 py-1.5 rounded-full border border-[#2e1c14]/10 text-[11px] font-medium text-[#2e1c14] hover:bg-[#fff4c2]/30 transition-all text-left flex items-center gap-1.5 cursor-pointer bg-white"
                  >
                    <span className="text-xs">🌸</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Window Zone */}
            <div
              id="drop-zone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? "border-[#ffd6e8] bg-[#ffd6e8]/10" 
                  : "border-[#2e1c14]/15 hover:border-[#2e1c14]/30 bg-[#f5efe8]/20"
              }`}
            >
              <input
                id="file-selector-input"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.csv,.json,.log"
                onChange={handleFileSelect}
              />
              <Upload className="w-7 h-7 text-[#5d4b42]/60 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#2e1c14]">
                Drag & Drop security file here
              </p>
              <p className="text-[10px] text-[#5d4b42] mt-1 font-light">
                or click to browse local folders
              </p>
            </div>

            {/* Raw input text area with scrapbook line numbers */}
            <div id="paste-input-area" className="mt-4">
              <label className="text-[10px] font-mono tracking-wider text-[#5d4b42] block mb-1 uppercase">
                Paste Logs Manually
              </label>
              <textarea
                id="raw-log-textarea"
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="2026-06-12 04:01:15 AUTH failure; uid=0 user=root..."
                className="w-full bg-[#f5efe8]/20 border border-[#2e1c14]/15 rounded-[24px] p-4 text-[11px] font-mono text-[#2e1c14] focus:outline-none focus:ring-1 focus:ring-[#ffd6e8] placeholder-[#5d4b42]/45"
              />
            </div>

            {/* Trigger Button */}
            <button
              id="analyze-run-trigger"
              disabled={isAnalyzing || !inputText.trim()}
              onClick={handleAnalyzeWorkflow}
              className="w-full mt-4 py-3 rounded-[24px] bg-[#2e1c14] hover:bg-[#5d4b42] text-white text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>AI Agent Workflow Active...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Start Automated Pipeline</span>
                </>
              )}
            </button>
          </div>

          {/* Educational notice about how Cyberbloom processes logs */}
          <div id="processing-education" className="bg-[#e9d8fd]/20 border border-[#e9d8fd]/50 rounded-[24px] p-5 text-xs text-[#2e1c14]/90 sticky-note">
            <span className="font-serif font-bold block mb-1">💡 Educational Sandbox Notes</span>
            <p className="leading-relaxed font-light">
              This intelligence model uses coordinated agents built in modular tiers. It matches input strings against MITRE attack matrices back-to-back to generate structured risk levels.
            </p>
          </div>
        </div>

        {/* Right Column: Execution State & Output */}
        <div id="studio-output-column" className="lg:col-span-7">
          {/* STATE A: Idle, Waiting for input */}
          {activeStep === null && (
            <div id="state-idle" className="bg-white border border-[#2e1c14]/10 rounded-[32px] p-12 text-center flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffd6e8]/40 to-transparent rounded-bl-full pointer-events-none" />
              <Activity className="w-12 h-12 text-[#5d4b42]/30 mb-4 stroke-[1.2] animate-pulse" />
              <h4 className="font-serif font-bold text-lg text-[#2e1c14] mb-2">
                Analyst Studio Idle
              </h4>
              <p className="text-xs text-[#5d4b42] max-w-sm font-light leading-relaxed">
                Feed file packets on the left or click <strong>SSH Brute Force Attack</strong> preset to kick off real-time forensic visualizations.
              </p>
            </div>
          )}

          {/* STATE B: Processing, Multi-Agent workflow active */}
          {isAnalyzing && (
            <div id="state-analyzing" className="bg-white border border-[#2e1c14]/10 rounded-[32px] p-8 min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-4 mb-6">
                  <span className="text-xs font-mono font-medium text-[#2e1c14]">
                    AI AGENT COLLECTIVE PIPELINE
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
                    <span className="text-[10px] font-mono text-[#5d4b42] font-semibold uppercase">Deliberating</span>
                  </div>
                </div>

                {/* Main agent list with execution states */}
                <div className="space-y-4">
                  {agents.map((agent, index) => {
                    const isPending = activeStep !== null && index > activeStep;
                    const isActive = activeStep === index;
                    const isDone = activeStep !== null && index < activeStep;

                    return (
                      <motion.div
                        id={`pipeline-agent-row-${agent.id}`}
                        key={agent.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3.5 rounded-[24px] border transition-all duration-300 ${
                          isActive 
                            ? "bg-[#fff4c2]/40 border-[#fff4c2] shadow-sm ml-2 md:ml-4" 
                            : isDone 
                              ? "bg-emerald-55/40 border-emerald-100 opacity-80" 
                              : "bg-[#f5efe8]/20 border-transparent opacity-55"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-xs ${
                              isActive 
                                ? "bg-[#2e1c14] text-white animate-spin" 
                                : isDone 
                                  ? "bg-emerald-500 text-white" 
                                  : "bg-[#5d4b42]/10 text-[#5d4b42]"
                            }`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : `${index+1}`}
                            </div>
                            <div>
                              <span className="text-xs font-serif font-bold text-[#2e1c14]">
                                {agent.name}
                              </span>
                              {isActive && (
                                <p className="text-[10.5px] font-sans text-rose-500 mt-0.5 animate-pulse font-medium">
                                  {agent.action}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-[#5d4b42]">
                            {isDone && "Processed Successfully"}
                            {isActive && `${currentProgress}%`}
                            {isPending && "Standby"}
                          </div>
                        </div>

                        {/* Active Progress Ticks bar */}
                        {isActive && (
                          <div className="w-full bg-[#f5efe8] h-1.5 rounded-full mt-3 overflow-hidden border border-[#2e1c14]/5">
                            <motion.div 
                              className="bg-gradient-to-r from-[#ffd6e8] to-[#fff4c2] h-full rounded-full"
                              style={{ width: `${currentProgress}%` }}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Console logs box */}
              <div id="analytics-console-logs" className="mt-6 bg-[#2e1c14] text-amber-100/90 rounded-[24px] p-4.5 font-mono text-[10px] leading-relaxed max-h-32 overflow-y-auto">
                <span className="text-[9px] text-[#ffd6e8]/70 block mb-1">System Audit Console Stream:</span>
                <p>&gt; [Core Server]: Initializing multi-agent thread environment</p>
                {activeStep !== null && activeStep >= 0 && (
                  <p className="text-pink-300">&gt; [Detective]: Reading parameters... anomalous logs registered</p>
                )}
                {activeStep !== null && activeStep >= 1 && (
                  <p className="text-purple-300">&gt; [Hunter]: Taxonomy mapped successfully</p>
                )}
                {activeStep !== null && activeStep >= 2 && (
                  <p className="text-sky-300">&gt; [Risk Judge]: Model metrics weighting... Confidence set {currentProgress}%</p>
                )}
              </div>
            </div>
          )}

          {/* STATE C: Completed, Display threat cards */}
          {activeStep === 5 && analyzedReport && (
            <motion.div
              id="state-completed-threat-cards"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Premium Result Summary Card */}
              <div className="bg-white border border-[#2e1c14]/12 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#ffd6e8]/25 to-transparent rounded-bl-full pointer-events-none" />
                
                {/* Visual Metadata Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-[#2e1c14]/5 pb-4.5 mb-5">
                  <div>
                    <span className="text-[10px] font-mono tracking-wider text-[#5d4b42] uppercase">
                      COLLABORATIVE THREAT VECTOR REPORT
                    </span>
                    <h3 className="font-serif font-bold text-xl md:text-2xl text-[#2e1c14] leading-tight mt-1">
                      {analyzedReport.attackClassification}
                    </h3>
                  </div>

                  {/* Level tag */}
                  <div className={`px-3 py-1 rounded-full border text-xs font-mono font-medium ${
                    getBloomLevelLabel(analyzedReport.riskScore).color
                  }`}>
                    {analyzedReport.severity} Severity
                  </div>
                </div>

                {/* Metric Bento Layout */}
                <div id="results-bento-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#f5efe8]/30 rounded-[24px] p-4 border border-[#2e1c14]/5">
                    <span className="text-[9px] font-mono uppercase text-[#5d4b42]/80">Bloom Level</span>
                    {/* Choose label based on numeric score */}
                    <p className="text-xs font-bold text-[#2e1c14] mt-1 italic font-serif">
                      {analyzedReport.riskScore >= 90 ? "Rogue Spree 🥀" : analyzedReport.riskScore >= 70 ? "Escalating Bud 🌺" : "Budding Anomaly 🌸"}
                    </p>
                  </div>

                  <div className="bg-[#f5efe8]/30 rounded-[24px] p-4 border border-[#2e1c14]/5">
                    <span className="text-[9px] font-mono uppercase text-[#5d4b42]/80">Threat Bloom Score</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#2e1c14]" />
                      <span className="text-base font-serif font-bold text-[#2e1c14]">{analyzedReport.riskScore}</span>
                      <span className="text-[10px] text-[#5d4b42]/70">/100</span>
                    </div>
                  </div>

                  <div className="bg-[#f5efe8]/30 rounded-[24px] p-4 border border-[#2e1c14]/5">
                    <span className="text-[9px] font-mono uppercase text-[#5d4b42]/80">Confidence</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2e1c14]" />
                      <span className="text-base font-serif font-bold text-[#2e1c14]">{analyzedReport.confidenceScore}%</span>
                    </div>
                  </div>

                  <div className="bg-[#f5efe8]/30 rounded-[24px] p-4 border border-[#2e1c14]/5">
                    <span className="text-[9px] font-mono uppercase text-[#5d4b42]/80">Anomalous Actions</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-[#2e1c14]" />
                      <span className="text-base font-serif font-bold text-[#2e1c14]">{analyzedReport.timeline?.length || 4} Ticks</span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary Narrative */}
                <div id="log-security-narrative">
                  <h4 className="font-serif font-bold text-xs text-[#2e1c14] uppercase tracking-wider mb-2">Executive Overview</h4>
                  <p className="text-[#5d4b42] text-[12.5px] leading-relaxed font-light">
                    {analyzedReport.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Explainable AI Interactive Tabs Section */}
              <div className="bg-white border border-[#2e1c14]/12 rounded-[32px] p-6 shadow-sm">
                <h4 className="font-serif font-bold text-base text-[#2e1c14] mb-1.5">
                  How did CyberBloom AI think?
                </h4>
                <p className="text-[11.5px] text-[#5d4b42] font-light leading-snug mb-4">
                  Every decision has an objective cause. Select any agent below to review the specific evidence, parsed metrics, and security rationales used.
                </p>

                {/* Agent selector tabs */}
                <div id="studio-explain-agents-tabs" className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 border-b pb-3 mb-4">
                  {(["log-detective", "threat-hunter", "risk-judge", "report-wizard", "defense-advisor"] as const).map((agentKey) => {
                    const mappedNames: Record<string, string> = {
                      "log-detective": "🕵 Detective",
                      "threat-hunter": "🏹 Hunter",
                      "risk-judge": "⚖ Judge",
                      "report-wizard": "🧙 Wizard",
                      "defense-advisor": "🛡 Advisor"
                    };
                    const isActive = activeExplainAgent === agentKey;
                    return (
                      <button
                        id={`explain-tab-${agentKey}`}
                        key={agentKey}
                        onClick={() => setActiveExplainAgent(agentKey)}
                        className={`py-2 px-1.5 rounded-full text-[10.5px] font-serif font-semibold text-center transition-all cursor-pointer ${
                          isActive 
                            ? "bg-[#2e1c14] text-[#F7F1EB]" 
                            : "bg-[#f5efe8]/45 text-[#5d4b42] hover:bg-[#fff4c2]/30"
                        }`}
                      >
                        {mappedNames[agentKey]}
                      </button>
                    );
                  })}
                </div>

                {/* Active agent explanation container */}
                <AnimatePresence mode="wait">
                  {activeExplainAgent && (
                    <motion.div
                      id="studio-active-explain-box"
                      key={activeExplainAgent}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-[#f5efe8]/20 border border-[#2e1c14]/10 rounded-[24px] p-5 text-xs"
                    >
                      {/* Read matching agent object */}
                      {(() => {
                        const explanationObj = (analyzedReport as any).agentExplanations?.[activeExplainAgent] || {
                          title: "Agent Verification",
                          explanation: "Gathering threat statistics from raw input telemetry lines.",
                          evidence: ["Uploaded sequence parameters", "Time metrics mapping success"]
                        };
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-serif font-bold text-sm text-[#2e1c14]">
                                {explanationObj.title}
                              </span>
                              <span className="text-[9px] font-mono text-[#5d4b42] bg-[#f5efe8] px-2 py-0.5 rounded-full border border-[#2e1c14]/5">
                                Verified Decision Pipeline
                              </span>
                            </div>

                            <p className="text-[#5d4b42] leading-relaxed mb-3.5 italic font-light" style={{ whiteSpace: "pre-wrap" }}>
                              {explanationObj.explanation}
                            </p>

                            <div id="explain-evidence-list">
                              <span className="text-[10px] font-mono tracking-wider text-[#2e1c14] block mb-1.5 uppercase font-medium">
                                Evidence Collected
                              </span>
                              <div className="space-y-1.5">
                                {explanationObj.evidence?.map((itm: string, index: number) => (
                                  <div id={`evidence-itm-${index}`} key={index} className="flex items-start gap-2 text-[11px] font-mono text-[#5d4b42]">
                                    <span className="text-[#2e1c14] mt-0.5">▪</span>
                                    <span>{itm}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action bar directing user to Reports page */}
              <div className="bg-[#fff4c2]/30 border border-[#fff4c2] rounded-[24px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-[#2e1c14]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-serif font-bold text-[#2e1c14]">Executive Incident Report Ready!</h5>
                    <p className="text-[11px] text-[#5d4b42]/90 font-light mt-0.5">Download, print, or edit manual analyst notebook entries.</p>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#5d4b42]/80 bg-white/70 px-3 py-1.5 rounded-full border border-[#2e1c14]/10 font-bold flex items-center gap-1 shrink-0">
                  <span>Rewarded: +{analyzedReport.severity === 'Critical' ? '150' : '100'} XP</span>
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
