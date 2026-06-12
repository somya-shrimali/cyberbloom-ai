import { motion } from "motion/react";
import { 
  Flower2, 
  Terminal, 
  Layers, 
  FileText, 
  GraduationCap, 
  Award, 
  ShieldAlert, 
  Compass
} from "lucide-react";
import { UserProfile } from "../types";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
}

export default function Navigation({ activeTab, setActiveTab, userProfile }: NavigationProps) {
  const tabs = [
    { id: "home", label: "Editorial Landing", icon: Compass },
    { id: "studio", label: "Security Studio", icon: Terminal },
    { id: "workspace", label: "Agent Workspace", icon: Layers },
    { id: "reports", label: "Threat Reports", icon: FileText },
    { id: "academy", label: "CyberBloom Academy", icon: GraduationCap },
    { id: "profile", label: "Profile & Badges", icon: Award },
  ];

  const xpPercentage = Math.min(100, Math.round((userProfile.xp / userProfile.xpNextLevel) * 100));

  return (
    <header id="editorial-nav" className="sticky top-0 z-50 w-full bg-[#f7f1eb]/85 backdrop-blur-md border-b border-[#2e1c14]/10 py-3 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          id="nav-logo" 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab("home")}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffd6e8] via-[#e9d8fd] to-[#d6f4ff] flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform duration-500">
            <Flower2 className="w-5.5 h-5.5 text-[#2e1c14] stroke-[1.5]" />
          </div>
          <div>
            <span className="font-serif font-normal text-2xl tracking-tight text-[#2e1c14] block leading-none">
              CyberBloom AI
            </span>
            <p className="text-[9px] font-mono tracking-widest text-[#5d4b42]/80 uppercase mt-0.5">
              Security Intelligence Studio
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="nav-tabs-wrapper" className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                id={`nav-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 flex items-center gap-1.5 border cursor-pointer ${
                  isActive 
                    ? "bg-[#2E1C14] text-[#F7F1EB] border-[#2E1C14] shadow-sm" 
                    : "bg-white text-[#5D4B42] border-[#2E1C14]/10 hover:border-[#2E1C14]/30 hover:text-[#2e1c14] hover:bg-[#F5EFE8]/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F7F1EB]" : "text-[#5d4b42]/70"}`} />
                <span>{tab.label.replace("Editorial ", "").replace("Threat ", "").replace("Agent ", "")}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile / XP Progress Badge */}
        <div 
          id="nav-profile-badge" 
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-3 bg-white/60 hover:bg-white/90 border border-[#2e1c14]/10 rounded-xl px-3.5 py-1.5 cursor-pointer transition-all duration-300 group"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#e9d8fd] flex items-center justify-center text-xs font-bold text-[#2e1c14] border border-[#2e1c14]/10 group-hover:scale-105 transition-transform">
              {userProfile.level}
            </div>
          </div>
          <div className="hidden sm:block text-left w-24">
            <p className="text-[10px] font-bold text-[#2e1c14] leading-tight truncate">
              {userProfile.analystTitle}
            </p>
            <div className="w-full bg-[#f5efe8] h-1.5 rounded-full mt-1 border border-[#2e1c14]/5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#ffd6e8] to-[#e9d8fd] h-full rounded-full transition-all duration-500" 
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-[9px] font-mono bg-[#fff4c2] text-[#2c1d11] px-1.5 py-0.5 rounded border border-[#2e1c14]/10 font-medium">
            {userProfile.xp} XP
          </div>
        </div>
      </div>
    </header>
  );
}
