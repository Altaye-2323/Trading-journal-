import React, { useState, useEffect } from "react";
import { CreatedGoogleFormInfo } from "../services/googleForms";
import { User } from "firebase/auth";
import {
  initAuth,
  googleSignIn,
} from "../services/googleAuth";
import {
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  Code2,
  Link,
  HelpCircle,
  Smartphone,
  Share2,
  Globe,
} from "lucide-react";

interface GoogleFormEmbedViewProps {
  activeForm: CreatedGoogleFormInfo | null;
  onCreateFormClick: () => void;
  isCreatingForm?: boolean;
  onLinkCustomForm?: (url: string) => void;
  onResetForm?: () => void;
}

export default function GoogleFormEmbedView({
  activeForm,
  onCreateFormClick,
  isCreatingForm = false,
  onLinkCustomForm,
  onResetForm,
}: GoogleFormEmbedViewProps) {
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [customUrlError, setCustomUrlError] = useState("");

  useEffect(() => {
    const unsub = initAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleCopy = () => {
    if (activeForm?.responderUri) {
      navigator.clipboard.writeText(activeForm.responderUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleConnectLink = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomUrlError("");
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setCustomUrlError("Please enter a Google Form URL");
      return;
    }
    if (!trimmed.includes("google.com/forms") && !trimmed.includes("forms.gle")) {
      setCustomUrlError("Please enter a valid Google Form link (e.g. https://docs.google.com/forms/... or https://forms.gle/...)");
      return;
    }

    if (onLinkCustomForm) {
      onLinkCustomForm(trimmed);
      setCustomUrlInput("");
    }
  };

  const googleAppsScriptCode = `function createForexTradingJournal() {
  var form = FormApp.create('Forex Trading Journal - Discipline & Psychology');
  form.setDescription('Professional Forex Trading Journal with Execution Tracking, Technical Setup Grading, Psychological Metrics (FOMO/Fear/Fatigue), 5 Core Commandments Violation Log, and Daily Routine Audits.');

  // SECTION 1: TRADE DETAILS
  form.addTextItem().setTitle('Trader Name / Account ID').setRequired(true);
  form.addMultipleChoiceItem()
      .setTitle('Asset Pair')
      .setChoiceValues(['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'GBP/JPY', 'EUR/JPY', 'XAU/USD (Gold)', 'BTC/USD', 'Other'])
      .setRequired(true);
  form.addTextItem().setTitle('Trade Date & Time (UTC or Local)').setRequired(true);
  form.addTextItem().setTitle('Position Size (Lots)').setRequired(true);
  form.addTextItem().setTitle('Capital Risked (%)').setRequired(true);
  form.addTextItem().setTitle('Entry Price').setRequired(true);
  form.addTextItem().setTitle('Stop Loss Price / Pips').setRequired(true);
  form.addTextItem().setTitle('Take Profit Target').setRequired(true);
  form.addMultipleChoiceItem()
      .setTitle('Break-Even (BE) Protected?')
      .setChoiceValues(['YES - Stop loss moved to risk-free break-even', 'NO - Standard stop loss / trade still developing'])
      .setRequired(true);

  // SECTION 2: SETUP GRADING & CONFLUENCE
  form.addPageBreakItem().setTitle('SECTION 2: Technical Confluence & Setup Grading');
  form.addCheckboxItem()
      .setTitle('Pre-Trade Confluence Checklist')
      .setChoiceValues([
        '1. Trend Aligned with Higher Timeframe (Daily/4H)',
        '2. Key Support / Resistance or Supply / Demand Level Confirmed',
        '3. Multi-Timeframe Structure & Momentum In Sync',
        '4. High-Impact News Checked (ForexFactory - No immediate Red Folders)',
        '5. Risk-to-Reward Ratio Valid (Minimum 1:2 R:R mathematically verified)'
      ]);
  form.addMultipleChoiceItem()
      .setTitle('Setup Quality Grade')
      .setChoiceValues([
        'Grade A+ (All 5 technical confluences checked - High Conviction)',
        'Grade B (3 to 4 technical confluences checked - Moderate Quality)',
        'Grade C (2 or fewer confluences checked - Sub-optimal / Low Quality)'
      ])
      .setRequired(true);

  // SECTION 3: PSYCHOLOGY & METRICS
  form.addPageBreakItem().setTitle('SECTION 3: Trader Psychology & Mental Capital');
  form.addScaleItem().setTitle('FOMO Score (Fear of Missing Out)').setBounds(1, 10).setLabels('Calm & Patient', 'Extreme FOMO / Chased').setRequired(true);
  form.addScaleItem().setTitle('Fear & Hesitation Score').setBounds(1, 10).setLabels('Completely Confident', 'Paralyzed by Fear').setRequired(true);
  form.addScaleItem().setTitle('Sleep Quality Prior to Session').setBounds(1, 10).setLabels('Sleep Deprived / Poor', 'Fully Rested (8h+)').setRequired(true);
  form.addScaleItem().setTitle('Physical & Mental Fatigue Level').setBounds(1, 10).setLabels('Peak Sharpness', 'Exhausted / Brain Fog').setRequired(true);

  // SECTION 4: THE 5 COMMANDMENTS
  form.addPageBreakItem().setTitle('SECTION 4: The 5 Core Trading Commandments');
  form.addCheckboxItem()
      .setTitle('Commandment Adherence Checklist (Check all rules respected):')
      .setChoiceValues([
        'Commandment 1: Never Overtrade (Strict max 2 setups per session)',
        'Commandment 2: Always Use a Hard Stop-Loss Before Entering',
        'Commandment 3: Wait for Definite Candle Close Confirmation',
        'Commandment 4: Never Chase Impulsive Price Spikes',
        'Commandment 5: Respect Maximum Daily Loss Limit (No revenge trading)'
      ]);
  form.addParagraphTextItem()
      .setTitle('Mandatory Violation Log: Explain Broken Rules')
      .setHelpText('If ANY rule was broken, you MUST honestly explain why you violated it and what triggered the lapse:');

  // SECTION 5: ROUTINES & POST-TRADE REVIEW
  form.addPageBreakItem().setTitle('SECTION 5: Daily Routines & Post-Trade Review');
  form.addCheckboxItem()
      .setTitle('Morning Routine Audit Completed:')
      .setChoiceValues([
        'Market Structure & Dominant Trend Analyzed',
        'Key Support / Resistance & Liquidity Pools Marked',
        'Economic Calendar Filtered (USD/EUR events noted)',
        'Physical Hydration, Stretches & Breathing Done',
        'Mental Focus Centered & Risk Parameter Set'
      ]);
  form.addCheckboxItem()
      .setTitle('Evening Routine Audit Completed:')
      .setChoiceValues([
        'All Open Positions & Limit Orders Reconciled',
        'Trades Logged with Confluences & Setup Grades',
        'Emotional Triggers & Mistakes Documented',
        'Trading Terminal & Charts Closed for the Night',
        'Market Preps Done for Upcoming London/NY Sessions'
      ]);
  form.addParagraphTextItem().setTitle('Post-Trade Observations & Execution Takeaways');

  Logger.log('Form URL: ' + form.getPublishedUrl());
  Logger.log('Edit URL: ' + form.getEditUrl());
}`;

  if (!activeForm) {
    return (
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl my-4 text-gray-200">
        
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-900 to-indigo-600 border border-indigo-400/30 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-950">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight font-mono mb-2">
            Get Your Google Form Link & Journal
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            You can generate your Google Form in 1 click, or paste any existing Google Form link below to connect it instantly.
          </p>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 rounded-full text-2xs font-semibold cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Click here for Step-by-Step Guide on Finding Your Google Link</span>
          </button>
        </div>

        {/* 2-Step Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          
          {/* STEP 1: Connect Google */}
          <div className={`p-5 rounded-xl border transition-all ${
            currentUser 
              ? "bg-emerald-950/20 border-emerald-500/40" 
              : "bg-[#0b101e] border-slate-800"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                METHOD 1 • STEP 1
              </span>
              {currentUser && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Connected
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-white mb-1">
              Connect Google Account
            </h3>
            <p className="text-2xs text-slate-400 mb-4 leading-relaxed">
              Authorizes Google Forms to generate the form directly in your account (<code>altayeyehualashet233@gmail.com</code>).
            </p>

            {currentUser ? (
              <div className="bg-[#070b14] p-3 rounded-lg border border-slate-800 flex items-center gap-2.5">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.email ? currentUser.email[0].toUpperCase() : "G"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{currentUser.displayName || currentUser.email}</div>
                  <div className="text-3xs text-emerald-400 font-mono">Ready to generate link</div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="w-full bg-white hover:bg-slate-100 text-[#3c4043] font-semibold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-2.5 transition-all shadow border border-slate-300 cursor-pointer disabled:opacity-50"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                {isSigningIn ? "Authorizing Google Account..." : "Sign in with Google"}
              </button>
            )}
          </div>

          {/* STEP 2: Generate Form */}
          <div className="bg-[#0b101e] p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  METHOD 1 • STEP 2
                </span>
                <span className="text-2xs text-slate-400">24 Questions Configured</span>
              </div>

              <h3 className="text-sm font-bold text-white mb-1">
                Auto-Generate Google Link
              </h3>
              <p className="text-2xs text-slate-400 mb-4 leading-relaxed">
                Automatically builds your form and gives you the instant <code>forms.gle</code> / view link.
              </p>
            </div>

            <button
              type="button"
              onClick={onCreateFormClick}
              disabled={isCreatingForm}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isCreatingForm ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Building Form in Your Google Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate Google Form Link Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* METHOD 2: Paste Any Existing Google Form Link */}
        <div className="bg-[#080d18] border border-slate-800 p-5 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-white">
                METHOD 2: Have a Google Form Link Already? Paste It Here
              </h3>
            </div>
            <span className="text-3xs font-mono text-slate-400">Instant Embed</span>
          </div>
          <p className="text-2xs text-slate-400 mb-3">
            If you already created a Google Form or have a share link (from <code>forms.google.com</code> or <code>drive.google.com</code>), paste it here to link it immediately without needing to sign in:
          </p>

          <form onSubmit={handleConnectLink} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="e.g. https://docs.google.com/forms/d/e/.../viewform or https://forms.gle/..."
              className="flex-grow bg-[#050811] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shadow"
            >
              Connect & Load Link
            </button>
          </form>
          {customUrlError && (
            <p className="text-2xs text-rose-400 mt-1.5">{customUrlError}</p>
          )}
        </div>

        {/* METHOD 3: 1-Click Apps Script Generator */}
        <div className="bg-[#080d18] border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">
                METHOD 3: 15-Second Google Apps Script (Zero-Auth)
              </h4>
            </div>
            <p className="text-3xs text-slate-400 mt-1">
              Run a quick script inside Google Apps Script to create the form directly in your Google Drive and log the link.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowScriptModal(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-2xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
            View Script Code
          </button>
        </div>

        {/* DETAILED GUIDE MODAL */}
        {showGuideModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  Detailed Guide: How to Get Your Google Form Link
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 text-2xs text-slate-300">
                <div className="bg-[#0b101e] p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <span>1. Open Google Forms / Google Drive</span>
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Go to <a href="https://forms.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">forms.google.com</a> or <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">drive.google.com</a> and click on your <strong>"Forex Trading Journal"</strong> form.
                  </p>
                </div>

                <div className="bg-[#0b101e] p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                    <span>2. Click the Purple "Send" Button</span>
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    In the top right corner of the Google Forms screen, click the big purple button that says <strong>"Send"</strong>.
                  </p>
                </div>

                <div className="bg-[#0b101e] p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span>3. Click the Link Icon 🔗 and Copy</span>
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    In the popup dialog that appears:
                    <br />• Click the <strong>Link icon</strong> 🔗 (the middle tab next to the envelope).
                    <br />• Check the box for <strong>"Shorten URL"</strong> to get a clean <code>forms.gle/...</code> link.
                    <br />• Click the <strong>"Copy"</strong> button in the bottom right corner.
                  </p>
                </div>

                <div className="bg-[#0b101e] p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-teal-400 mb-1 flex items-center gap-1.5">
                    <span>4. Use Your Google Link</span>
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    • <strong>Bookmark on Phone:</strong> Paste it into Chrome or Safari on your phone and tap "Add to Home Screen" to log trades in 1 tap!
                    <br />• <strong>Link to this App:</strong> Paste that link in the "Method 2" box on this screen to embed it!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCRIPT MODAL */}
        {showScriptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Google Apps Script Form Generator
                </h3>
                <button
                  type="button"
                  onClick={() => setShowScriptModal(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="text-2xs text-slate-300 space-y-2">
                <p>To create the form directly inside your Google Drive in 15 seconds:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Go to <a href="https://script.new" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">script.new</a>.</li>
                  <li>Paste the code below and click <strong>Run</strong> (▶).</li>
                  <li>It instantly creates the complete Forex Journal in your Google Drive and logs the link!</li>
                </ol>
              </div>

              <div className="relative flex-grow overflow-hidden rounded-lg border border-slate-800 bg-[#080d1a]">
                <pre className="p-3 text-3xs font-mono text-emerald-300 overflow-y-auto max-h-[300px]">
                  {googleAppsScriptCode}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(googleAppsScriptCode);
                    setScriptCopied(true);
                    setTimeout(() => setScriptCopied(false), 2500);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {scriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {scriptCopied ? "Script Copied!" : "Copy Full Script"}
                </button>

                <a
                  href="https://script.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open script.new in Google
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Active form exists! Embed and provide tools & direct copy links
  return (
    <div className="space-y-4">
      {/* Top Banner with Direct Links & Copyable Box */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white font-mono">
                {activeForm.title}
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Live Google Link Connected
              </span>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">
              Your official Google Form link is ready below. Share, bookmark, or fill it out!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={activeForm.responderUri}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Google Tab
            </a>

            {activeForm.editUri && (
              <a
                href={activeForm.editUri}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-2xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                View Responses & Sheet
              </a>
            )}

            {onResetForm && (
              <button
                type="button"
                onClick={onResetForm}
                className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-2xs font-medium border border-slate-800 transition-colors cursor-pointer"
                title="Change or Disconnect Google Form"
              >
                Change Link
              </button>
            )}

            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              title="Reload Form"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Copyable Link Bar */}
        <div className="bg-[#080d18] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="text-3xs text-slate-400 font-mono">Your Direct Link:</span>
            <span className="text-xs text-emerald-300 font-mono truncate select-all">
              {activeForm.responderUri}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-2xs font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer transition-colors shadow"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-300" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Google Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Live Google Form Frame */}
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl overflow-hidden shadow-2xl relative min-h-[850px] flex flex-col">
        <div className="bg-[#0d1222] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-2xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
            <span className="font-mono text-slate-300 truncate max-w-sm">
              {activeForm.responderUri}
            </span>
          </div>
          <span className="text-3xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Direct Google Forms Embed Active
          </span>
        </div>

        <iframe
          key={iframeKey}
          src={activeForm.responderUri}
          width="100%"
          height="950"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          className="w-full flex-grow border-0 rounded-b-xl bg-[#ffffff]"
          title="Google Forms Forex Journal"
        >
          Loading Google Form…
        </iframe>
      </div>
    </div>
  );
}
