import React from "react";
import { Brain, Sparkles, Smile, ShieldAlert, Heart, Frown, Check, AlertTriangle } from "lucide-react";

interface PsychologySectionProps {
  fomoScore: number;
  setFomoScore: (score: number) => void;
  fearScore: number;
  setFearScore: (score: number) => void;
  sleepQuality: number;
  setSleepQuality: (score: number) => void;
  fatigueLevel: number;
  setFatigueLevel: (score: number) => void;
  rulesStatus: {
    neverOvertrade: boolean;
    alwaysUseStopLoss: boolean;
    waitForCandleClose: boolean;
    neverChasingPrice: boolean;
    respectMaxDailyLoss: boolean;
  };
  setRulesStatus: React.Dispatch<React.SetStateAction<{
    neverOvertrade: boolean;
    alwaysUseStopLoss: boolean;
    waitForCandleClose: boolean;
    neverChasingPrice: boolean;
    respectMaxDailyLoss: boolean;
  }>>;
  brokenRulesReasons: {
    neverOvertrade?: string;
    alwaysUseStopLoss?: string;
    waitForCandleClose?: string;
    neverChasingPrice?: string;
    respectMaxDailyLoss?: string;
  };
  setBrokenRulesReasons: React.Dispatch<React.SetStateAction<{
    neverOvertrade?: string;
    alwaysUseStopLoss?: string;
    waitForCandleClose?: string;
    neverChasingPrice?: string;
    respectMaxDailyLoss?: string;
  }>>;
}

const RULES_METADATA = [
  {
    key: "neverOvertrade" as const,
    label: "Never Overtrade (Max 3 Trades/Day)",
    desc: "Maintain extreme patience. Restricting trade frequency prevents market churn and emotional exhaustion."
  },
  {
    key: "alwaysUseStopLoss" as const,
    label: "Always Use a Hard Stop Loss",
    desc: "Protect trading capital absolutely. Running trades without stop-losses invites catastrophic accounts wipes."
  },
  {
    key: "waitForCandleClose" as const,
    label: "Wait for Candle Close Confirmations",
    desc: "No front-running. A setup is only valid once the confirming timeframe candle is formally closed."
  },
  {
    key: "neverChasingPrice" as const,
    label: "Never Chase Missed Entries",
    desc: "If the target price departed without executing, wait for clean pullbacks or cancel the setup."
  },
  {
    key: "respectMaxDailyLoss" as const,
    label: "Respect Maximum Daily Loss Limit",
    desc: "When daily risk limit is breached, shut down terminals. Preserving capital enables future battles."
  }
];

export default function PsychologySection({
  fomoScore,
  setFomoScore,
  fearScore,
  setFearScore,
  sleepQuality,
  setSleepQuality,
  fatigueLevel,
  setFatigueLevel,
  rulesStatus,
  setRulesStatus,
  brokenRulesReasons,
  setBrokenRulesReasons
}: PsychologySectionProps) {
  
  const handleRuleToggle = (key: keyof typeof rulesStatus) => {
    setRulesStatus((prev) => {
      const isCurrentlyRespected = prev[key];
      const nextRespected = !isCurrentlyRespected;
      
      // If setting to respected, clear the reason
      if (nextRespected) {
        setBrokenRulesReasons((prevReasons) => {
          const updated = { ...prevReasons };
          delete updated[key];
          return updated;
        });
      } else {
        // If setting to broken, pre-fill with blank
        setBrokenRulesReasons((prevReasons) => ({
          ...prevReasons,
          [key]: ""
        }));
      }
      
      return {
        ...prev,
        [key]: nextRespected
      };
    });
  };

  const handleReasonChange = (key: keyof typeof rulesStatus, text: string) => {
    setBrokenRulesReasons((prev) => ({
      ...prev,
      [key]: text
    }));
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 md:p-6 shadow-xl space-y-6" id="psychology-panel">
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          Mental State & Discipline Logs
        </h2>
        <p className="text-xs text-gray-400">Enforce cold, calculated logic. Emotional trading is a primary cause of capital loss.</p>
      </div>

      {/* Sliders Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-[#0d1222] p-4 rounded-xl border border-slate-800">
        <div className="md:col-span-2 text-2xs font-mono text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Biometric & Cognitive Indices
        </div>

        {/* FOMO */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-300 flex items-center gap-1">
              FOMO (Fear of Missing Out)
            </span>
            <span className={`font-mono font-bold ${fomoScore > 5 ? "text-rose-400" : "text-emerald-400"}`}>
              {fomoScore} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={fomoScore}
            onChange={(e) => setFomoScore(parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Zen Patient</span>
            <span>Urgent Chaser</span>
          </div>
        </div>

        {/* Fear */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-300">Market Fear / Anxiety</span>
            <span className={`font-mono font-bold ${fearScore > 5 ? "text-rose-400" : "text-emerald-400"}`}>
              {fearScore} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={fearScore}
            onChange={(e) => setFearScore(parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Supreme Confidence</span>
            <span>Hesitant / Terrified</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-300 flex items-center gap-1">
              Sleep Quality & Rest
            </span>
            <span className={`font-mono font-bold ${sleepQuality < 5 ? "text-rose-400" : "text-emerald-400"}`}>
              {sleepQuality} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={sleepQuality}
            onChange={(e) => setSleepQuality(parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Sleep Deprived</span>
            <span>Fully Recharged</span>
          </div>
        </div>

        {/* Fatigue Level */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-300">Physical & Mental Fatigue</span>
            <span className={`font-mono font-bold ${fatigueLevel > 5 ? "text-rose-400" : "text-emerald-400"}`}>
              {fatigueLevel} / 10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={fatigueLevel}
            onChange={(e) => setFatigueLevel(parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Laser Focused</span>
            <span>Exhausted / Burned</span>
          </div>
        </div>
      </div>

      {/* Trading Rules Checklist */}
      <div className="space-y-4">
        <div className="text-2xs font-mono text-indigo-400 uppercase tracking-widest border-b border-[#1f2937] pb-1.5">
          Core Trading Commandments
        </div>

        <div className="space-y-4">
          {RULES_METADATA.map((rule) => {
            const isRespected = rulesStatus[rule.key];
            return (
              <div
                key={rule.key}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isRespected
                    ? "bg-[#111827] border-slate-800 hover:border-slate-700"
                    : "bg-[#7f1d1d]/10 border-rose-900/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isRespected ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className="text-xs font-semibold text-white">{rule.label}</span>
                    </div>
                    <p className="text-gray-400 text-2xs leading-relaxed">{rule.desc}</p>
                  </div>

                  {/* Toggle buttons for Respected vs Broken */}
                  <div className="flex items-center bg-[#0d1222] p-1 rounded-md border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isRespected) handleRuleToggle(rule.key);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                        isRespected
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Respected
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isRespected) handleRuleToggle(rule.key);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                        !isRespected
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      Broken
                    </button>
                  </div>
                </div>

                {/* Mandatory Warning TextArea when rule is broken */}
                {!isRespected && (
                  <div className="mt-3.5 pt-3 border-t border-rose-950/50">
                    <label className="block text-[11px] font-semibold text-rose-300 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      Mandatory Violation Log - Explain Why You Broke This Rule:
                    </label>
                    <textarea
                      value={brokenRulesReasons[rule.key] || ""}
                      onChange={(e) => handleReasonChange(rule.key, e.target.value)}
                      required={!isRespected}
                      placeholder="Why did you violate your plan parameters? Document the psychological trigger or market trap that lured you in so it won't happen again."
                      rows={2}
                      className="w-full bg-[#0d1222] border border-rose-900/60 focus:border-rose-500 rounded-lg p-2.5 text-xs text-rose-200 placeholder-rose-900/80 focus:outline-none transition-colors resize-none font-sans"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
