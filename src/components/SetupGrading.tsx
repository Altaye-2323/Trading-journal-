import React from "react";
import { CheckSquare, Square, Award, AlertTriangle, HelpCircle, CheckCircle2 } from "lucide-react";
import VoiceDictateButton from "./VoiceDictateButton";

interface SetupGradingProps {
  preTradeChecklist: {
    trendAligned: boolean;
    supportResistanceConfirmed: boolean;
    multiTimeframeAnalysis: boolean;
    newsCheckCompleted: boolean;
    riskRewardRatioValid: boolean;
  };
  setPreTradeChecklist: React.Dispatch<React.SetStateAction<{
    trendAligned: boolean;
    supportResistanceConfirmed: boolean;
    multiTimeframeAnalysis: boolean;
    newsCheckCompleted: boolean;
    riskRewardRatioValid: boolean;
  }>>;
}

const CHECKLIST_ITEMS = [
  {
    key: "trendAligned" as const,
    label: "Trend Alignment Confirmed",
    desc: "Market structure is aligned with the higher timeframe direction (e.g. Daily/4H EMA confluence)."
  },
  {
    key: "supportResistanceConfirmed" as const,
    label: "Key Level Confluence",
    desc: "Trade is executing from a validated major Support/Resistance, Order Block, or Fibonacci zone."
  },
  {
    key: "multiTimeframeAnalysis" as const,
    label: "Multi-Timeframe Analysis",
    desc: "Drilled down from 4H structure to 1H execution entry, identifying localized liquidity sweep."
  },
  {
    key: "newsCheckCompleted" as const,
    label: "Economic News Checked",
    desc: "High-impact news (e.g., NFP, CPI, FOMC) is not scheduled within 2 hours of this trade's duration."
  },
  {
    key: "riskRewardRatioValid" as const,
    label: "Valid Risk-to-Reward Ratio (Min 1:2)",
    desc: "The stop-loss distance versus target take-profit meets or exceeds an mathematical 1:2 ratio."
  }
];

export function calculateGrade(checklist: {
  trendAligned: boolean;
  supportResistanceConfirmed: boolean;
  multiTimeframeAnalysis: boolean;
  newsCheckCompleted: boolean;
  riskRewardRatioValid: boolean;
}) {
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  if (checkedCount === 5) return "A+";
  if (checkedCount === 3 || checkedCount === 4) return "B";
  return "C";
}

export default function SetupGrading({ preTradeChecklist, setPreTradeChecklist }: SetupGradingProps) {
  
  const handleToggle = (key: keyof typeof preTradeChecklist) => {
    setPreTradeChecklist((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentGrade = calculateGrade(preTradeChecklist);
  const checkedCount = Object.values(preTradeChecklist).filter(Boolean).length;
  const percentageMet = (checkedCount / 5) * 100;

  // Render Grade Badge properties
  const gradeConfig = {
    "A+": {
      color: "text-emerald-400 bg-emerald-950/80 border-emerald-500/50 shadow-emerald-950",
      label: "Institutional Grade",
      desc: "Perfect A+ trade. 100% criteria satisfied. Standard execution lot permitted.",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    },
    B: {
      color: "text-amber-400 bg-amber-950/80 border-amber-500/50 shadow-amber-950",
      label: "Moderate Confluence",
      desc: "Grade B setup. 60-80% criteria met. Consider lowering lot size or waiting for secondary pullback.",
      icon: <Award className="w-5 h-5 text-amber-400" />
    },
    C: {
      color: "text-rose-400 bg-rose-950/80 border-rose-500/50 shadow-rose-950 animate-pulse",
      label: "Substandard Trade Setup",
      desc: "Grade C. Less than 60% of parameters met. HIGH RISK. Refuse entry or run highly reduced risk (e.g., 0.25%).",
      icon: <AlertTriangle className="w-5 h-5 text-rose-500" />
    }
  };

  const activeGrade = gradeConfig[currentGrade];

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 md:p-6 shadow-xl space-y-6" id="checklist-grading-panel">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Pre-Trade Confluence Checklist
          </h2>
          <p className="text-xs text-gray-400">Score your technical filters before pulling the trigger to eliminate impulse execution</p>
        </div>
      </div>

      {/* Grade Card Indicator */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-4 transition-all duration-300 ${activeGrade.color}`}>
        <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-black/40 border border-current/20 font-mono text-3xl font-extrabold tracking-tight">
          {currentGrade}
        </div>
        <div className="text-center md:text-left flex-grow">
          <div className="flex items-center justify-center md:justify-start gap-1.5 font-bold text-xs uppercase tracking-wider">
            {activeGrade.icon}
            <span>Setup Grade: {activeGrade.label}</span>
          </div>
          <p className="text-2xs text-gray-300 mt-1 leading-relaxed max-w-md">{activeGrade.desc}</p>
        </div>
        <div className="text-center md:text-right flex-shrink-0">
          <div className="font-mono text-lg font-bold">{percentageMet}%</div>
          <div className="text-3xs text-gray-400 uppercase font-mono tracking-widest">Parameters Met</div>
        </div>
      </div>

      {/* Checklist items list */}
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = preTradeChecklist[item.key];
          return (
            <div key={item.key} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggle(item.key)}
                className={`flex-grow text-left p-3.5 rounded-lg border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                  isChecked
                    ? "bg-[#10b981]/5 border-emerald-500/40 hover:border-emerald-500/60"
                    : "bg-[#0d1222] border-[#1f2937] hover:border-slate-700"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <span className={`text-xs font-semibold block transition-colors ${isChecked ? "text-emerald-300" : "text-gray-200"}`}>
                    {item.label}
                  </span>
                  <span className="text-gray-400 text-2xs mt-0.5 block leading-relaxed">{item.desc}</span>
                </div>
              </button>
              <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                <VoiceDictateButton
                  fieldName={`Checklist: ${item.label}`}
                  fieldType="checkbox"
                  onDictate={(val) => {
                    setPreTradeChecklist(prev => ({
                      ...prev,
                      [item.key]: val === "true"
                    }));
                  }}
                  className="h-[56px] w-[42px] flex items-center justify-center bg-[#0d1222] border-[#1f2937]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
