import React, { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import BloomBotMascot from "./components/BloomBotMascot";
import LandingPage from "./pages/LandingPage";
import StudioPage from "./pages/StudioPage";
import WorkspacePage from "./pages/WorkspacePage";
import ReportsPage from "./pages/ReportsPage";
import AcademyPage from "./pages/AcademyPage";
import ProfilePage from "./pages/ProfilePage";
import { UserProfile, SecurityReport, Badge } from "./types";
import { DEMO_PRESETS } from "./demoLogs";

const INITIAL_BADGES: Badge[] = [
  {
    id: "first-analysis",
    name: "First Analysis",
    description: "Successfully processed your very first security logs file.",
    iconName: "terminal",
    color: "bg-[#ffd6e8]/45 border-[#ffd6e8]",
    unlocked: false,
    xpValue: 50,
  },
  {
    id: "critical-detected",
    name: "Critical Threat Detected",
    description: "Triggered and quarantined an active Critical Severity security exploit.",
    iconName: "alert",
    color: "bg-[#e9d8fd]/45 border-[#e9d8fd]",
    unlocked: false,
    xpValue: 100,
  },
  {
    id: "threat-hunter",
    name: "Threat Hunter",
    description: "Mapped a brute-force or lateral scanner run to a MITRE ATT&CK identifier.",
    iconName: "hunter",
    color: "bg-[#d6f4ff]/45 border-[#d6f4ff]",
    unlocked: false,
    xpValue: 75,
  },
  {
    id: "academy-explorer",
    name: "CyberBloom Explorer",
    description: "Gleaned analytical handbook wisdom by studying the educational academy soil.",
    iconName: "compass",
    color: "bg-[#fff4c2]/45 border-[#fff4c2]",
    unlocked: false,
    xpValue: 50,
  },
  {
    id: "cyber-guardian",
    name: "Cyber Guardian",
    description: "Attained Level 5 status and commanded the co-operative multi-agent collective.",
    iconName: "shield",
    color: "bg-emerald-50/45 border-emerald-300",
    unlocked: false,
    xpValue: 150,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [currentReport, setCurrentReport] = useState<SecurityReport | null>(null);
  
  // XP state bonuses
  const [bloomAlertXpReward, setBloomAlertXpReward] = useState(0);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    level: 1,
    xp: 0,
    xpNextLevel: 200,
    analystTitle: "Level 1 Analyst",
    badges: INITIAL_BADGES,
    historyCount: 0,
  });

  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if (data && data.level) {
          // Sync badges list unlocked state as well
          setUserProfile(data);
        }
        setIsProfileLoaded(true);
      })
      .catch(err => {
        console.error("Error loading profile from DB:", err);
        setIsProfileLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (isProfileLoaded) {
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userProfile)
      }).catch(err => console.error("Error saving profile to DB:", err));
    }
  }, [userProfile, isProfileLoaded]);


  const getAnalystTitle = (level: number): string => {
    switch (level) {
      case 1: return "Level 1 Analyst";
      case 2: return "Level 2 Investigator";
      case 3: return "Level 3 Threat Hunter";
      case 4: return "Level 4 SOC Specialist";
      case 5: default: return "Level 5 Cyber Guardian";
    }
  };

  // LEVEL PROGRESSION MECHANICS
  const handleAddXp = (amount: number, currentProfile: UserProfile): UserProfile => {
    let newXp = currentProfile.xp + amount;
    let currentLevel = currentProfile.level;
    let nextLevelTarget = currentProfile.xpNextLevel;

    // Progression looping
    while (newXp >= nextLevelTarget && currentLevel < 5) {
      newXp -= nextLevelTarget;
      currentLevel += 1;
      nextLevelTarget = 150 + currentLevel * 80; // Scaled difficulty
    }

    // Auto-unlock Cyber Guardian badge on level 5
    let updatedBadges = currentProfile.badges;
    if (currentLevel === 5) {
      updatedBadges = currentProfile.badges.map(b => {
        if (b.id === "cyber-guardian" && !b.unlocked) {
          return {
            ...b,
            unlocked: true,
            unlockedAt: new Date().toLocaleTimeString(),
          };
        }
        return b;
      });
    }

    return {
      ...currentProfile,
      level: currentLevel,
      xp: newXp,
      xpNextLevel: nextLevelTarget,
      analystTitle: getAnalystTitle(currentLevel),
      badges: updatedBadges,
    };
  };

  const handleUnlockBadge = (badgeId: string, currentProfile: UserProfile): UserProfile => {
    let extraXpReward = 0;
    const updatedBadges = currentProfile.badges.map(b => {
      if (b.id === badgeId && !b.unlocked) {
        extraXpReward = b.xpValue;
        // Trigger temporary bloom alert indicator
        setBloomAlertXpReward(b.xpValue);
        setTimeout(() => setBloomAlertXpReward(0), 4000);

        return {
          ...b,
          unlocked: true,
          unlockedAt: new Date().toLocaleTimeString(),
        };
      }
      return b;
    });

    let profileWithBadge = {
      ...currentProfile,
      badges: updatedBadges,
    };

    if (extraXpReward > 0) {
      profileWithBadge = handleAddXp(extraXpReward, profileWithBadge);
    }

    return profileWithBadge;
  };

  // Run instant one-click demo
  const handleRunDemoMode = async () => {
    setActiveTab("studio");
    // Wait briefly and select the main high severity scenario
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Programmatically click the brute-force preset button to update React's state cleanly
    const presetBtn = document.getElementById("preset-btn-brute-force") as HTMLButtonElement;
    if (presetBtn) {
      presetBtn.click();
      
      // Wait for React to sync input text state from the clicked preset
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Trigger user entering inputs and running the automated pipeline
      const triggerBtn = document.getElementById("analyze-run-trigger") as HTMLButtonElement;
      if (triggerBtn) {
        triggerBtn.click();
      }
    } else {
      // Fallback: update value directly and trigger event if button is missing
      const studioInputArea = document.getElementById("raw-log-textarea") as HTMLTextAreaElement;
      if (studioInputArea) {
        studioInputArea.value = DEMO_PRESETS[0].logText;
        const event = new Event('input', { bubbles: true });
        studioInputArea.dispatchEvent(event);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        const triggerBtn = document.getElementById("analyze-run-trigger") as HTMLButtonElement;
        if (triggerBtn) {
          triggerBtn.click();
        }
      }
    }
  };

  // Handles completed analysis pipeline
  const handleAnalysisSuccess = (report: SecurityReport, xpEarned: number, badgeUnlockedId?: string) => {
    setCurrentReport(report);
    
    setUserProfile((prevProfile) => {
      let updatedProfile = { ...prevProfile };
      updatedProfile.historyCount += 1;
      
      // Add operational running XP
      updatedProfile = handleAddXp(xpEarned, updatedProfile);

      // Unlock matching badge if provided
      if (badgeUnlockedId) {
        updatedProfile = handleUnlockBadge(badgeUnlockedId, updatedProfile);
      }

      return updatedProfile;
    });
  };

  // Active navigation tab router
  const handleTabSelectionChange = (newTab: string) => {
    setActiveTab(newTab);

    // Gamification Easter Egg: Unlocks badge "academy-explorer" on first academy visit!
    if (newTab === "academy" && !userProfile.badges.find(b => b.id === "academy-explorer")?.unlocked) {
      setUserProfile((prev) => handleUnlockBadge("academy-explorer", prev));
    }
  };

  return (
    <div id="cyberbloom-studio-viewport" className="min-h-screen bg-[#F7F1EB] text-[#2E1C14] flex flex-col justify-between font-sans selection:bg-[#ffd6e8]">
      
      {/* Editorial Menu Navigation */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={handleTabSelectionChange} 
        userProfile={userProfile} 
      />

      {/* Primary Page Canvas */}
      <div id="tab-canvas-layer" className="grow pb-16">
        {activeTab === "home" && (
          <LandingPage 
            onStartAnalysis={() => handleTabSelectionChange("studio")} 
            onRunDemo={handleRunDemoMode}
            onExploreAcademy={() => handleTabSelectionChange("academy")}
          />
        )}
        
        {activeTab === "studio" && (
          <StudioPage 
            onAnalysisComplete={handleAnalysisSuccess}
            userProfile={userProfile}
          />
        )}

        {activeTab === "workspace" && (
          <WorkspacePage />
        )}

        {activeTab === "reports" && (
          <ReportsPage 
            currentReport={currentReport} 
            onSaveReportNotes={(updatedNotes) => {
              if (currentReport) {
                const copyReport = { ...currentReport, analystNotes: updatedNotes };
                setCurrentReport(copyReport);
              }
            }}
            onNavigateToStudio={() => handleTabSelectionChange("studio")}
          />
        )}

        {activeTab === "academy" && (
          <AcademyPage />
        )}

        {activeTab === "profile" && (
          <ProfilePage 
            userProfile={userProfile} 
          />
        )}
      </div>

      {/* Floating BloomBot Mascot */}
      <BloomBotMascot 
        activeTab={activeTab} 
        isAnalyzing={!!(document.getElementById("analyze-run-trigger") as HTMLButtonElement | null)?.disabled}
        hasIncident={!!currentReport}
        severity={currentReport?.severity || "Low"}
        xpBonusReward={bloomAlertXpReward}
      />

      {/* Print styles override block */}
      <style>{`
        @media print {
          #editorial-nav, #bloombot-mascot-root, .no-print, #print-report-btn, #save-report-notes-btn {
            display: none !important;
          }
          body, #cyberbloom-studio-viewport, #tab-canvas-layer {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-area-document {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
