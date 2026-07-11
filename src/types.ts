export interface UserProfile {
  name: string;
  email: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  tradeDate: string;
  tradeTime: string;
  assetPair: string;
  positionSize: number; // Lots
  capitalRisked: number; // Percentage of capital (e.g. 1.5 for 1.5%)
  takeProfit: string; // Target price or pips
  stopLoss: string; // Target price or pips
  beStatus: 'YES' | 'NO'; // Break Even status
  fomoScore: number; // 1-10
  fearScore: number; // 1-10
  sleepQuality: number; // 1-10
  fatigueLevel: number; // 1-10
  preTradeChecklist: {
    trendAligned: boolean;
    supportResistanceConfirmed: boolean;
    multiTimeframeAnalysis: boolean;
    newsCheckCompleted: boolean;
    riskRewardRatioValid: boolean;
  };
  setupGrade: 'A+' | 'B' | 'C';
  rulesStatus: {
    neverOvertrade: boolean;
    alwaysUseStopLoss: boolean;
    waitForCandleClose: boolean;
    neverChasingPrice: boolean;
    respectMaxDailyLoss: boolean;
  };
  brokenRulesReasons: {
    neverOvertrade?: string;
    alwaysUseStopLoss?: string;
    waitForCandleClose?: string;
    neverChasingPrice?: string;
    respectMaxDailyLoss?: string;
  };
  transcript?: string;
}

export interface RoutineStatus {
  id?: string;
  date: string; // YYYY-MM-DD
  morningCompleted: boolean;
  morningCompletedAt?: string;
  morningItems: {
    marketStructureAnalyzed: boolean;
    keyLevelsMarked: boolean;
    economicCalendarChecked: boolean;
    hydrationAndStretchDone: boolean;
    mentalFocusCentered: boolean;
  };
  eveningCompleted: boolean;
  eveningCompletedAt?: string;
  eveningItems: {
    openPositionsReviewed: boolean;
    tradesLoggedWithGrades: boolean;
    mistakesDocumented: boolean;
    terminalClosed: boolean;
    marketPrepsDone: boolean;
  };
}

export interface Statistics {
  totalTrades: number;
  gradeAPlusCount: number;
  gradeBCount: number;
  gradeCCount: number;
  avgFomo: number;
  avgFear: number;
  avgSleep: number;
  avgFatigue: number;
  rulesBrokenCount: number;
}
