import React, { useState, useEffect } from "react";
import { RoutineStatus } from "../types";
import { ListChecks, Sun, Moon, Clock, Save, Info, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

interface RoutinesSectionProps {
  routineState: RoutineStatus;
  setRoutineState: React.Dispatch<React.SetStateAction<RoutineStatus>>;
  onSaveRoutine: (state: RoutineStatus) => Promise<void>;
  simHour: number;
  simMin: number;
  useSimTime: boolean;
  setSimHour: (h: number) => void;
  setSimMin: (m: number) => void;
  setUseSimTime: (b: boolean) => void;
  onTriggerAlarm: (msg: string | null) => void;
}

const MORNING_ITEMS = [
  { key: "marketStructureAnalyzed" as const, label: "Market Structure Analyzed", desc: "Identified Daily/4H bias, break of structure, or liquidity sweep targets." },
  { key: "keyLevelsMarked" as const, label: "Key Levels Marked", desc: "Plotted key Support/Resistance, Fibonacci retracements, and Order Blocks." },
  { key: "economicCalendarChecked" as const, label: "Economic Calendar Checked", desc: "Flagged times of major scheduled financial news releases (CPI, PPI, FOMC)." },
  { key: "hydrationAndStretchDone" as const, label: "Hydration & Stretching Done", desc: "Secured physical readiness. Stretched and prepared water to avoid fatigue." },
  { key: "mentalFocusCentered" as const, label: "Mental Focus Centered", desc: "Completed 2-minute breathing centering loop. Trading with a blank slate." }
];

const EVENING_ITEMS = [
  { key: "openPositionsReviewed" as const, label: "Open Positions Reviewed", desc: "Audited active setups, adjusted trail stops, or confirmed overnight rollover." },
  { key: "tradesLoggedWithGrades" as const, label: "Trades Logged with Grades", desc: "Committed all executed transactions to the journal database with confluence grades." },
  { key: "mistakesDocumented" as const, label: "Trading Mistakes Documented", desc: "Notated rule violations, cognitive biases, or execution errors with explanations." },
  { key: "terminalClosed" as const, label: "Trading Terminal Fully Closed", desc: "Disconnected from MT4/MT5/TradingView. Elude the temptation of late-night trading." },
  { key: "marketPrepsDone" as const, label: "Tomorrow's Market Preparation", desc: "Conducted initial daily charts review to prepare prospective levels for tomorrow." }
];

export default function RoutinesSection({
  routineState,
  setRoutineState,
  onSaveRoutine,
  simHour,
  simMin,
  useSimTime,
  setSimHour,
  setSimMin,
  setUseSimTime,
  onTriggerAlarm
}: RoutinesSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Get active time for evaluating alarms
  const getActiveTime = () => {
    if (useSimTime) {
      return { hour: simHour, min: simMin };
    } else {
      const now = new Date();
      return { hour: now.getHours(), min: now.getMinutes() };
    }
  };

  const activeTime = getActiveTime();

  // Evaluate Routines Deadlines and Trigger Alarms in Real-Time
  useEffect(() => {
    const { hour } = activeTime;

    // 1. Morning Pre-Trade Checklist Time Lock: 11:00 AM
    // Past 11:00 AM, if morning completed is false, trigger alarm.
    const isPastMorningDeadline = hour >= 11;
    const morningIncomplete = !routineState.morningCompleted;

    // 2. Evening Post-Trade Checklist Time Lock: Between 4:00 PM and 6:00 PM (16:00 - 18:00)
    // If time is between 16:00 and 18:00, and evening completed is false, trigger alarm.
    const isDuringEveningDeadline = hour >= 16 && hour < 18;
    const eveningIncomplete = !routineState.eveningCompleted;

    if (isPastMorningDeadline && morningIncomplete) {
      onTriggerAlarm(
        `DISCIPLINE VIOLATION: Morning Pre-Trade checklist NOT completed by 11:00 AM! Current Simulated Time: ${formatHourMin(hour, activeTime.min)}. Penalty alarm activated.`
      );
    } else if (isDuringEveningDeadline && eveningIncomplete) {
      onTriggerAlarm(
        `DISCIPLINE VIOLATION: Evening Post-Trade checklist is INCOMPLETE during the 4:00 PM - 6:00 PM verification window! Penalty alarm activated.`
      );
    } else {
      onTriggerAlarm(null);
    }
  }, [activeTime.hour, activeTime.min, routineState.morningCompleted, routineState.eveningCompleted]);

  const formatHourMin = (h: number, m: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMin} ${ampm}`;
  };

  const handleToggleMorning = (key: keyof typeof routineState.morningItems) => {
    setRoutineState((prev) => {
      const updatedItems = {
        ...prev.morningItems,
        [key]: !prev.morningItems[key]
      };
      
      // Auto-evaluate if all are complete
      const allDone = Object.values(updatedItems).every(Boolean);
      return {
        ...prev,
        morningItems: updatedItems,
        morningCompleted: allDone,
        morningCompletedAt: allDone ? new Date().toISOString() : undefined
      };
    });
  };

  const handleToggleEvening = (key: keyof typeof routineState.eveningItems) => {
    setRoutineState((prev) => {
      const updatedItems = {
        ...prev.eveningItems,
        [key]: !prev.eveningItems[key]
      };
      
      // Auto-evaluate if all are complete
      const allDone = Object.values(updatedItems).every(Boolean);
      return {
        ...prev,
        eveningItems: updatedItems,
        eveningCompleted: allDone,
        eveningCompletedAt: allDone ? new Date().toISOString() : undefined
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveRoutine(routineState);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 md:p-6 shadow-xl space-y-6" id="routines-panel">
      {/* Time Controller Card */}
      <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Routine Time Enforcer</span>
          </div>
          <div className="flex items-center bg-[#111827] p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setUseSimTime(false)}
              className={`px-2.5 py-1 text-3xs font-bold font-mono rounded cursor-pointer transition-all ${
                !useSimTime ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "text-gray-400"
              }`}
            >
              REAL TIME
            </button>
            <button
              onClick={() => setUseSimTime(true)}
              className={`px-2.5 py-1 text-3xs font-bold font-mono rounded cursor-pointer transition-all ${
                useSimTime ? "bg-indigo-950 text-indigo-400 border border-indigo-800" : "text-gray-400"
              }`}
            >
              SIMULATED TIME
            </button>
          </div>
        </div>

        {useSimTime ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-2xs text-gray-400">Drag to test penalty alarm triggers:</span>
              <span className="text-sm font-extrabold font-mono text-indigo-400 bg-indigo-950/40 px-2.5 py-1 border border-indigo-900/40 rounded-lg">
                {formatHourMin(simHour, simMin)}
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="21"
              step="1"
              value={simHour}
              onChange={(e) => {
                setSimHour(parseInt(e.target.value));
              }}
              className="w-full accent-indigo-500 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>8:00 AM (Pre-Market)</span>
              <span className="text-amber-500">11:00 AM (Morning Cutoff)</span>
              <span className="text-rose-500">4:00 - 6:00 PM (Evening Cutoff)</span>
              <span>9:00 PM (Review)</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <span className="text-2xs text-gray-400">Continuous system clock:</span>
            <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-900/40 rounded">
              Active: {formatHourMin(new Date().getHours(), new Date().getMinutes())}
            </span>
          </div>
        )}

        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/60 text-2xs text-slate-400 leading-relaxed flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Rules of discipline:</strong> Complete morning tasks before <span className="text-amber-400 font-bold">11:00 AM</span>, and evening tasks between <span className="text-rose-400 font-bold">4:00 PM and 6:00 PM</span>. Violating deadlines triggers a persistent, high-frequency penalty alert.
          </p>
        </div>
      </div>

      {/* Routine Checklists Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Morning Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Morning Pre-Trade Routine</h3>
            </div>
            <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full font-mono ${
              routineState.morningCompleted 
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                : "bg-amber-950 text-amber-400 border border-amber-800"
            }`}>
              {routineState.morningCompleted ? "COMPLETED" : "INCOMPLETE (Cutoff: 11:00 AM)"}
            </span>
          </div>

          <div className="space-y-2.5">
            {MORNING_ITEMS.map((item) => {
              const isChecked = routineState.morningItems[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggleMorning(item.key)}
                  className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 transition-all cursor-pointer ${
                    isChecked 
                      ? "bg-emerald-950/10 border-emerald-500/30 text-slate-200" 
                      : "bg-[#0d1222] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked ? "bg-emerald-500 border-emerald-500 text-black" : "border-gray-500"
                  }`}>
                    {isChecked && <span className="text-3xs font-extrabold font-sans">✓</span>}
                  </div>
                  <div>
                    <span className={`text-xs font-semibold block ${isChecked ? "text-emerald-300" : "text-gray-200"}`}>
                      {item.label}
                    </span>
                    <span className="text-gray-400 text-3xs mt-0.5 block leading-relaxed">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evening Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Evening Post-Trade Routine</h3>
            </div>
            <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full font-mono ${
              routineState.eveningCompleted 
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                : "bg-rose-950 text-rose-400 border border-rose-800"
            }`}>
              {routineState.eveningCompleted ? "COMPLETED" : "INCOMPLETE (Window: 4:00 - 6:00 PM)"}
            </span>
          </div>

          <div className="space-y-2.5">
            {EVENING_ITEMS.map((item) => {
              const isChecked = routineState.eveningItems[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleToggleEvening(item.key)}
                  className={`w-full text-left p-3 rounded-lg border flex items-start gap-3 transition-all cursor-pointer ${
                    isChecked 
                      ? "bg-emerald-950/10 border-emerald-500/30 text-slate-200" 
                      : "bg-[#0d1222] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isChecked ? "bg-emerald-500 border-emerald-500 text-black" : "border-gray-500"
                  }`}>
                    {isChecked && <span className="text-3xs font-extrabold font-sans">✓</span>}
                  </div>
                  <div>
                    <span className={`text-xs font-semibold block ${isChecked ? "text-emerald-300" : "text-gray-200"}`}>
                      {item.label}
                    </span>
                    <span className="text-gray-400 text-3xs mt-0.5 block leading-relaxed">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Routines Button */}
      <div className="flex justify-end pt-2 border-t border-[#1f2937]">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md hover:shadow-indigo-950"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Syncing..." : "Sync Routine Checklists to DB"}
        </button>
      </div>
    </div>
  );
}
