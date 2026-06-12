import React from "react";
import { motion } from "motion/react";
import { 
  Award, 
  Sparkles, 
  ShieldAlert, 
  Clock, 
  Terminal, 
  ShieldCheck, 
  BookOpen, 
  Compass, 
  Workflow,
  TrendingUp,
  Heart
} from "lucide-react";
import { UserProfile, Badge } from "../types";

interface ProfilePageProps {
  userProfile: UserProfile;
}

export default function ProfilePage({ userProfile }: ProfilePageProps) {
  // Map icons dynamically
  const getBadgeIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "terminal": return <Terminal className={className} />;
      case "compass": return <Compass className={className} />;
      case "hunter": return <Workflow className={className} />;
      case "alert": return <ShieldAlert className={className} />;
      case "shield": return <ShieldCheck className={className} />;
      default: return <Award className={className} />;
    }
  };

  const getTierDetails = (level: number) => {
    const tiers = [
      { name: "Level 1 Analyst", nextName: "Level 2 Investigator", desc: "Greenhouse seedling learning the soil. Ingesting firstsyslogs and parsing raw credentials.", color: "text-[#5d4b42]" },
      { name: "Level 2 Investigator", nextName: "Level 3 Threat Hunter", desc: "Budding threat hunter tracking anomalous timelines and cross-referencing WAF rules.", color: "text-purple-600" },
      { name: "Level 3 Threat Hunter", nextName: "Level 4 SOC Specialist", desc: "Active security gardener. Rooting out remote C2 beaconing and memory thread trojans.", color: "text-indigo-600" },
      { name: "Level 4 SOC Specialist", nextName: "Level 5 Cyber Guardian", desc: "Forest supervisor drafting automated block boundaries and orchestrating WAF blocks.", color: "text-rose-500" },
      { name: "Level 5 Cyber Guardian", nextName: "Maximum Mastery Achieved", desc: "Universal soil protector. Perfect coordination with multi-agent security intelligences.", color: "text-emerald-600" }
    ];
    return tiers[Math.min(level - 1, tiers.length - 1)];
  };

  const currentTier = getTierDetails(userProfile.level);
  const xpPercentage = Math.min(100, Math.round((userProfile.xp / userProfile.xpNextLevel) * 100));

  return (
    <div id="profile-page-root" className="max-w-4xl mx-auto py-10 px-6 md:px-12 bg-[#F7F1EB]">
      {/* Editorial Header */}
      <div id="profile-header" className="mb-10 text-center md:text-left border-b border-[#2e1c14]/10 pb-6">
        <span className="text-xs font-mono tracking-widest text-[#5d4b42]/80 uppercase block mb-1">
          GAMIFIED ANALYST TELEMETRY
        </span>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#2e1c14]">
          Profile & Achievements
        </h2>
        <p className="text-[#5d4b42] text-sm font-light mt-1">
          Study your growth rings, track unlocked credentials badges, and evaluate your progression toward the Cyber Guardian peak.
        </p>
      </div>

      <div id="profile-grid" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left column: Level stats card */}
        <div id="profile-level-stats" className="md:col-span-5 bg-white border border-[#2e1c14]/12 rounded-[32px] p-6 shadow-sm relative overflow-hidden">
          {/* Aesthetic flower shape background */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#ffd6e8]/25 to-transparent rounded-bl-full pointer-events-none" />

          {/* Large Level Meter display */}
          <div className="text-center pb-6 border-b border-[#2e1c14]/5">
            <span className="text-[10px] font-mono tracking-wider text-[#5d4b42] uppercase block mb-1">
              Active Security Rank
            </span>
            <div className="w-20 h-20 rounded-full bg-[#f5efe8] border-2 border-[#2e1c14]/10 flex items-center justify-center mx-auto mb-4 relative shadow-inner">
              <span className="font-serif font-black text-3xl text-[#2e1c14]">
                {userProfile.level}
              </span>
              <div className="absolute -bottom-1 bg-[#fff4c2] text-[#2c1d11] px-2 py-0.5 rounded border border-[#2e1c14]/10 text-[9px] font-mono leading-none">
                Lvl
              </div>
            </div>

            <h3 className="font-serif font-bold text-lg text-[#2e1c14]">
              {userProfile.analystTitle}
            </h3>
            <p className="text-[#5d4b42] text-[11px] font-light mt-1.5 leading-relaxed max-w-xs mx-auto italic">
              &ldquo;{currentTier.desc}&rdquo;
            </p>
          </div>

          {/* XP progress bar details */}
          <div id="profile-xp-details" className="pt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#5d4b42] mb-1.5">
                <span>Experience Growth</span>
                <span>{userProfile.xp} / {userProfile.xpNextLevel} XP</span>
              </div>
              <div className="w-full bg-[#f5efe8] h-3 rounded-full border border-[#2e1c14]/5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#ffd6e8] via-[#e9d8fd] to-[#d6f4ff] h-full rounded-full transition-all duration-700" 
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#5d4b42]/70 font-mono mt-1">
                <span>{xpPercentage}% Level Progress</span>
                {userProfile.level < 5 ? (
                  <span>Next: {currentTier.nextName}</span>
                ) : (
                  <span>Max Tier Limit</span>
                )}
              </div>
            </div>

            <div id="profile-stats-counters" className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
              <div className="bg-[#f5efe8]/30 rounded-[24px] p-4 border border-[#2e1c14]/5">
                <span className="text-[9px] font-mono text-[#5d4b42]/80 uppercase block">Ingest Inquiries</span>
                <span className="font-serif font-bold text-[#2e1c14] text-base block mt-0.5">{userProfile.historyCount} Run{userProfile.historyCount !== 1 ? 's' : ''}</span>
              </div>

              <div className="bg-[#f5efe8]/30 rounded-[24px] p-4 border border-[#2e1c14]/5">
                <span className="text-[9px] font-mono text-[#5d4b42]/80 uppercase block">Badges Blooming</span>
                <span className="font-serif font-bold text-[#2e1c14] text-base block mt-0.5">
                  {userProfile.badges.filter(b => b.unlocked).length} / {userProfile.badges.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Badges grid */}
        <div id="profile-badges-grid" className="md:col-span-7">
          <span className="text-[10px] font-mono tracking-wider text-[#5d4b42] block mb-3 uppercase">
            Collectible Security Badge Grid
          </span>

          <div className="space-y-4">
            {userProfile.badges.map((badge) => (
              <div
                id={`badge-row-${badge.id}`}
                key={badge.id}
                className={`p-4.5 rounded-[24px] border transition-all duration-500 flex items-start gap-4 ${
                  badge.unlocked
                    ? "bg-white border-[#2e1c14]/12 shadow-sm"
                    : "bg-white/40 border-dashed border-[#2e1c14]/10 opacity-60 grayscale filter"
                }`}
              >
                {/* Badge Icon Slot */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border shadow-sm transition-all duration-500 ${
                  badge.unlocked 
                    ? badge.color 
                    : "bg-[#f5efe8]/60 border-[#2e1c14]/10"
                }`}>
                  {getBadgeIcon(badge.iconName, `w-5.5 h-5.5 ${badge.unlocked ? "text-[#2e1c14]" : "text-[#5d4b42]/40"}`)}
                </div>

                {/* Badge Description */}
                <div className="grow">
                  <div className="flex items-center justify-between text-xs font-mono mb-0.5">
                    <h4 className="font-serif font-black text-[#2e1c14] text-sm leading-tight">
                      {badge.name}
                    </h4>

                    {badge.unlocked ? (
                      <span className="text-[9px] text-[#2c1d11] bg-[#fff4c2] px-2 py-0.5 rounded border border-[#2e1c14]/10 font-bold uppercase tracking-wider">
                        BLOCKED
                      </span>
                    ) : (
                      <span className="text-[9px] text-[#5d4b42]/60 font-semibold tracking-wider">
                        Locked (+{badge.xpValue} XP)
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] leading-relaxed text-[#5d4b42] font-light mt-1">
                    {badge.description}
                  </p>

                  {badge.unlocked && badge.unlockedAt && (
                    <div className="text-[9px] font-mono text-[#5d4b42]/70 flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3" /> Unlocked: {badge.unlockedAt}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
