import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  setAccessToken,
} from "../services/googleAuth";
import {
  createTradingJournalGoogleForm,
  CreatedGoogleFormInfo,
} from "../services/googleForms";
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Share2,
  RefreshCw,
  Sparkles,
  LogOut,
  Maximize2,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface GoogleFormsSyncProps {
  onFormCreated?: (formInfo: CreatedGoogleFormInfo) => void;
  activeForm: CreatedGoogleFormInfo | null;
  setActiveForm: (form: CreatedGoogleFormInfo | null) => void;
  viewMode: "app" | "google-form";
  setViewMode: (mode: "app" | "google-form") => void;
}

export default function GoogleFormsSync({
  onFormCreated,
  activeForm,
  setActiveForm,
  viewMode,
  setViewMode,
}: GoogleFormsSyncProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [customTitle, setCustomTitle] = useState(
    "Forex Trading Discipline & Psychology Journal"
  );
  const [showConfig, setShowConfig] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, cachedToken) => {
        setCurrentUser(user);
        if (cachedToken) {
          setToken(cachedToken);
        }
      },
      () => {
        setCurrentUser(null);
        setToken(null);
      }
    );

    // Retrieve saved form from localStorage if exists
    const saved = localStorage.getItem("forex_google_form_info");
    if (saved && !activeForm) {
      try {
        const parsed = JSON.parse(saved);
        setActiveForm(parsed);
      } catch (e) {
        console.error("Failed to parse saved Google Form cache:", e);
      }
    }

    return () => unsubscribe();
  }, []);

  const showStatus = (text: string, type: "success" | "error" | "info") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setToken(res.accessToken);
      showStatus(
        `Signed in as ${res.user.email}. Google Forms access granted!`,
        "success"
      );
    } catch (err: any) {
      console.error(err);
      showStatus(
        err.message || "Failed to authenticate with Google.",
        "error"
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setCurrentUser(null);
      setToken(null);
      showStatus("Signed out of Google account.", "info");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateForm = async () => {
    let currentToken = token;
    if (!currentToken) {
      currentToken = await getAccessToken();
    }

    if (!currentToken) {
      // Prompt user to sign in
      try {
        setIsAuthenticating(true);
        const res = await googleSignIn();
        setCurrentUser(res.user);
        setToken(res.accessToken);
        currentToken = res.accessToken;
      } catch (err: any) {
        showStatus(
          "Please sign in with Google to create your Google Form journal.",
          "error"
        );
        setIsAuthenticating(false);
        return;
      } finally {
        setIsAuthenticating(false);
      }
    }

    setIsCreatingForm(true);
    try {
      showStatus("Creating full journal structure in Google Forms API...", "info");
      const formInfo = await createTradingJournalGoogleForm(
        currentToken,
        customTitle
      );
      setActiveForm(formInfo);
      localStorage.setItem("forex_google_form_info", JSON.stringify(formInfo));
      if (onFormCreated) {
        onFormCreated(formInfo);
      }
      showStatus(
        "🎉 Google Form successfully created in your Google Account! You can now use it directly.",
        "success"
      );
      // Automatically switch to Google Form mode for convenient viewing
      setViewMode("google-form");
    } catch (err: any) {
      console.error("Error creating Google Form:", err);
      // If token expired, clear token and ask to re-sign in
      if (err.message?.includes("401") || err.message?.includes("UNAUTHENTICATED")) {
        setAccessToken(null);
        setToken(null);
        showStatus(
          "Google session expired. Please sign in with Google again.",
          "error"
        );
      } else {
        showStatus(
          err.message || "Failed to generate Google Form. Check console.",
          "error"
        );
      }
    } finally {
      setIsCreatingForm(false);
    }
  };

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 sm:p-5 shadow-xl transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/70 border border-indigo-700/40 flex items-center justify-center flex-shrink-0 text-indigo-400">
            <svg
              className="w-5 h-5"
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
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                Google Forms Trading Journal
              </h2>
              <span className="text-[10px] bg-indigo-950 border border-indigo-800 text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                Workspace Synced
              </span>
            </div>
            <p className="text-2xs text-slate-400">
              Run your journal entirely in Google Forms — with trade stats, setup grading & psychology logs
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-[#090d16] p-1 rounded-lg border border-slate-800 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode("app")}
              className={`px-3 py-1 rounded font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "app"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Web Terminal
            </button>
            <button
              type="button"
              onClick={() => setViewMode("google-form")}
              className={`px-3 py-1 rounded font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "google-form"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
              </svg>
              Google Forms View
            </button>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`mb-4 px-3.5 py-2.5 rounded-lg border text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
              : statusMessage.type === "error"
              ? "bg-rose-950/60 border-rose-800 text-rose-300"
              : "bg-indigo-950/60 border-indigo-800 text-indigo-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          )}
          <span className="flex-grow">{statusMessage.text}</span>
        </div>
      )}

      {/* Account & Action Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Account Connection */}
        <div className="bg-[#0b101d] p-3.5 rounded-lg border border-slate-800">
          <div className="text-2xs font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span>Google Account Status</span>
            {currentUser && (
              <span className="flex items-center gap-1 text-emerald-400 text-2xs">
                <ShieldCheck className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                    {currentUser.email ? currentUser.email[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {currentUser.displayName || currentUser.email}
                  </div>
                  <div className="text-3xs text-slate-400 truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-2.5 py-1 text-3xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 rounded transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <p className="text-2xs text-slate-400 mb-2.5">
                Sign in with Google to create the journal directly inside your personal Google Drive / Google Forms account.
              </p>
              {/* Official Google Sign-In button styling as specified in skill */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="w-full bg-white hover:bg-slate-100 text-[#3c4043] font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm border border-slate-300 cursor-pointer disabled:opacity-50"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                {isAuthenticating
                  ? "Connecting to Google..."
                  : "Sign in with Google"}
              </button>
            </div>
          )}
        </div>

        {/* Right: Generation & Launch Buttons */}
        <div className="bg-[#0b101d] p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="text-2xs font-semibold uppercase text-slate-400 tracking-wider mb-2 flex items-center justify-between">
            <span>Google Forms Generator</span>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-indigo-400 hover:text-indigo-300 text-3xs underline cursor-pointer"
            >
              {showConfig ? "Hide Settings" : "Form Settings"}
            </button>
          </div>

          {showConfig && (
            <div className="mb-2.5">
              <label className="block text-3xs text-slate-400 mb-1">
                Form Title:
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-[#080d1a] border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateForm}
            disabled={isCreatingForm}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-950 cursor-pointer disabled:opacity-50"
          >
            {isCreatingForm ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Building Form with 24 Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>
                  {activeForm
                    ? "Re-Generate / Update Google Form"
                    : "Generate Complete Journal in Google Forms"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Form Display Card */}
      {activeForm && (
        <div className="mt-4 pt-4 border-t border-slate-800 bg-[#090d18] -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-xs font-bold text-emerald-300">
                  Active Google Form Ready: {activeForm.title}
                </h3>
              </div>
              <p className="text-3xs text-slate-400 mt-0.5">
                Form ID:{" "}
                <span className="font-mono text-slate-300">
                  {activeForm.formId}
                </span>{" "}
                • Ready to record entries anytime in Google Forms!
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={activeForm.responderUri}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-2xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open & Fill in Google Forms
              </a>

              <a
                href={activeForm.editUri}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-2xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                Edit Form & View Responses
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeForm.responderUri);
                  showStatus("Copied Google Form link to clipboard!", "success");
                }}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded text-2xs font-medium border border-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy Share Link"
              >
                <Share2 className="w-3 h-3" />
                Copy Link
              </button>
            </div>
          </div>

          {/* Quick Questions Summary Banner */}
          <div className="bg-[#0d1424] p-2.5 rounded border border-slate-800/80 text-3xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
            <span>✅ 5 Pre-Trade Confluences</span>
            <span>✅ Setup Grade (A+, B, C)</span>
            <span>✅ FOMO / Fear / Fatigue Scales (1-10)</span>
            <span>✅ 5 Core Discipline Commandments</span>
            <span>✅ Mandatory Broken Rule Violations Log</span>
            <span>✅ Morning & Evening Routines</span>
          </div>
        </div>
      )}
    </div>
  );
}
