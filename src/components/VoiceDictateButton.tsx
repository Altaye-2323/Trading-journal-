import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Sparkles, Check, X, Play, AlertCircle, Volume2 } from "lucide-react";

interface VoiceDictateButtonProps {
  onDictate: (text: string) => void;
  fieldName: string;
  fieldType?: "text" | "number" | "select" | "checkbox" | "textarea";
  selectOptions?: { value: string; label: string }[];
  className?: string;
}

// Map descriptive suggestions for every field to aid voice input and simulation
const FIELD_SUGGESTIONS: Record<string, string[]> = {
  "Name": ["My name is Altay", "Trader Sarah", "Debebe", "User Alpha"],
  "Email Address": ["altay@gmail.com", "trader@tradingjournal.com", "debebe@forex.com"],
  "Asset Symbol / Pair": ["EURUSD", "GBPJPY", "XAUUSD Gold", "BTCUSD Bitcoin", "GBPUSD", "USDJPY"],
  "Lot Size (Volume)": ["one point five lots", "zero point five lots", "two lots", "five lots"],
  "Risk Exposure": ["one percent risk", "two point five percent risk", "zero point eight percent"],
  "Break Even Active?": ["break even is yes", "no full risk", "shield is active", "be status is yes"],
  "Stop Loss": ["fifty pips", "stop loss at one point zero eight two zero", "thirty pips stop"],
  "Take Profit": ["one hundred pips take profit", "take profit at one point zero nine five zero", "eighty pips target"],
  "Checklist: Trend Aligned": ["trend is aligned", "yes matched", "completed"],
  "Checklist: Key Levels confirmed": ["support and resistance marked", "key levels confirmed", "done"],
  "Checklist: Multi-timeframe analysis": ["multi timeframe is done", "checked"],
  "Checklist: News Checked": ["news checked", "no high impact news", "completed"],
  "Checklist: Risk Reward Ratio Valid": ["risk reward is valid", "done", "yes minimum one to two achieved"],
  "Commandment: Never Overtrade": ["I overtraded because I wanted to recoup losses from yesterday", "I felt impatient and forced a trade"],
  "Commandment: Always Use Stop Loss": ["I omitted the stop loss hoping the trend would turn around quickly", "I forgot to add a stop because of quick volatility"],
  "Commandment: Wait for Candle Close": ["I jumped in early fearing I would miss the initial breakout candle", "I was impatient and didn't wait for the H4 candle close"],
  "Commandment: Never Chasing Price": ["I bought at the top because of sudden green candle FOMO", "I chased the price when the breakout was already gone"],
  "Commandment: Respect Max Daily Loss": ["I kept trading trying to win back my morning losses", "I over-traded to get back to break-even for the day"],
  "Routine: Market Structure Analyzed": ["market structure analyzed", "completed", "yes structural highs and lows are marked"],
  "Routine: Key Levels Marked": ["key levels marked", "done"],
  "Routine: Economic Calendar Checked": ["economic calendar checked", "done"],
  "Routine: Hydration & Stretch": ["hydration and stretch is done", "yes stretched"],
  "Routine: Mental Focus Centered": ["mental focus centered", "done"],
  "Routine: Open Positions Reviewed": ["open positions reviewed", "done"],
  "Routine: Trades Logged with Grades": ["trades logged with grades", "completed"],
  "Routine: Mistakes Documented": ["mistakes documented", "done"],
  "Routine: Terminal Closed": ["trading terminal closed", "done"],
  "Routine: Market Preps Done": ["evening market preparations completed", "done"],
};

export default function VoiceDictateButton({
  onDictate,
  fieldName,
  fieldType = "text",
  selectOptions,
  className = ""
}: VoiceDictateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isRecording) {
          recognitionRef.current?.stop();
        }
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isRecording]);

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
        processSpokenResult(resultText);
      };

      rec.onerror = (event: any) => {
        console.error("Local Speech Error:", event.error);
        if (event.error === "not-allowed") {
          setError("Iframe context restricts direct microphone. Please use simulator buttons below!");
        } else {
          setError(`Mic error: ${event.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Process spoken results according to field types
  const processSpokenResult = (text: string) => {
    const textLower = text.toLowerCase().trim();
    
    if (fieldType === "checkbox") {
      // Parse yes/no, checked/completed
      const isTrue =
        textLower.includes("yes") ||
        textLower.includes("check") ||
        textLower.includes("completed") ||
        textLower.includes("done") ||
        textLower.includes("active") ||
        textLower.includes("true");
      onDictate(isTrue ? "true" : "false");
      setTimeout(() => setIsOpen(false), 800);
      return;
    }

    if (fieldType === "number") {
      // Extract numbers
      // Handlers for words to numbers
      let cleaned = textLower
        .replace(/one/g, "1")
        .replace(/two/g, "2")
        .replace(/three/g, "3")
        .replace(/four/g, "4")
        .replace(/five/g, "5")
        .replace(/six/g, "6")
        .replace(/seven/g, "7")
        .replace(/eight/g, "8")
        .replace(/nine/g, "9")
        .replace(/zero/g, "0")
        .replace(/point/g, ".");
      
      const numMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) {
        onDictate(numMatch[1]);
        setTimeout(() => setIsOpen(false), 800);
      } else {
        setError(`Could not extract number from: "${text}". Try again.`);
      }
      return;
    }

    if (fieldType === "select" && selectOptions) {
      // Find matching select option
      const match = selectOptions.find(opt => 
        textLower.includes(opt.value.toLowerCase()) || 
        textLower.includes(opt.label.toLowerCase())
      );
      if (match) {
        onDictate(match.value);
        setTimeout(() => setIsOpen(false), 800);
      } else {
        // Fallback: exact match or select the closest
        onDictate(text);
      }
      return;
    }

    // Default: text or textarea
    onDictate(text);
    setTimeout(() => setIsOpen(false), 1200);
  };

  const handleToggleRecord = () => {
    if (!supported) {
      setError("Web Speech API not supported in this browser. Use simulation below!");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      try {
        setError(null);
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
        setError("Error opening microphone. Use simulator!");
      }
    }
  };

  const suggestions = FIELD_SUGGESTIONS[fieldName] || ["Done", "Completed", "Perfect"];

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Microphone Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg border cursor-pointer transition-all flex items-center justify-center ${
          isOpen 
            ? "bg-rose-950/80 border-rose-500 text-rose-400" 
            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-slate-700"
        } ${className}`}
        title={`Dictate voice for ${fieldName}`}
      >
        <Mic className="w-3.5 h-3.5" />
      </button>

      {/* Floating Dictation Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-2 z-50 w-72 bg-[#111827] border border-[#1f2937] rounded-xl p-4 shadow-2xl space-y-3.5 text-left border-t-4 border-t-rose-500 font-sans"
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono text-rose-400 uppercase tracking-wider block">Voice Dictate Line</span>
                <span className="text-xs font-bold text-white truncate max-w-[180px] block">{fieldName}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mic click button */}
            <div className="bg-[#0b0f19] rounded-lg p-3 border border-slate-800 text-center space-y-2">
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto cursor-pointer focus:outline-none transition-all ${
                  isRecording 
                    ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-950" 
                    : "bg-slate-800 text-rose-400 hover:bg-slate-700"
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <div className="text-2xs text-gray-300 font-medium font-mono">
                {isRecording ? "Listening closely... Speak now" : "Click mic to record spoken input"}
              </div>
            </div>

            {/* Simulated Voice Input section */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[9px] font-mono text-gray-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Simulated Voice Input / Hints</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(sug);
                      processSpokenResult(sug);
                    }}
                    className="text-2xs bg-[#0d1222] hover:bg-slate-800 text-gray-300 px-2 py-1 rounded border border-slate-800 hover:border-rose-500/40 text-left cursor-pointer transition-colors flex items-center gap-1 group w-full"
                  >
                    <Play className="w-2.5 h-2.5 text-emerald-500 group-hover:text-rose-400 flex-shrink-0" />
                    <span className="truncate">"{sug}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Micro status/error indicator */}
            {transcript && (
              <div className="bg-slate-900/40 p-2 rounded border border-slate-800 text-2xs italic text-gray-300">
                <span className="font-bold font-mono text-rose-400 uppercase text-[9px] block mb-0.5">Recognized:</span>
                "{transcript}"
              </div>
            )}

            {error && (
              <div className="bg-red-950/40 border border-red-900 p-2 rounded text-2xs text-red-400 flex items-start gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
