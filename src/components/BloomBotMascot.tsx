import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageCircle, X, Flower, HelpCircle, Heart } from "lucide-react";

interface BloomBotProps {
  activeTab: string;
  isAnalyzing?: boolean;
  hasIncident?: boolean;
  severity?: string;
  xpBonusReward?: number;
}

export default function BloomBotMascot({ 
  activeTab, 
  isAnalyzing = false, 
  hasIncident = false, 
  severity = "Low",
  xpBonusReward = 0
}: BloomBotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("Welcome back analyst!");
  const [wiggle, setWiggle] = useState(false);

  useEffect(() => {
    // Determine context-based playful quotes for BloomBot
    if (isAnalyzing) {
      const analyzingQuotes = [
        "Analyzing soil... 🌸 My AI agents are digging deep into the security logs!",
        "🕵 Log Detective is on the case! Let's trace these packets together.",
        "🧙 Report Wizard is aligning the ink... Almost ready!",
        "Something suspicious is blooming. I can smell anomalies in the data stream."
      ];
      const randomQuote = analyzingQuotes[Math.floor(Math.random() * analyzingQuotes.length)];
      setMessage(randomQuote);
      return;
    }

    if (xpBonusReward > 0) {
      setMessage(`✨ Splendid! You earned +${xpBonusReward} XP! Your cyber garden is blooming beautifully!`);
      setIsOpen(true);
      return;
    }

    switch (activeTab) {
      case "home":
        setMessage("Welcome back analyst! Let's explore how multiple collaborative AI agents solve security challenges in our digital playground! 🌸");
        break;
      case "studio":
        if (hasIncident) {
          if (severity === "Critical" || severity === "High") {
            setMessage(`⚠️ Security hazard! Something suspicious has bloomed in the server forest. Let's dissect the risk factors!`);
          } else {
            setMessage("🌸 Great news! Mostly healthy activity, though some minor anomalous spores were found.");
          }
        } else {
          setMessage("Let's investigate today's logs. Drag, paste, or select a demo file above to kick off the AI security workflow.");
        }
        break;
      case "workspace":
        setMessage("This is where CyberBloom thinks! Click on any agent step above to read what evidence was inspected.");
        break;
      case "reports":
        setMessage("Drafting reports doesn't have to be clinical. Print or save this editorial executive letter for the CISO team! 📑");
        break;
      case "academy":
        setMessage("Forensiced learning is beautiful! Grab a sticky note and read how threat detection frameworks grow. 🎓");
        break;
      case "profile":
        setMessage("Incredible badges! Investigate more scenarios to grow from a Level 1 Analyst into a Level 5 Cyber Guardian! 🥇");
        break;
      default:
        setMessage("Everything is looking blooming beautiful in our secure perimeter today! 🌸");
    }

    // Trigger a playful entrance wiggle
    setWiggle(true);
    const timer = setTimeout(() => setWiggle(false), 1000);
    return () => clearTimeout(timer);
  }, [activeTab, isAnalyzing, hasIncident, severity, xpBonusReward]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const adviceList = [
    "Tip: Parameterized SQL strings repel database exfiltration spikes!",
    "Fact: Port 22 password logins are targeted 40,000 times a day by scanning seeds.",
    "BloomBot Wisdom: Good security is like healthy soil—diverse, layered, and carefully pruned.",
    "Friendly reminder: Insider threats are often flagged by off-hours file downloads."
  ];

  const triggerTip = () => {
    const tip = adviceList[Math.floor(Math.random() * adviceList.length)];
    setMessage(`🌸 BloomBot Tip: ${tip}`);
  };

  return (
    <div id="bloombot-mascot-root" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="bloombot-speech-bubble"
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            className="mb-3 max-w-sm bg-white border border-[#2e1c14]/15 rounded-2xl shadow-xl p-4.5 text-[#2e1c14] relative text-sm select-none sticky-note"
          >
            {/* Soft decorative layout lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffd6e8] via-[#e9d8fd] to-[#d6f4ff] rounded-t-2xl" />
            
            <button 
              id="bloombot-close-btn"
              onClick={toggleOpen}
              className="absolute top-2.5 right-2.5 text-[#5d4b42]/60 hover:text-[#2e1c14] transition-colors p-0.5 rounded-full hover:bg-[#f5efe8]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-2.5 items-start mt-1">
              <div className="w-5 h-5 rounded-full bg-[#ffd6e8] flex items-center justify-center text-xs mt-0.5 shrink-0 animate-pulse">
                🌸
              </div>
              <div>
                <span className="font-serif font-bold text-[#2e1c14] block text-xs tracking-wider uppercase mb-1">
                  BloomBot Assistant
                </span>
                <p className="text-xs leading-relaxed text-[#5d4b42] font-medium pr-3.5">
                  {message}
                </p>
              </div>
            </div>

            {/* Micro action tabs */}
            <div className="mt-3 pt-2.5 border-t border-[#f5efe8] flex justify-between items-center text-[10px] text-[#5d4b42]/80">
              <span className="flex items-center gap-1 font-mono text-[9px]">
                <Sparkles className="w-3 h-3 text-[#e9d8fd]" /> Dynamic Security Peer
              </span>
              <button 
                id="bloombot-wisdom-btn"
                onClick={triggerTip}
                className="text-[#2e1c14] font-bold hover:underline flex items-center gap-1"
              >
                Glean Wisdom →
              </button>
            </div>
            
            {/* Speech bubble pointer */}
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-r border-b border-[#2e1c14]/15 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Floating Mascot button */}
      <motion.button
        id="bloombot-primary-btn"
        onClick={toggleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={wiggle ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ffd6e8] via-[#e9d8fd] to-[#fff4c2] flex items-center justify-center shadow-lg border border-white relative group"
      >
        <Flower className="w-7 h-7 text-[#2e1c14] group-hover:rotate-45 transition-transform duration-500" />
        
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#e9d8fd] to-[#d6f4ff] -z-10 blur-md opacity-0 group-hover:opacity-75 transition-opacity duration-300" />
        
        {/* Bloom notifier badge if active workflow */}
        {isAnalyzing && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold animate-ping" />
        )}
      </motion.button>
    </div>
  );
}
