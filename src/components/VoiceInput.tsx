import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Sparkles, AlertCircle, Play, HelpCircle, Check, Info } from "lucide-react";

interface VoiceInputProps {
  onParsed: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PRESET_COMMANDS = [
  {
    label: "Scalp Long on EURUSD",
    text: "Bought 2.5 lots of EURUSD, risking 1.0 percent of my capital. Setting stop loss at 1.0820, take profit at 1.0910. Break even is active.",
  },
  {
    label: "Discipline Trade GBPJPY",
    text: "Enter short on GBPJPY, size is 1.5 lots, risking two percent. Stop loss set at 162.80, take profit at 161.20, break even status is no.",
  },
  {
    label: "XAUUSD (Gold) Position",
    text: "Position taken on Gold XAUUSD, bought five lots, risked one point five percent. Stop loss at twenty-five pips, take profit at eighty pips. No breakeven.",
  }
];

export default function VoiceInput({ onParsed, isLoading, setIsLoading }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSupported(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setError(null);
        setTranscript("");
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          setError("Microphone permission denied. Try standard typing simulation below!");
        } else {
          setError(`Speech recognition error: ${event.error}. Feel free to use the typing simulation.`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleRecord = () => {
    if (!supported) {
      setError("Web Speech API is not supported in this browser. Please use simulation mode below.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        setError(null);
        setWarning(null);
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
        setError("Could not start speech recognition. Use simulator below.");
      }
    }
  };

  const handleParse = async (textToParse: string) => {
    if (!textToParse.trim()) {
      setError("Please say something or choose/type a simulation command first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch("/api/voice/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: textToParse,
          currentDateTime: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (response.ok && data.parsed) {
        onParsed({ ...data.parsed, transcript: textToParse });
        if (data.warning) {
          setWarning(data.warning);
        }
      } else {
        setError(data.error || "Failed to parse speech transcript.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error communicating with Voice Parsing Server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 md:p-6 shadow-xl" id="voice-input-panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-950 text-rose-400 rounded-lg">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">Voice Command Portal</h2>
            <p className="text-xs text-gray-400">Speak or simulate your trade details to auto-fill the log</p>
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
          AI-POWERED
        </span>
      </div>

      {/* Main Microphone Button */}
      <div className="flex flex-col items-center justify-center py-6 bg-[#0d1222] rounded-xl border border-[#1f2937] mb-6">
        <motion.button
          onClick={handleToggleRecord}
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center w-20 h-20 rounded-full cursor-pointer focus:outline-none transition-all duration-300 ${
            isRecording
              ? "bg-red-600 text-white mic-glowing"
              : "bg-[#1f2937] text-rose-400 hover:bg-[#374151]"
          }`}
          id="mic-record-btn"
        >
          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          
          {isRecording && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          )}
        </motion.button>

        <p className="mt-4 text-sm font-medium text-gray-200">
          {isRecording ? "Listening closely... Speak now" : "Click to Start Voice Recording"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {supported ? "Direct browser speech-to-text" : "Speech API not active on this browser; use simulator"}
        </p>

        {/* Real-time speech result container */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 px-4 w-full max-w-lg text-center"
            >
              <div className="text-xs font-mono text-rose-400 uppercase tracking-widest mb-1">Transcribed Input</div>
              <p className="text-sm font-medium italic text-gray-300 bg-[#1e293b]/50 border border-slate-700/50 p-3 rounded-lg">
                "{transcript}"
              </p>
              <button
                onClick={() => handleParse(transcript)}
                disabled={isLoading}
                className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-1.5 mx-auto transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isLoading ? "AI Parsing..." : "Process Transcribed Audio"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Input / Simulation Box */}
      <div className="border-t border-[#1f2937] pt-5">
        <div className="flex items-center gap-1.5 mb-3 text-sm font-medium text-gray-300">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Microphone Simulation Mode</span>
          <span className="text-2xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">Quick Test</span>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Click one of the realistic trader statements below to instantly simulate the speech-to-text parser.
        </p>

        {/* Preset click buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {PRESET_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setTranscript(cmd.text);
                setError(null);
                setWarning(null);
                handleParse(cmd.text);
              }}
              disabled={isLoading}
              className="flex items-start gap-2 p-3 text-left rounded-lg bg-[#0d1222]/80 border border-slate-800 hover:border-emerald-600 hover:bg-[#1e293b]/30 text-xs transition-all group disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-emerald-500 group-hover:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-gray-200 block group-hover:text-emerald-400 transition-colors">
                  {cmd.label}
                </span>
                <span className="text-gray-400 text-2xs line-clamp-2 mt-0.5">{cmd.text}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Text box for custom simulator */}
        <div className="relative">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Or type/paste custom speech transcript here to test the voice parser..."
            rows={2}
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg p-3 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none pr-12 font-sans"
            disabled={isLoading}
          />
          <button
            onClick={() => handleParse(transcript)}
            disabled={isLoading || !transcript.trim()}
            className="absolute right-2 bottom-3 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-emerald-600 cursor-pointer"
            title="Parse current text"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications and Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-red-950/50 border border-red-900 rounded-lg flex items-start gap-2.5 text-xs text-red-400"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {warning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-amber-950/40 border border-amber-900/60 rounded-lg flex items-start gap-2.5 text-xs text-amber-400 font-mono"
          >
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
            <div>
              <span className="font-semibold text-amber-200 block mb-0.5">Parse Notice:</span>
              <p className="text-gray-300 leading-relaxed">{warning}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
