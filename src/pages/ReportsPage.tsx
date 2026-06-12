import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Printer, 
  Download, 
  Save, 
  FileText, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Edit3, 
  Terminal, 
  ArrowRight,
  TrendingUp,
  Bookmark,
  Activity,
  Trash2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { SecurityReport } from "../types";

interface ReportsPageProps {
  currentReport: SecurityReport | null;
  onSaveReportNotes: (updatedNotes: string) => void;
  onNavigateToStudio: () => void;
}

export default function ReportsPage({ currentReport, onSaveReportNotes, onNavigateToStudio }: ReportsPageProps) {
  const [reportsList, setReportsList] = useState<SecurityReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  
  const [notesText, setNotesText] = useState("");
  const [checklist, setChecklist] = useState<{ task: string; completed: boolean }[]>([]);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [activeExplainAgent, setActiveExplainAgent] = useState<string>("log-detective");
  
  // Interactive timeline step detail popup state
  const [activeTimelineIdx, setActiveTimelineIdx] = useState<number | null>(null);

  const fetchReports = () => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(data => {
        setReportsList(data);
        if (currentReport) {
          const found = data.find((r: any) => r.id === currentReport.id);
          setSelectedReport(found || currentReport);
        }
      })
      .catch(err => console.error("Error fetching reports:", err));

    fetch("/api/dashboard/metrics")
      .then(res => res.json())
      .then(data => setDashboardMetrics(data))
      .catch(err => console.error("Error fetching metrics:", err));
  };

  useEffect(() => {
    fetchReports();
  }, [currentReport]);

  useEffect(() => {
    if (selectedReport) {
      setNotesText(selectedReport.analystNotes || "");
      setChecklist(selectedReport.responseChecklist || []);
      setActiveTimelineIdx(null);
    }
  }, [selectedReport]);

  const handleToggleCheck = (index: number) => {
    const updated = [...checklist];
    updated[index].completed = !updated[index].completed;
    setChecklist(updated);
  };

  const handleSaveNotes = () => {
    if (!selectedReport) return;

    // Save notes to database
    fetch(`/api/reports/${selectedReport.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesText })
    })
    .then(res => {
      if (res.ok) {
        setIsSavedAlert(true);
        setTimeout(() => setIsSavedAlert(false), 2000);
        onSaveReportNotes(notesText);
        // Refresh local report copy
        setSelectedReport(prev => prev ? { ...prev, analystNotes: notesText } : null);
      }
    })
    .catch(err => console.error("Error saving notes:", err));
  };

  const handleDeleteReport = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this threat report?")) {
      fetch(`/api/reports/${reportId}`, { method: "DELETE" })
        .then(res => {
          if (res.ok) {
            if (selectedReport?.id === reportId) {
              setSelectedReport(null);
            }
            fetchReports();
          }
        })
        .catch(err => console.error("Error deleting report:", err));
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const downloadJson = () => {
    if (!selectedReport) return;
    window.open(`/api/reports/${selectedReport.id}/json`, "_blank");
  };

  const downloadCsv = () => {
    if (!selectedReport) return;
    window.open(`/api/reports/${selectedReport.id}/csv`, "_blank");
  };

  return (
    <div id="reports-page-root" className="max-w-7xl mx-auto py-10 px-6 md:px-12 bg-[#F7F1EB]">
      {/* Editorial Header */}
      <div id="reports-header" className="mb-10 text-center md:text-left border-b border-[#2e1c14]/10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#5d4b42]/80 uppercase block mb-1">
            EXECUTIVE DOCKET ARCHIVE & ANALYTICS
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2e1c14]">
            Threat Reports Studio
          </h2>
          <p className="text-[#5d4b42] text-sm font-light mt-1">
            Persistent incident history, active threat intelligence matching, and ATT&CK metrics.
          </p>
        </div>

        {selectedReport && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 no-print">
            <button
              id="print-report-btn"
              onClick={handleTriggerPrint}
              className="px-3.5 py-1.5 border rounded-xl hover:bg-white text-xs font-medium text-[#2e1c14] border-[#2e1c14]/12 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer bg-white/70"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            <button
              id="export-json-btn"
              onClick={downloadJson}
              className="px-3.5 py-1.5 border rounded-xl hover:bg-white text-xs font-medium text-[#2e1c14] border-[#2e1c14]/12 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer bg-white/70"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={downloadCsv}
              className="px-3.5 py-1.5 border rounded-xl hover:bg-white text-xs font-medium text-[#2e1c14] border-[#2e1c14]/12 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer bg-white/70"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              id="save-report-notes-btn"
              onClick={handleSaveNotes}
              className="px-4 py-1.5 rounded-xl bg-[#2e1c14] hover:bg-[#5d4b42] text-xs font-medium text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Action Plan</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: 2 Columns (Sidebar + Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sidebar (No print during window.print()) */}
        <div className="lg:col-span-4 space-y-6 no-print">
          
          {/* Dashboard Summary Widget */}
          <div className="bg-white border border-[#2e1c14]/10 rounded-[28px] p-5.5 shadow-sm">
            <h3 className="font-serif font-bold text-sm text-[#2e1c14] mb-3 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
              <span>Workspace Analytics</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#f5efe8]/45 p-3 rounded-2xl border border-[#2e1c14]/5 text-center">
                <span className="text-[10px] font-mono text-[#5d4b42]/80 uppercase block">Total Alerts</span>
                <span className="text-xl font-serif font-bold text-[#2e1c14]">{dashboardMetrics?.totalIncidents || reportsList.length}</span>
              </div>
              <div className="bg-[#f5efe8]/45 p-3 rounded-2xl border border-[#2e1c14]/5 text-center">
                <span className="text-[10px] font-mono text-[#5d4b42]/80 uppercase block">MITRE Techs</span>
                <span className="text-xl font-serif font-bold text-[#2e1c14]">{dashboardMetrics?.mitreCoverage?.length || 0}</span>
              </div>
            </div>

            {/* Severity Breakdown tags */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-[#5d4b42] uppercase block tracking-wider mb-1">Severity Distribution</span>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded-full">
                  Crit: {dashboardMetrics?.severityDistribution?.Critical || 0}
                </span>
                <span className="bg-orange-50 border border-orange-200 text-orange-600 px-2 py-0.5 rounded-full">
                  High: {dashboardMetrics?.severityDistribution?.High || 0}
                </span>
                <span className="bg-purple-50 border border-purple-200 text-purple-600 px-2 py-0.5 rounded-full">
                  Med: {dashboardMetrics?.severityDistribution?.Medium || 0}
                </span>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full">
                  Low: {dashboardMetrics?.severityDistribution?.Low || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Investigation History Card */}
          <div className="bg-white border border-[#2e1c14]/10 rounded-[28px] p-5.5 shadow-sm">
            <h3 className="font-serif font-bold text-sm text-[#2e1c14] mb-3 flex items-center justify-between">
              <span>Investigation History</span>
              <span className="text-[10px] font-mono font-normal text-[#5d4b42]/70 bg-[#f5efe8] px-2 py-0.5 rounded border">
                {reportsList.length} items
              </span>
            </h3>

            {reportsList.length === 0 ? (
              <p className="text-xs text-[#5d4b42]/70 italic py-4 text-center">No threat records resolved.</p>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {reportsList.map((rep) => {
                  const isActive = selectedReport?.id === rep.id;
                  
                  const severityColors: Record<string, string> = {
                    Critical: "text-rose-600 bg-rose-50 border-rose-100",
                    High: "text-orange-600 bg-orange-50 border-orange-100",
                    Medium: "text-purple-600 bg-purple-50 border-purple-100",
                    Low: "text-emerald-600 bg-emerald-50 border-emerald-100"
                  };

                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative group flex flex-col justify-between gap-1.5 ${
                        isActive 
                          ? "bg-[#2e1c14] border-[#2e1c14] text-white shadow-sm" 
                          : "bg-[#f5efe8]/20 hover:bg-white border-[#2e1c14]/10"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                          isActive ? "bg-white/10 border-white/20 text-amber-200" : (severityColors[rep.severity] || "text-gray-600 bg-gray-50")
                        }`}>
                          {rep.severity}
                        </span>

                        {/* Delete button */}
                        <button
                          onClick={(e) => handleDeleteReport(rep.id, e)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-opacity cursor-pointer ${
                            isActive ? "hover:bg-white/10 text-white/70 hover:text-white" : ""
                          }`}
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className={`text-xs font-serif font-bold line-clamp-1 leading-tight ${isActive ? "text-white" : "text-[#2e1c14]"}`}>
                        {rep.attackClassification}
                      </h4>

                      <span className={`text-[9px] font-mono block ${isActive ? "text-white/60" : "text-[#5d4b42]/70"}`}>
                        {rep.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>

        {/* Right Column: Active Viewer */}
        <div className="lg:col-span-8 w-full">
          
          {/* STATE A: No active report selected */}
          {!selectedReport ? (
            <div id="no-reports-fallback" className="bg-white border border-[#2e1c14]/10 rounded-[32px] p-12 text-center flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ffd6e8]/20 to-transparent rounded-bl-full pointer-events-none" />
              <FileText className="w-12 h-12 text-[#5d4b42]/30 mb-4 stroke-[1.2] animate-pulse" />
              
              <h4 className="font-serif font-bold text-lg text-[#2e1c14] mb-2">
                Incident Operations Dashboard
              </h4>
              
              <p className="text-xs text-[#5d4b42] max-w-md font-light leading-relaxed mb-6">
                Welcome to the security docket. Click on any past threat investigation in the history sidebar to inspect detailed timelines, mitigations, and evidence, or start a new analysis in the Live Studio.
              </p>

              {/* Show metrics widgets directly if they exist */}
              {reportsList.length > 0 && dashboardMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left mb-6.5 max-w-lg">
                  <div className="bg-[#f5efe8]/20 border border-[#2e1c14]/5 p-4 rounded-2xl">
                    <span className="text-[9px] font-mono text-[#5d4b42]/70 uppercase block">Top Threat Origin IPs</span>
                    <ul className="list-inside list-disc text-xs text-[#2e1c14] mt-1 space-y-0.5">
                      {dashboardMetrics.topThreatSources.map((ip: string, idx: number) => (
                        <li key={idx} className="font-mono">{ip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#f5efe8]/20 border border-[#2e1c14]/5 p-4 rounded-2xl">
                    <span className="text-[9px] font-mono text-[#5d4b42]/70 uppercase block">Attack Categories</span>
                    <div className="text-xs text-[#2e1c14] mt-1 space-y-1">
                      {Object.entries(dashboardMetrics.attackCategories).slice(0, 3).map(([cat, count]: any, idx) => (
                        <div key={idx} className="flex justify-between font-serif">
                          <span>{cat}</span>
                          <span className="font-mono bg-[#f5efe8] px-1.5 rounded">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                id="navigate-to-studio-btn"
                onClick={onNavigateToStudio}
                className="px-6 py-2.5 rounded-full bg-[#2e1c14] hover:bg-[#5d4b42] text-white text-xs font-semibold tracking-tight shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch Security Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            
            /* STATE B: Display active executive document */
            <div id="print-area-document" className="bg-white border border-[#2e1c14]/15 rounded-[32px] p-8 md:p-12 shadow-md relative">
              {/* Decorative Security Seal watermarks */}
              <div className="absolute top-8 right-8 text-[10px] font-mono tracking-widest text-[#5d4b42]/45 text-right hidden sm:block leading-snug">
                <span>SECURE SOC SEED CERTIFIED</span>
                <br />
                <span>ID: {selectedReport.id}</span>
              </div>

              {/* Letterhead */}
              <div className="border-b-2 border-[#2e1c14]/15 pb-8 mb-8 text-center sm:text-left">
                <span className="text-[10px] font-mono tracking-widest text-[#5d4b42]/80 uppercase block">
                  Autonomous Systems Threat Assessment Docket
                </span>
                <h1 className="font-serif font-bold text-2xl md:text-3xl text-[#2e1c14] mt-2">
                  {selectedReport.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 mt-4 text-[11px] text-[#5d4b42] font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#5d4b42]/80" /> Generated: {selectedReport.timestamp}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#5d4b42]/80" /> Severity: <strong className="text-rose-500 uppercase">{selectedReport.severity}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#5d4b42]/80" /> Risk Score: <strong>{selectedReport.riskScore}/100</strong>
                  </span>
                </div>
              </div>

              {/* Main content split */}
              <div className="space-y-8 text-xs leading-relaxed text-[#5d4b42] font-light">
                
                {/* 1. Executive Summary */}
                <section id="report-summary-section">
                  <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3">
                    1. Executive Summary
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-[#4a3b32]">
                    {selectedReport.executiveSummary}
                  </p>
                </section>

                {/* 2. Impact Assessment & 3. Affected Assets */}
                <section id="report-impact-section" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3">
                      2. Impact Assessment Matrix
                    </h3>
                    <div className="space-y-3 pt-1">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#5d4b42] block mb-1">Threat Classification</span>
                        <p className="text-xs font-bold text-[#2e1c14]">{selectedReport.attackClassification}</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#5d4b42] block mb-1">Confidence Rating</span>
                        <p className="text-xs font-bold text-[#2e1c14]">{selectedReport.confidenceScore}% confidence verified by MITRE Mapping Agent</p>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-mono text-[#5d4b42] block mb-1">Critical Risk Drivers</span>
                        <ul className="list-inside list-disc mt-1 space-y-1">
                          {selectedReport.riskFactors?.map((f, i) => (
                            <li key={i} className="text-[11px] font-sans text-[#5d4b42]">{f}</li>
                          )) || <li>No distinct risks flagged.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3">
                      3. Affected Asset Infrastructure
                    </h3>
                    <div className="space-y-2 pt-1">
                      {selectedReport.affectedAssets?.map((asset, index) => (
                        <div id={`affected-asset-${index}`} key={index} className="flex items-center gap-2 p-2 rounded-xl bg-[#f5efe8]/40 border border-[#2e1c14]/5">
                          <Bookmark className="w-4 h-4 text-[#2e1c14]/50 shrink-0" />
                          <div>
                            <span className="text-xs font-serif font-bold text-[#2e1c14] block">Asset Node {index + 1}</span>
                            <p className="text-[10.5px] font-mono text-[#5d4b42]/80 mt-0.5">{asset}</p>
                          </div>
                        </div>
                      )) || <p>No targeted systems logged.</p>}
                    </div>
                  </div>
                </section>

                {/* 4. Chronicled Anomaly Timeline */}
                <section id="report-timeline-section">
                  <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3">
                    4. Chronicled Anomaly Timeline (Click steps to view evidence)
                  </h3>
                  <div className="space-y-3 pt-1 relative">
                    {selectedReport.timeline?.map((step, index) => {
                      const statusColors = {
                        info: "bg-sky-400",
                        flag: "bg-amber-400",
                        remediation: "bg-emerald-400",
                      };
                      const isExpanded = activeTimelineIdx === index;
                      
                      return (
                        <div key={index} className="flex flex-col">
                          <div
                            id={`timeline-step-row-${index}`}
                            onClick={() => setActiveTimelineIdx(isExpanded ? null : index)}
                            className="flex gap-4 items-start relative pl-2 cursor-pointer hover:bg-[#f5efe8]/30 p-1.5 rounded-lg transition-colors"
                          >
                            <div className="pt-1 select-none text-[10.5px] font-mono text-[#5d4b42] w-14 shrink-0 text-left font-semibold">
                              {step.time}
                            </div>
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${statusColors[step.status || "info"]}`} />
                            <div className="text-[11px] text-[#2e1c14] font-medium leading-normal bg-[#f5efe8]/20 p-2 rounded-lg border border-[#20150d]/5 grow flex justify-between items-center">
                              <span>{step.event}</span>
                              <ChevronRight className={`w-3.5 h-3.5 text-[#5d4b42]/45 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                            </div>
                          </div>

                          {/* Expanded Interactive Log details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden pl-24 pr-2.5 mb-2 mt-1 no-print"
                              >
                                <div className="bg-[#2e1c14] text-amber-100/90 font-mono text-[10.5px] rounded-xl p-3.5 border border-[#2e1c14]/5 space-y-1.5">
                                  <span className="text-[9px] text-[#ffd6e8]/70 block border-b border-white/10 pb-1">FORENSIC TELEMETRY RECORD:</span>
                                  <div><strong className="text-[#ffd6e8]">Timestamp:</strong> {step.time}</div>
                                  <div><strong className="text-[#ffd6e8]">Observed Event:</strong> {step.event}</div>
                                  <div><strong className="text-[#ffd6e8]">Severity Flags:</strong> {step.status === 'flag' ? 'CRITICAL SIGNAL DETECTED' : step.status === 'remediation' ? 'CONTAINMENT TRIGGERED' : 'STANDARD SYSLOG'}</div>
                                  <div><strong className="text-[#ffd6e8]">Evidence Status:</strong> Verified logs payload matched signature rules.</div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }) || <p>Timeline compilation missed components.</p>}
                  </div>
                </section>

                {/* 5. Mitigation Recommendations */}
                <section id="report-mitigations-section">
                  <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3">
                    5. Mitigation Recommendations
                  </h3>
                  <ul className="list-inside list-disc space-y-1.5 pt-1 text-[11.5px] text-[#4a3b32]">
                    {selectedReport.mitigations?.map((m, index) => (
                      <li key={index} className="leading-relaxed">{m}</li>
                    )) || <li>Ensure perimeter checks are enabled.</li>}
                  </ul>
                </section>

                {/* 6. Immediate Reaction Action Checklist */}
                <section id="report-checklist-section">
                  <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3">
                    6. Immediate Reaction Action Checklist
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {checklist.map((item, index) => (
                      <button
                        id={`toggle-chk-btn-${index}`}
                        key={index}
                        onClick={() => handleToggleCheck(index)}
                        className={`p-3 rounded-[24px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          item.completed 
                            ? "bg-emerald-55/35 border-emerald-200 text-[#2e1c14] line-through decoration-emerald-800/15" 
                            : "bg-[#f5efe8]/20 border-[#2e1c14]/10 text-[#4a3b32] hover:bg-white"
                        }`}
                      >
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${item.completed ? "text-emerald-600 fill-emerald-100" : "text-[#5d4b42]/40"}`} />
                        <span className="text-[11px] font-medium leading-snug">{item.task}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 7. Forensic Expert Commentary */}
                <section id="report-notes-section" className="no-print pt-4">
                  <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> 7. Forensic Expert Commentary
                  </h3>
                  <p className="text-[10.5px] text-[#5d4b42] font-light leading-snug mb-3">
                    Append your own diagnostic review, notes of compromise, and sign-off validations below to finalize the document action packet.
                  </p>
                  <textarea
                    id="commentary-textarea"
                    rows={5}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Type your security comments here..."
                    className="w-full bg-[#f5efe8]/20 border border-[#2e1c14]/15 rounded-[24px] p-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#ffd6e8] placeholder-[#5d4b42]/45 text-[#2e1c14]"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-emerald-600 font-mono italic">
                      {isSavedAlert ? "✓ Action note synced to report successfully!" : ""}
                    </span>
                    <button
                      id="save-commentary-bottom-btn"
                      onClick={handleSaveNotes}
                      className="px-5.5 py-1.5 rounded-lg bg-[#2e1c14] hover:bg-[#5d4b42] text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
                    >
                      Save Notes
                    </button>
                  </div>
                </section>

                {/* 8. AI Analyst Explanation Matrix */}
                {selectedReport.agentExplanations && (
                  <section id="report-explanation-engine" className="pt-6 border-t-2 border-[#2e1c14]/10">
                    <h3 className="font-serif font-bold text-sm text-[#2e1c14] uppercase tracking-wide border-b pb-2 mb-3">
                      8. AI Analyst Security Explanation Matrix
                    </h3>
                    <p className="text-[10.5px] text-[#5d4b42] font-light leading-snug mb-4">
                      Select an agent below to review the specific evidence, rules triggered, and logical security reasoning compiled.
                    </p>

                    {/* Agent selector tabs */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 border-b pb-3 mb-4 no-print">
                      {(["log-detective", "threat-hunter", "risk-judge", "report-wizard", "defense-advisor"] as const).map((agentKey) => {
                        const mappedNames: Record<string, string> = {
                          "log-detective": "📥 Ingestion",
                          "threat-hunter": "🔍 Detection",
                          "risk-judge": "🧠 ATT&CK",
                          "report-wizard": "⚠ Risk",
                          "defense-advisor": "📊 Report"
                        };
                        const isActive = activeExplainAgent === agentKey;
                        return (
                          <button
                            key={agentKey}
                            onClick={() => setActiveExplainAgent(agentKey)}
                            className={`py-2 px-1 rounded-full text-[10px] font-serif font-bold text-center transition-all cursor-pointer ${
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

                    <div className="bg-[#f5efe8]/20 border border-[#2e1c14]/10 rounded-[24px] p-5 text-xs">
                      {(() => {
                        const explanationObj = selectedReport.agentExplanations[activeExplainAgent] || {
                          title: "Agent Verification",
                          explanation: "Gathering threat statistics from raw input telemetry lines.",
                          evidence: ["Uploaded sequence parameters", "Time metrics mapping success"]
                        };
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-serif font-bold text-xs text-[#2e1c14]">
                                {explanationObj.title}
                              </span>
                              <span className="text-[9px] font-mono text-[#5d4b42] bg-[#f5efe8] px-2 py-0.5 rounded-full border border-[#2e1c14]/5">
                                Verified Analyst Log
                              </span>
                            </div>

                            <p className="text-[#5d4b42] leading-relaxed mb-3.5 italic font-light" style={{ whiteSpace: "pre-wrap" }}>
                              {explanationObj.explanation}
                            </p>

                            <div>
                              <span className="text-[9px] font-mono tracking-wider text-[#2e1c14] block mb-1.5 uppercase font-bold">
                                Evidence Collected
                              </span>
                              <div className="space-y-1.5">
                                {explanationObj.evidence?.map((itm: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2 text-[10.5px] font-mono text-[#5d4b42]">
                                    <span className="text-[#2e1c14] mt-0.5">▪</span>
                                    <span>{itm}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
