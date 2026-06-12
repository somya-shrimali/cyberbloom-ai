import React from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  BookOpen, 
  Fingerprint, 
  Layers,
  Heart,
  Flower2
} from "lucide-react";

interface LandingPageProps {
  onStartAnalysis: () => void;
  onRunDemo: () => void;
  onExploreAcademy: () => void;
}

export default function LandingPage({ onStartAnalysis, onRunDemo, onExploreAcademy }: LandingPageProps) {
  // Let's create dynamic floral coordinates for beautiful parallax ambient layouts in the margin
  const floatingAssets = [
    { text: "🌸", size: "text-3xl", top: "15%", left: "8%", delay: 0 },
    { text: "🕊️", size: "text-2xl", top: "55%", left: "12%", delay: 1.5 },
    { text: "✨", size: "text-xl", top: "25%", right: "10%", delay: 0.8 },
    { text: "🌿", size: "text-4xl", top: "70%", right: "12%", delay: 2 },
    { text: "💐", size: "text-2xl", top: "82%", left: "15%", delay: 1.2 },
  ];

  const agentHighlights = [
    {
      role: "Log Detective",
      quote: "🕵 'Harvesting timestamps...'",
      desc: "Cleanses, structures, and identifies temporal frequency logs.",
      colorClass: "bg-[#ffd6e8]/40 border-[#ffd6e8]"
    },
    {
      role: "Threat Hunter",
      quote: "🏹 'Extracting malicious seeds...'",
      desc: "Maps anomaly signatures to MITRE ATT&CK taxonomies.",
      colorClass: "bg-[#e9d8fd]/40 border-[#e9d8fd]"
    },
    {
      role: "Risk Judge",
      quote: "⚖ 'Weighing threat potential...'",
      desc: "Formulates objective severity gauges and confidence metrics.",
      colorClass: "bg-[#d6f4ff]/40 border-[#d6f4ff]"
    }
  ];

  return (
    <div id="landing-page-root" className="min-h-[calc(100vh-73px)] py-12 px-6 md:px-12 relative overflow-hidden bg-[#F7F1EB]">
      {/* Decorative Parallax Background shapes */}
      {floatingAssets.map((asset, i) => (
        <motion.div
          id={`floating-item-${i}`}
          key={i}
          className={`absolute ${asset.size} select-none hidden md:block pointer-events-none opacity-40`}
          style={{ top: asset.top, left: asset.left, right: asset.right }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: asset.delay,
            ease: "easeInOut",
          }}
        >
          {asset.text}
        </motion.div>
      ))}

      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Soft Magazine Header Accent */}
        <motion.div
          id="hero-header-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 px-3 py-1 bg-white/70 border border-[#2e1c14]/10 rounded-full text-xs font-medium tracking-tight mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#5d4b42]" />
          <span>Vol. 17 — The Autonomous Analyst Collective</span>
        </motion.div>

        {/* Large Editorial Hero Title Layout */}
        <main id="hero-main-layout" className="text-center max-w-4xl flex flex-col items-center">
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#2e1c14] leading-tight"
          >
            CyberBloom <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd6e8] via-[#e9d8fd] to-[#5d4b42] font-semibold italic">AI</span>
          </motion.h1>

          <motion.p
            id="hero-tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-serif text-lg md:text-2xl italic tracking-wide text-[#5d4b42] mt-4 font-normal"
          >
            Collaborative AI Security Intelligence Studio
          </motion.p>

          <motion.div
            id="hero-bar-divider"
            initial={{ width: 0 }}
            animate={{ width: "80px" }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-[1px] bg-[#2e1c14]/25 my-6"
          />

          <motion.p
            id="hero-description"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[#5d4b42] text-sm md:text-lg max-w-2xl font-light leading-relaxed tracking-wide"
          >
            Transform cold, machine-unreadable network security logs into expressive, explainable, and visually delightful intelligence cards. Modeled on coordinated multi-agent deliberation workflows.
          </motion.p>

          {/* Core Interactive Action Buttons */}
          <motion.div
            id="hero-button-group"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center"
          >
            <button
              id="landing-start-analysis-btn"
              onClick={onStartAnalysis}
              className="px-8 py-3 rounded-full bg-[#2e1c14] hover:bg-[#5d4b42] text-white text-sm font-medium tracking-tight shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 group cursor-pointer"
            >
              Start Analysis 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>

            <button
              id="landing-run-demo-btn"
              onClick={onRunDemo}
              className="px-8 py-3 rounded-full bg-white/85 hover:bg-white text-[#2e1c14] border border-[#2e1c14]/15 text-sm font-medium tracking-tight shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              One-Click Faculty Demo
            </button>

            <button
              id="landing-explore-academy-btn"
              onClick={onExploreAcademy}
              className="px-6 py-3 rounded-full bg-transparent hover:bg-[#fff4c2]/40 text-[#2e1c14] text-sm font-medium tracking-tight transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#5d4b42]/80" />
              Explore Academy
            </button>
          </motion.div>
        </main>

        {/* Polaroid Scrapbook Element (Multi-Agent Teaser Cards) */}
        <motion.section
          id="hero-polaroids-showcase"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-6.5 max-w-5xl"
        >
          {agentHighlights.map((agent, index) => (
            <div
              id={`intro-polaroid-${index}`}
              key={index}
              className="bg-white border border-[#2e1c14]/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              style={{
                transform: `rotate(${(index - 1) * 1.5}deg)`,
              }}
            >
              <div>
                {/* Simulated Polaroid Photo Region */}
                <div className={`aspect-video rounded-xl ${agent.colorClass} border flex flex-col items-center justify-center p-4 relative overflow-hidden mb-4 group-hover:scale-[1.02] transition-transform duration-300`}>
                  <div className="absolute top-2 left-2 text-[10px] font-mono tracking-wider text-[#5d4b42]/70 uppercase">
                    Security Lens
                  </div>
                  <span className="font-serif font-semibold italic text-sm text-[#2e1c14] drop-shadow-sm text-center">
                    {agent.quote}
                  </span>
                </div>
                
                <h3 className="font-serif font-bold text-lg text-[#2e1c14] leading-tight">
                  {agent.role}
                </h3>
                <p className="text-[#5d4b42] text-xs font-light tracking-wide mt-2 leading-relaxed">
                  {agent.desc}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#f5efe8] flex justify-between items-center text-[10px] font-mono text-[#5d4b42]">
                <span>Phase 0{index + 1} Pipeline</span>
                <span className="text-[#2e1c14] font-semibold group-hover:underline">Explore Workflow →</span>
              </div>
            </div>
          ))}
        </motion.section>

        {/* Feature Highlights bento layout */}
        <section id="features-bento" className="mt-20 w-full max-w-5xl">
          <div className="border-t border-[#2e1c14]/15 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-mono tracking-widest text-[#5d4b42]/80 uppercase block mb-2">
                  HUMAN-CENTRIC INTERFACING
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2e1c14] leading-tight">
                  Because critical threat forensics deserves luxury clarity.
                </h2>
                <p className="text-[#5d4b42] text-sm font-light mt-4 leading-relaxed">
                  CyberBloom rejects cold, unfeeling matrix-style command lines. We provide structured executive reports, interactive timelines, editable notebook blocks, and a friendly BloomBot mascot companion. Our platform bridges the gap between deep forensic accuracy and clean corporate design.
                </p>
                <div className="flex gap-4.5 mt-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#2e1c14]">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Explainable AI Logs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#2e1c14]">
                    <Fingerprint className="w-4.5 h-4.5 text-indigo-500" />
                    <span>MITRE Frame Classification</span>
                  </div>
                </div>
              </div>

              {/* Stacked Scrapbook visual representation */}
              <div className="relative aspect-video rounded-3xl bg-gradient-to-tr from-[#f5efe8] to-[#ffd6e8]/30 border border-[#2e1c14]/10 p-6 flex flex-col justify-between overflow-hidden group shadow-inner">
                {/* Background ambient mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#fff4c2]/30 via-transparent to-[#e9d8fd]/25 -z-10" />

                {/* Simulated floating alert card */}
                <motion.div
                  id="bento-alert-card"
                  animate={{
                    y: [0, -6, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-white/90 rounded-2xl shadow-md border border-[#2e1c14]/10 p-4 max-w-xs ml-auto"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[10px] font-mono font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5">
                      CRITICAL THREAT
                    </span>
                    <span className="text-[9px] text-[#5d4b42]/70">04:01:42 UTC</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#2e1c14] leading-tight">Credential Injection</h4>
                  <p className="text-[10px] text-[#5d4b42] font-light mt-1.5 leading-snug">
                    Attacker executed shell curl on host staging-web...
                  </p>
                </motion.div>

                {/* Bottom decorative layout line */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#fff4c2] flex items-center justify-center text-xs border border-[#2e1c14]/15">
                      🌸
                    </div>
                    <span className="text-[11px] font-serif font-bold text-[#2e1c14]">
                      BloomBot Active State Monitoring
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5d4b42]/80 bg-[#f5efe8] px-2.5 py-1 rounded-lg border border-[#2e1c14]/5">
                    Healthy Soil Index: 92%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
