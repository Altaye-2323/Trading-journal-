import React, { useState, useEffect } from "react";
import VoiceInput from "./components/VoiceInput";
import TradingJournalForm from "./components/TradingJournalForm";
import PsychologySection from "./components/PsychologySection";
import SetupGrading, { calculateGrade } from "./components/SetupGrading";
import RoutinesSection from "./components/RoutinesSection";
import PenaltyAlarm from "./components/PenaltyAlarm";
import EntriesHistory from "./components/EntriesHistory";
import { JournalEntry, RoutineStatus, Statistics } from "./types";
import { BookOpen, Compass, Shield, Activity, Calendar, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import GoogleFormsSync from "./components/GoogleFormsSync";
import GoogleFormEmbedView from "./components/GoogleFormEmbedView";
import { CreatedGoogleFormInfo, createTradingJournalGoogleForm } from "./services/googleForms";
import { getAccessToken, googleSignIn } from "./services/googleAuth";

export default function App() {
  // Voice parsing and form populate state
  const [parsedData, setParsedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Psychology sliders states
  const [fomoScore, setFomoScore] = useState(1);
  const [fearScore, setFearScore] = useState(1);
  const [sleepQuality, setSleepQuality] = useState(8);
  const [fatigueLevel, setFatigueLevel] = useState(2);

  // Pre-trade checklist states
  const [preTradeChecklist, setPreTradeChecklist] = useState({
    trendAligned: false,
    supportResistanceConfirmed: false,
    multiTimeframeAnalysis: false,
    newsCheckCompleted: false,
    riskRewardRatioValid: false,
  });

  // Core Trading Commandments states
  const [rulesStatus, setRulesStatus] = useState({
    neverOvertrade: true,
    alwaysUseStopLoss: true,
    waitForCandleClose: true,
    neverChasingPrice: true,
    respectMaxDailyLoss: true,
  });

  // Broken rules reasons (Mandatory text area states)
  const [brokenRulesReasons, setBrokenRulesReasons] = useState<{
    neverOvertrade?: string;
    alwaysUseStopLoss?: string;
    waitForCandleClose?: string;
    neverChasingPrice?: string;
    respectMaxDailyLoss?: string;
  }>({});

  // Morning and Evening routine checklists
  const [routineState, setRoutineState] = useState<RoutineStatus>({
    date: new Date().toISOString().split("T")[0],
    morningCompleted: false,
    morningItems: {
      marketStructureAnalyzed: false,
      keyLevelsMarked: false,
      economicCalendarChecked: false,
      hydrationAndStretchDone: false,
      mentalFocusCentered: false,
    },
    eveningCompleted: false,
    eveningItems: {
      openPositionsReviewed: false,
      tradesLoggedWithGrades: false,
      mistakesDocumented: false,
      terminalClosed: false,
      marketPrepsDone: false,
    },
  });

  // Historical ledger list
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<Statistics>({
    totalTrades: 0,
    gradeAPlusCount: 0,
    gradeBCount: 0,
    gradeCCount: 0,
    avgFomo: 0,
    avgFear: 0,
    avgSleep: 0,
    avgFatigue: 0,
    rulesBrokenCount: 0,
  });

  // Simulated Time Controls for enforcer testing
  const [simHour, setSimHour] = useState(9); // Default to 9:00 AM
  const [simMin, setSimMin] = useState(0);
  const [useSimTime, setUseSimTime] = useState(true);

  // Active Penalty Alarm notification text
  const [activeAlarmMessage, setActiveAlarmMessage] = useState<string | null>(null);

  // Notification Banner State
  const [banner, setBanner] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Google Forms Integration State
  const [activeForm, setActiveForm] = useState<CreatedGoogleFormInfo | null>(() => {
    const saved = localStorage.getItem("forex_google_form_info");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [viewMode, setViewMode] = useState<"app" | "google-form">("google-form");
  const [isCreatingFormGlobal, setIsCreatingFormGlobal] = useState(false);

  const handleGenerateFormGlobal = async () => {
    let token = await getAccessToken();
    if (!token) {
      try {
        const res = await googleSignIn();
        token = res.accessToken;
      } catch (err: any) {
        showBanner(err.message || "Please sign in with Google to create the form.", "error");
        return;
      }
    }

    setIsCreatingFormGlobal(true);
    try {
      const formInfo = await createTradingJournalGoogleForm(token);
      setActiveForm(formInfo);
      localStorage.setItem("forex_google_form_info", JSON.stringify(formInfo));
      showBanner("🎉 Google Form journal successfully generated in your Google Drive!", "success");
      setViewMode("google-form");
    } catch (err: any) {
      console.error(err);
      showBanner(err.message || "Failed to create Google Form.", "error");
    } finally {
      setIsCreatingFormGlobal(false);
    }
  };

  const handleLinkCustomForm = (url: string) => {
    let responderUri = url.trim();
    let editUri = "";
    if (responderUri.includes("/edit")) {
      editUri = responderUri;
      responderUri = responderUri.replace("/edit", "/viewform");
    } else {
      editUri = responderUri.replace("/viewform", "/edit");
    }

    const formInfo: CreatedGoogleFormInfo = {
      formId: "custom-" + Date.now(),
      title: "Forex Trading Discipline Journal",
      responderUri,
      editUri,
      createdAt: new Date().toISOString(),
    };

    setActiveForm(formInfo);
    localStorage.setItem("forex_google_form_info", JSON.stringify(formInfo));
    showBanner("Google Form link connected and loaded successfully!", "success");
    setViewMode("google-form");
  };

  const handleResetForm = () => {
    if (confirm("Disconnect current Google Form link? You can reconnect or generate a new one anytime.")) {
      setActiveForm(null);
      localStorage.removeItem("forex_google_form_info");
      showBanner("Google Form disconnected.", "info");
    }
  };

  // Load ledger on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch entries
      const entriesRes = await fetch("/api/journal");
      if (entriesRes.ok) {
        const entriesData = await entriesRes.json();
        setEntries(entriesData);
      }

      // Fetch stats
      const statsRes = await fetch("/api/statistics");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch routine checklist status
      const routinesRes = await fetch(`/api/routines?date=${new Date().toISOString().split("T")[0]}`);
      if (routinesRes.ok) {
        const routinesData = await routinesRes.json();
        setRoutineState(routinesData);
      }
    } catch (err) {
      console.error("Error booting application data:", err);
      showBanner("Failed to communicate with local API backend.", "error");
    }
  };

  const showBanner = (text: string, type: "success" | "error" | "info") => {
    setBanner({ text, type });
    setTimeout(() => setBanner(null), 5000);
  };

  // Callback when voice-to-text parsed
  const handleVoiceParsed = (data: any) => {
    setParsedData(data);
    showBanner(`Successfully parsed details for ${data.assetPair || "Forex Asset"}! Review parameters below.`, "success");
  };

  // Submit and save journal entry
  const handleSaveJournal = async (entryPayload: Partial<JournalEntry>) => {
    // Validation: Verify if any broken rules don't have descriptions
    let missingReason = false;
    Object.keys(rulesStatus).forEach((key) => {
      const isRespected = rulesStatus[key as keyof typeof rulesStatus];
      if (!isRespected) {
        const reason = brokenRulesReasons[key as keyof typeof brokenRulesReasons];
        if (!reason || !reason.trim()) {
          missingReason = true;
        }
      }
    });

    if (missingReason) {
      showBanner("Please explain why you broke your trading commandments before saving.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...entryPayload,
          fomoScore,
          fearScore,
          sleepQuality,
          fatigueLevel,
          transcript: parsedData?.transcript || undefined
        }),
      });

      if (response.ok) {
        showBanner("Trade entry successfully persisted in Node.js Database.", "success");
        // Reset states
        setParsedData(null);
        setPreTradeChecklist({
          trendAligned: false,
          supportResistanceConfirmed: false,
          multiTimeframeAnalysis: false,
          newsCheckCompleted: false,
          riskRewardRatioValid: false,
        });
        setRulesStatus({
          neverOvertrade: true,
          alwaysUseStopLoss: true,
          waitForCandleClose: true,
          neverChasingPrice: true,
          respectMaxDailyLoss: true,
        });
        setBrokenRulesReasons({});
        setFomoScore(1);
        setFearScore(1);

        // Reload lists
        await fetchData();
      } else {
        const errData = await response.json();
        showBanner(errData.error || "Failed to commit journal entry.", "error");
      }
    } catch (err) {
      console.error(err);
      showBanner("Network error committing entry to database.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Save routine checklists
  const handleSaveRoutines = async (updatedRoutine: RoutineStatus) => {
    try {
      const response = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoutine),
      });

      if (response.ok) {
        showBanner("Checklist status synchronized with cloud DB.", "success");
        await fetchData();
      } else {
        showBanner("Failed to sync routine progress.", "error");
      }
    } catch (err) {
      console.error(err);
      showBanner("Network error syncing routine checklist.", "error");
    }
  };

  // Delete trade entry
  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this ledger entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showBanner("Entry deleted successfully.", "success");
        await fetchData();
      } else {
        showBanner("Failed to delete entry.", "error");
      }
    } catch (err) {
      console.error(err);
      showBanner("Network error deleting ledger entry.", "error");
    }
  };

  // Override penalty alarm lockout
  const handleBypassAlarm = () => {
    setActiveAlarmMessage(null);
    showBanner("Alarm bypassed. Ensure you synchronize checklist soon to reinstate rating.", "info");
  };

  // Auto calculate grading score
  const calculatedGrade = calculateGrade(preTradeChecklist);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col relative pb-12 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Banner Notifications */}
      {banner && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border text-xs font-semibold animate-bounce ${
          banner.type === "success" 
            ? "bg-emerald-950 text-emerald-400 border-emerald-800" 
            : banner.type === "error"
            ? "bg-rose-950 text-rose-400 border-rose-800"
            : "bg-indigo-950 text-indigo-400 border-indigo-800"
        }`}>
          <span>{banner.text}</span>
        </div>
      )}

      {/* Persistent Full-Screen Discipline Alarm Overlay */}
      {activeAlarmMessage && (
        <PenaltyAlarm message={activeAlarmMessage} onBypass={handleBypassAlarm} />
      )}

      {/* Main High-Tech Terminal Header */}
      <header className="border-b border-[#1f2937] bg-[#0d1222] py-4 px-6 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900/40">
              <BookOpen className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white uppercase font-mono">
                  Forex Voice Journal
                </h1>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-[#1e293b] border border-slate-700 rounded-full text-slate-300">
                  v1.2 Active
                </span>
              </div>
              <p className="text-2xs text-gray-400">Zero-Friction Speech-to-Text Trade Logger & Discipline Enforcer</p>
            </div>
          </div>

          {/* Quick status telemetry metrics */}
          <div className="flex items-center gap-4 text-xs">
            <div className="bg-[#111827] px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <div>
                <span className="text-[10px] text-gray-500 block leading-none font-mono">Ledger Count</span>
                <span className="font-bold text-gray-200 font-mono leading-none">{entries.length} entries</span>
              </div>
            </div>

            <div className="bg-[#111827] px-3.5 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Shield className={`w-3.5 h-3.5 ${stats.rulesBrokenCount > 0 ? "text-rose-500" : "text-emerald-500"}`} />
              <div>
                <span className="text-[10px] text-gray-500 block leading-none font-mono">Discipline Index</span>
                <span className={`font-bold font-mono leading-none ${stats.rulesBrokenCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  {stats.rulesBrokenCount === 0 ? "Flawless" : `${stats.rulesBrokenCount} Broken`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 w-full flex-grow">
        
        {/* Google Forms Integration Hub */}
        <GoogleFormsSync
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onFormCreated={(form) => {
            setActiveForm(form);
            showBanner("Google Form created! You can now use your journal in Google Forms.", "success");
          }}
        />

        {/* View Toggle: Google Forms View vs Web Terminal View */}
        {viewMode === "google-form" ? (
          <GoogleFormEmbedView
            activeForm={activeForm}
            onCreateFormClick={handleGenerateFormGlobal}
            isCreatingForm={isCreatingFormGlobal}
            onLinkCustomForm={handleLinkCustomForm}
            onResetForm={handleResetForm}
          />
        ) : (
          /* Web Terminal Layout Grid: Left column (speech and checklists), Right column (saving log) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column A: Voice and Checklist scoring */}
            <div className="space-y-6">
              <VoiceInput
                onParsed={handleVoiceParsed}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />

              <SetupGrading
                preTradeChecklist={preTradeChecklist}
                setPreTradeChecklist={setPreTradeChecklist}
              />

              <PsychologySection
                fomoScore={fomoScore}
                setFomoScore={setFomoScore}
                fearScore={fearScore}
                setFearScore={setFearScore}
                sleepQuality={sleepQuality}
                setSleepQuality={setSleepQuality}
                fatigueLevel={fatigueLevel}
                setFatigueLevel={setFatigueLevel}
                rulesStatus={rulesStatus}
                setRulesStatus={setRulesStatus}
                brokenRulesReasons={brokenRulesReasons}
                setBrokenRulesReasons={setBrokenRulesReasons}
              />
            </div>

            {/* Column B: Active trading form & routines logs */}
            <div className="space-y-6">
              <TradingJournalForm
                parsedData={parsedData}
                onSave={handleSaveJournal}
                isSaving={isSaving}
                preTradeChecklist={preTradeChecklist}
                setupGrade={calculatedGrade}
                rulesStatus={rulesStatus}
                brokenRulesReasons={brokenRulesReasons}
              />

              <RoutinesSection
                routineState={routineState}
                setRoutineState={setRoutineState}
                onSaveRoutine={handleSaveRoutines}
                simHour={simHour}
                simMin={simMin}
                useSimTime={useSimTime}
                setSimHour={setSimHour}
                setSimMin={setSimMin}
                setUseSimTime={setUseSimTime}
                onTriggerAlarm={setActiveAlarmMessage}
              />
            </div>
          </div>
        )}

        {/* Ledger & Statistics Segment */}
        <div className="border-t border-[#1f2937] pt-6">
          <EntriesHistory
            entries={entries}
            stats={stats}
            onDelete={handleDeleteEntry}
          />
        </div>

      </main>

      {/* Footer Info Area */}
      <footer className="text-center py-6 text-3xs font-mono text-gray-500 uppercase tracking-widest mt-auto border-t border-[#1f2937]/50 max-w-7xl mx-auto w-full">
        <p>© 2026 Forex Voice Journal. Executing on Secure sandboxed Cloud Run containers.</p>
        <p className="mt-1">Built with React, Express, Vite, Tailwind CSS, & Google Gemini AI models.</p>
      </footer>
    </div>
  );
}
