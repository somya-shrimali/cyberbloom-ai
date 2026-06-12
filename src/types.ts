export type SeverityType = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source: string;
  category: string;
  description: string;
  severity: SeverityType;
}

export type AgentId = 'log-detective' | 'threat-hunter' | 'risk-judge' | 'report-wizard' | 'defense-advisor';

export interface Agent {
  id: AgentId;
  name: string;
  tagline: string;
  iconName: string;
  role: string;
  responsibilities: string[];
  color: string; // Tailwind hex or name representation
  badgeBg: string;
}

export interface AgentDecisionStep {
  agentId: AgentId;
  title: string;
  explanation: string;
  evidence: string[];
  evidenceLabel: string;
  status: 'pending' | 'active' | 'completed';
  timestamp: string;
}

export interface SecurityReport {
  id: string;
  title: string;
  timestamp: string;
  logSummary: string;
  executiveSummary: string;
  attackClassification: string;
  severity: SeverityType;
  confidenceScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  riskFactors: string[];
  affectedAssets: string[];
  timeline: { time: string; event: string; status: 'info' | 'flag' | 'remediation' }[];
  mitigations: string[];
  responseChecklist: { task: string; completed: boolean }[];
  analystNotes: string;
  agentExplanations?: any;
}

export interface AcademyLesson {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  readTime: string;
  colorClass: string; // e.g. bg-rose-50
  accentColor: string; // e.g. text-rose-500
  stickyNote: string;
  illustrationType: 'lens' | 'target' | 'shield' | 'compass' | 'badge';
  polaroidCaption: string;
  detailedContent: {
    heading: string;
    points: { label: string; text: string }[];
    analystProTip: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpValue: number;
}

export interface UserProfile {
  level: number;
  xp: number;
  xpNextLevel: number;
  analystTitle: string;
  badges: Badge[];
  historyCount: number;
}
