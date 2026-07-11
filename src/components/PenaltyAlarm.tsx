import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, RefreshCw, VolumeX, Volume2, Key, Info, HelpCircle } from "lucide-react";

interface PenaltyAlarmProps {
  message: string | null;
  onBypass: () => void;
}

const DISCIPLINE_QUOTES = [
  "Amateurs trade for excitement. Professionals trade to exploit mathematical edges.",
  "Patience is a weapon. The market is a device for transferring money from the impatient to the patient.",
  "If you cannot respect your pre-trade checklist, you cannot survive the market. Rules are your shield.",
  "Losses are inevitable, but discipline violations are unforgivable. Protect your capital at all costs.",
  "The best traders have no interest in being right, only in following their mechanical setup rules."
];

export default function PenaltyAlarm({ message, onBypass }: PenaltyAlarmProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes (300 seconds)
  const [soundActive, setSoundActive] = useState(true);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [drillCompleted, setDrillCompleted] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const qInterval = setInterval(() => {
      setActiveQuoteIdx((prev) => (prev + 1) % DISCIPLINE_QUOTES.length);
    }, 10000);
    return () => clearInterval(qInterval);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (countdown > 0) {
      const t = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(t);
    } else {
      setDrillCompleted(true);
    }
  }, [countdown]);

  // Audio synthesizer using Web Audio API to create a realistic siren sound
  useEffect(() => {
    if (!message) return;

    const startSynth = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(440, ctx.currentTime); // Pitch in Hz
        gain.gain.setValueAtTime(0, ctx.currentTime); // Start silent

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;

        // Create an alternating alarm tone (high-low sweep)
        let toggle = false;
        alarmIntervalRef.current = setInterval(() => {
          if (soundActive && ctx.state === "running") {
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(toggle ? 660 : 330, now);
            gain.gain.setValueAtTime(0.08, now); // Volume level
            // Smoothly decay tone
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            toggle = !toggle;
          }
        }, 500);
      } catch (err) {
        console.warn("Web Audio Context blocked or not supported on this browser:", err);
      }
    };

    startSynth();

    return () => {
      // Cleanup synth
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [message, soundActive]);

  const toggleSound = () => {
    setSoundActive((prev) => {
      const nextVal = !prev;
      if (!nextVal && gainNodeRef.current) {
        // Instantly mute the oscillator
        gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
      }
      return nextVal;
    });
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 select-none alarm-active-overlay overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0f1423] border-2 border-red-500 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 text-center border-t-8 border-t-red-600">
        
        {/* Header Indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-red-950 border-2 border-red-500 rounded-full animate-bounce">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-widest text-red-500 uppercase font-mono">
            Discipline Breakdown Detected
          </h1>
          <p className="text-xs text-red-400 font-bold bg-red-950/60 px-4 py-1.5 border border-red-900/40 rounded-full max-w-lg">
            {message}
          </p>
        </div>

        {/* Alarm Siren Sound Controller */}
        <div className="flex justify-center">
          <button
            onClick={toggleSound}
            className={`px-4 py-1.5 rounded-lg border text-2xs font-bold font-mono tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
              soundActive
                ? "bg-red-950/80 text-red-400 border-red-500/40 hover:bg-red-950"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            {soundActive ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            {soundActive ? "SIREN ENGAGED (CLICK TO MUTE)" : "SIREN MUTED"}
          </button>
        </div>

        {/* 5-Minute Time Lock Countdown */}
        <div className="bg-black/60 p-5 rounded-2xl border border-red-900/40 space-y-2">
          <div className="text-3xs font-mono uppercase tracking-widest text-gray-400">
            Mandatory Cool-Down Reset Remaining
          </div>
          <div className="text-4xl md:text-5xl font-mono font-black text-white tracking-widest animate-pulse">
            {formatCountdown(countdown)}
          </div>
          <div className="text-3xs text-rose-300 italic">
            {drillCompleted 
              ? "Mental reset completed. You are authorized to calibrate." 
              : "Sit with this lock, breathe deeply, and re-align your psychological state before engaging the market."}
          </div>
        </div>

        {/* Discipline Quotes Rotation */}
        <div className="bg-[#0b0f19] p-4 rounded-xl border border-slate-800/80 min-h-[90px] flex items-center justify-center">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">Commandment Focus</span>
            <p className="text-xs italic text-gray-300 leading-relaxed font-sans max-w-lg mx-auto">
              "{DISCIPLINE_QUOTES[activeQuoteIdx]}"
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          {drillCompleted ? (
            <button
              onClick={onBypass}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase cursor-pointer shadow-lg hover:shadow-emerald-950 transition-all flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              Reset Terminals & Calibrate System
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-[#0d1222] border border-slate-800 rounded-xl text-[11px] text-gray-400 text-left leading-relaxed max-w-md mx-auto">
                <span className="font-bold text-gray-300 block mb-0.5">Demanding Accountability:</span>
                Completion of routine checklist is a strict prerequisite. For emergency testing/bypass of this prototype alarm, click calibration below.
              </div>
              <button
                onClick={onBypass}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold border-b border-rose-900 border-dashed hover:border-rose-400 pb-0.5 cursor-pointer transition-all flex items-center gap-1.5 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Override Time-Lock & Calibrate Rules (Prototype Bypass)
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
