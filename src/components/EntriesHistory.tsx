import React from "react";
import { JournalEntry, Statistics } from "../types";
import { Trash2, TrendingUp, TrendingDown, ShieldAlert, Target, HeartPulse, User, Calendar, Award, AlertTriangle, ShieldCheck, Smile } from "lucide-react";

interface EntriesHistoryProps {
  entries: JournalEntry[];
  stats: Statistics;
  onDelete: (id: string) => Promise<void>;
}

export default function EntriesHistory({ entries, stats, onDelete }: EntriesHistoryProps) {
  
  const getGradeStyle = (grade: "A+" | "B" | "C") => {
    switch (grade) {
      case "A+":
        return "bg-emerald-950 text-emerald-400 border border-emerald-800";
      case "B":
        return "bg-amber-950 text-amber-400 border border-amber-800";
      case "C":
        return "bg-rose-950 text-rose-400 border border-rose-800";
    }
  };

  return (
    <div className="space-y-6" id="history-logs-panel">
      {/* Metrics Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Trades */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-3xs text-gray-400 uppercase font-mono tracking-wider">Total Trades Logged</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{stats.totalTrades}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Database storage active</p>
          </div>
          <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Setup Confluences */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-3xs text-gray-400 uppercase font-mono tracking-wider">Setup Confluence Grades</span>
            <div className="flex gap-2 items-baseline mt-1">
              <span className="text-xs font-mono font-bold text-emerald-400" title="A+ Trades">A+: {stats.gradeAPlusCount}</span>
              <span className="text-xs font-mono font-bold text-amber-400" title="B Trades">B: {stats.gradeBCount}</span>
              <span className="text-xs font-mono font-bold text-rose-400" title="C Trades">C: {stats.gradeCCount}</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Objective alignment metric</p>
          </div>
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Mental Indices */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-3xs text-gray-400 uppercase font-mono tracking-wider">Avg FOMO / Fear Index</span>
            <div className="text-lg font-bold font-mono text-white mt-1">
              <span className={stats.avgFomo > 5 ? "text-rose-400" : "text-emerald-400"}>{stats.avgFomo}</span>
              <span className="text-gray-600 mx-1">/</span>
              <span className={stats.avgFear > 5 ? "text-rose-400" : "text-emerald-400"}>{stats.avgFear}</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Goal: Keep both below 4.0</p>
          </div>
          <div className="p-2 bg-rose-950 text-rose-400 rounded-lg">
            <Smile className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Discipline Health */}
        <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xl flex items-center justify-between shadow">
          <div>
            <span className="text-3xs text-gray-400 uppercase font-mono tracking-wider">Total Rules Violated</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${stats.rulesBrokenCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {stats.rulesBrokenCount}
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Mandatory reason logged</p>
          </div>
          <div className={`p-2 rounded-lg ${stats.rulesBrokenCount > 0 ? "bg-rose-950 text-rose-400" : "bg-emerald-950 text-emerald-400"}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Journal History Table card */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 md:p-6 border-b border-[#1f2937]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Historical Trading Ledger</h2>
          <p className="text-xs text-gray-400 mt-0.5">Complete record of verified trade setups, psychology indices, and rule explanations</p>
        </div>

        {entries.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-gray-600">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-300">No trading logs in database</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Please use the voice recorder or command simulator above to parse and save your very first journal log.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1f2937]">
            {entries.map((entry) => {
              // Extract broken rules count and text
              const brokenRulesList: string[] = [];
              if (entry.rulesStatus) {
                if (!entry.rulesStatus.neverOvertrade) brokenRulesList.push("Never Overtrade");
                if (!entry.rulesStatus.alwaysUseStopLoss) brokenRulesList.push("Always Use Stop Loss");
                if (!entry.rulesStatus.waitForCandleClose) brokenRulesList.push("Wait for Candle Close");
                if (!entry.rulesStatus.neverChasingPrice) brokenRulesList.push("Never Chasing Price");
                if (!entry.rulesStatus.respectMaxDailyLoss) brokenRulesList.push("Respect Max Daily Loss");
              }

              return (
                <div key={entry.id} className="p-5 md:p-6 hover:bg-[#131b2e]/30 transition-colors space-y-4">
                  {/* Row Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-black font-mono text-white bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                        {entry.assetPair}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${getGradeStyle(entry.setupGrade)}`}>
                        Grade {entry.setupGrade} Setup
                      </span>
                      <span className="text-gray-400 text-2xs font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {entry.tradeDate} @ {entry.tradeTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xs font-mono text-gray-500 bg-[#0d1222] px-2 py-1 rounded border border-slate-800">
                        ID: {entry.id.substring(6, 14)}
                      </span>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="p-1.5 bg-[#7f1d1d]/10 text-rose-400 hover:text-white hover:bg-red-600 rounded-lg cursor-pointer transition-all border border-rose-900/40 hover:border-red-500"
                        title="Delete trade entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lot and Profit Targets Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 bg-[#0d1222]/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                    <div>
                      <div className="text-3xs text-gray-500 font-mono uppercase tracking-wider">Lot Size</div>
                      <div className="font-mono font-bold text-gray-200 mt-0.5">{entry.positionSize} Lots</div>
                    </div>
                    <div>
                      <div className="text-3xs text-gray-500 font-mono uppercase tracking-wider">Capital Risked</div>
                      <div className="font-mono font-bold text-rose-400 mt-0.5">{entry.capitalRisked}%</div>
                    </div>
                    <div>
                      <div className="text-3xs text-gray-500 font-mono uppercase tracking-wider">Stop Loss (SL)</div>
                      <div className="font-mono font-bold text-gray-200 mt-0.5">{entry.stopLoss}</div>
                    </div>
                    <div>
                      <div className="text-3xs text-gray-500 font-mono uppercase tracking-wider">Take Profit (TP)</div>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5">{entry.takeProfit}</div>
                    </div>
                    <div>
                      <div className="text-3xs text-gray-500 font-mono uppercase tracking-wider">Break Even</div>
                      <span className={`inline-block font-mono font-bold mt-0.5 text-xs ${
                        entry.beStatus === "YES" ? "text-emerald-400" : "text-amber-500"
                      }`}>
                        {entry.beStatus}
                      </span>
                    </div>
                  </div>

                  {/* Psychology Sliders Summary */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs border-t border-dashed border-slate-800/60 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="font-semibold text-gray-300">FOMO Index:</span>
                      <span className={`font-mono font-bold ${entry.fomoScore > 5 ? "text-rose-400" : "text-emerald-400"}`}>
                        {entry.fomoScore}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="font-semibold text-gray-300">Anxiety/Fear:</span>
                      <span className={`font-mono font-bold ${entry.fearScore > 5 ? "text-rose-400" : "text-emerald-400"}`}>
                        {entry.fearScore}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="font-semibold text-gray-300">Sleep:</span>
                      <span className={`font-mono font-bold ${entry.sleepQuality < 5 ? "text-rose-400" : "text-emerald-400"}`}>
                        {entry.sleepQuality}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <span className="font-semibold text-gray-300">Fatigue:</span>
                      <span className={`font-mono font-bold ${entry.fatigueLevel > 5 ? "text-rose-400" : "text-emerald-400"}`}>
                        {entry.fatigueLevel}/10
                      </span>
                    </div>
                    {entry.name && (
                      <div className="ml-auto text-gray-400 text-2xs flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="font-medium text-slate-300">{entry.name} ({entry.email})</span>
                      </div>
                    )}
                  </div>

                  {/* Transcript box if present */}
                  {entry.transcript && (
                    <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/50 text-2xs text-gray-400 italic">
                      <strong className="text-gray-300 font-bold font-mono uppercase tracking-widest text-3xs block mb-0.5">Spoken Vocalization:</strong>
                      "{entry.transcript}"
                    </div>
                  )}

                  {/* Broken Rules and Explanations Area */}
                  {brokenRulesList.length > 0 ? (
                    <div className="space-y-2 border-t border-[#1f2937] pt-3">
                      <div className="flex items-center gap-1 text-2xs font-mono uppercase tracking-wider text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Commandments Broken ({brokenRulesList.length}):</span>
                      </div>
                      
                      <div className="space-y-2.5 pl-4 border-l-2 border-rose-900">
                        {brokenRulesList.map((ruleName) => {
                          // Find corresponding rule key
                          let ruleKey: keyof typeof entry.rulesStatus | null = null;
                          if (ruleName === "Never Overtrade") ruleKey = "neverOvertrade";
                          else if (ruleName === "Always Use Stop Loss") ruleKey = "alwaysUseStopLoss";
                          else if (ruleName === "Wait for Candle Close") ruleKey = "waitForCandleClose";
                          else if (ruleName === "Never Chasing Price") ruleKey = "neverChasingPrice";
                          else if (ruleName === "Respect Max Daily Loss") ruleKey = "respectMaxDailyLoss";

                          const reason = ruleKey && entry.brokenRulesReasons ? entry.brokenRulesReasons[ruleKey] : "";

                          return (
                            <div key={ruleName} className="space-y-1">
                              <div className="text-xs font-bold text-rose-300">{ruleName}</div>
                              {reason ? (
                                <p className="text-gray-300 text-xs italic bg-red-950/20 border border-red-900/30 p-2 rounded-md max-w-2xl leading-relaxed">
                                  "{reason}"
                                </p>
                              ) : (
                                <p className="text-red-400 text-3xs italic">No explanation provided in this entry.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-2xs font-mono uppercase tracking-widest text-emerald-400 border-t border-[#1f2937] pt-3 pl-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>All Core Rules Fully Respected (Flawless Discipline)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
