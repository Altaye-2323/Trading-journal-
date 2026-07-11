import React, { useState, useEffect } from "react";
import { JournalEntry } from "../types";
import { User, Mail, Calendar, Clock, DollarSign, Percent, TrendingUp, ShieldAlert, ArrowRight, Save, Clipboard } from "lucide-react";

interface TradingJournalFormProps {
  parsedData: any;
  onSave: (entryData: Partial<JournalEntry>) => Promise<void>;
  isSaving: boolean;
  preTradeChecklist: any;
  setupGrade: "A+" | "B" | "C";
  rulesStatus: any;
  brokenRulesReasons: any;
}

export default function TradingJournalForm({
  parsedData,
  onSave,
  isSaving,
  preTradeChecklist,
  setupGrade,
  rulesStatus,
  brokenRulesReasons
}: TradingJournalFormProps) {
  const [formData, setFormData] = useState({
    name: "Trader",
    email: "trader@tradingjournal.com",
    tradeDate: new Date().toISOString().split("T")[0],
    tradeTime: new Date().toTimeString().split(" ")[0].substring(0, 5),
    assetPair: "EURUSD",
    positionSize: 1.0,
    capitalRisked: 1.0,
    takeProfit: "100 pips",
    stopLoss: "50 pips",
    beStatus: "NO" as "YES" | "NO",
  });

  // Watch for incoming parsed data from voice or presets and apply
  useEffect(() => {
    if (parsedData) {
      setFormData((prev) => ({
        ...prev,
        name: parsedData.name ?? prev.name,
        email: parsedData.email ?? prev.email,
        tradeDate: parsedData.tradeDate ?? prev.tradeDate,
        tradeTime: parsedData.tradeTime ?? prev.tradeTime,
        assetPair: parsedData.assetPair ?? prev.assetPair,
        positionSize: parsedData.positionSize !== undefined ? Number(parsedData.positionSize) : prev.positionSize,
        capitalRisked: parsedData.capitalRisked !== undefined ? Number(parsedData.capitalRisked) : prev.capitalRisked,
        takeProfit: parsedData.takeProfit ?? prev.takeProfit,
        stopLoss: parsedData.stopLoss ?? prev.stopLoss,
        beStatus: (parsedData.beStatus === "YES" || parsedData.beStatus === "NO") ? parsedData.beStatus : prev.beStatus,
      }));
    }
  }, [parsedData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "positionSize" || name === "capitalRisked" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      preTradeChecklist,
      setupGrade,
      rulesStatus,
      brokenRulesReasons,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 md:p-6 shadow-xl space-y-6" id="journal-form-panel">
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <Clipboard className="w-5 h-5 text-emerald-400" />
          Trade Parameter Logs
        </h2>
        <p className="text-xs text-gray-400">Review, modify, and confirm details before saving to the secure database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Profile Info */}
        <div className="space-y-4 md:col-span-2 bg-[#0d1222] p-4 rounded-lg border border-slate-800">
          <div className="text-2xs font-mono text-emerald-400 uppercase tracking-widest">Trader Profile</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" /> Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#111827] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Execution Date
          </label>
          <input
            type="date"
            name="tradeDate"
            value={formData.tradeDate}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" /> Execution Time
          </label>
          <input
            type="time"
            name="tradeTime"
            value={formData.tradeTime}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Asset Pair */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" /> Asset Symbol / Pair
          </label>
          <select
            name="assetPair"
            value={formData.assetPair}
            onChange={handleChange}
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="EURUSD">EURUSD (Euro / US Dollar)</option>
            <option value="GBPJPY">GBPJPY (British Pound / Japanese Yen)</option>
            <option value="XAUUSD">XAUUSD (Gold Spot / US Dollar)</option>
            <option value="GBPUSD">GBPUSD (British Pound / US Dollar)</option>
            <option value="AUDUSD">AUDUSD (Australian Dollar / US Dollar)</option>
            <option value="USDJPY">USDJPY (US Dollar / Japanese Yen)</option>
            <option value="BTCUSD">BTCUSD (Bitcoin / US Dollar)</option>
          </select>
        </div>

        {/* Position Size (Lots) */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Lot Size (Volume)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="positionSize"
            value={formData.positionSize}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Capital Risked */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-gray-400" /> Risk Exposure (% of Capital)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="100"
            name="capitalRisked"
            value={formData.capitalRisked}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* BE status */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-gray-400" /> Break Even Active?
          </label>
          <select
            name="beStatus"
            value={formData.beStatus}
            onChange={handleChange}
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-semibold"
          >
            <option value="YES">YES - Shield Active</option>
            <option value="NO">NO - Full Risk Exposed</option>
          </select>
        </div>

        {/* Stop Loss & Take Profit */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            Stop Loss (SL)
          </label>
          <input
            type="text"
            name="stopLoss"
            value={formData.stopLoss}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-rose-400 font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="e.g. 50 pips or 1.0820"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            Take Profit (TP)
          </label>
          <input
            type="text"
            name="takeProfit"
            value={formData.takeProfit}
            onChange={handleChange}
            required
            className="w-full bg-[#0d1222] border border-[#1f2937] rounded-lg px-3 py-2 text-xs text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="e.g. 100 pips or 1.0950"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-emerald-950"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Persisting to Secure Node.js DB..." : "Commit Trade Entry to Database"}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </form>
  );
}
