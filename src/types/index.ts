export type WasteCategory = 
  | 'paper' 
  | 'compost' 
  | 'plastic' 
  | 'landfill' 
  | 'metal' 
  | 'ewaste';

export type BinFullness = 'light' | 'normal' | 'heavy' | 'overflowing';
export type MainWasteStream = 'paper' | 'plastic' | 'compost' | 'landfill';

export interface ManualWasteItem {
  id: string;
  name: string;
  emoji: string;
  unitWeightGrams: number;
  count: number;
}

export interface WasteAssessment {
  photoUrl?: string;
  photoDetectedGrams?: number;
  fullness: BinFullness;
  estimatedGrams: number;
  mainStream: MainWasteStream;
  isProperlySorted: boolean;
  manualItems?: ManualWasteItem[];
  notes?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  confidence: number;
  estimatedGrams: number;
  manualGrams?: number;
  volumeCm3?: number;
  boundingBox?: BoundingBox;
  recyclable: boolean;
  ecoTip: string;
}

export interface EnergyInfraction {
  id: string;
  name: string;
  description: string;
  category: 'lighting' | 'screens' | 'hvac' | 'chargers' | 'windows';
  detected: boolean;
  pointsDeduction: number;
  estimatedWattsWasted: number;
  tip: string;
  icon: string;
}

export interface ScoreBreakdown {
  baseScore: number;
  wastePenalty: number;
  energyPenalty: number;
  sortingBonus: number;
  finalScore: number;
  tier: 'Eco Hero' | 'Green Guardian' | 'Eco Explorer' | 'Needs Eco-Love';
  tierColor: string;
  summaryFeedback: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'audit' | 'waste' | 'energy' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface AuditLog {
  id: string;
  classroomId: string;
  classroomName: string;
  auditorName: string;
  auditorId: string;
  date: string;
  timestamp: number;
  energyInfractions: EnergyInfraction[];
  wasteItems: WasteItem[];
  wasteAssessment?: WasteAssessment;
  totalWasteGrams: number;
  wastePerStudentGrams: number;
  totalEnergyInfractionsCount: number;
  totalWattsWasted: number;
  greenScore: number;
  scoreBreakdown: ScoreBreakdown;
  wastePhotoUrl?: string;
  notes?: string;
  xpEarned: number;
  badgesUnlocked: Badge[];
}

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  roomNumber: string;
  teacher: string;
  studentCount: number;
  currentGreenScore: number;
  streakDays: number;
  lastAuditedDate?: string;
  avatarColor: string;
  mascot: string;
  mascotName: string;
  weeklyWasteAvgGrams: number;
  weeklyEnergyInfractionsAvg: number;
  historicalAudits: AuditLog[];
  status: 'audited_today' | 'pending';
  todayGreenScore?: number;
}

export interface AuditorProfile {
  name: string;
  role: string;
  avatar: string;
  xp: number;
  level: number;
  auditsCompleted: number;
  badges: Badge[];
  soundEnabled: boolean;
  geminiApiKey?: string;
  useLiveAi: boolean;
}

export type LeaderboardTimeframe = 'daily' | 'weekly' | 'monthly' | 'all_time';
export type LeaderboardSortBy = 'green_score' | 'waste_per_student' | 'energy_hygiene';
