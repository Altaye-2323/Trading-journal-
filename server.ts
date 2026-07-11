import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Database file paths
const ENTRIES_FILE = path.join(process.cwd(), "data_entries.json");
const ROUTINES_FILE = path.join(process.cwd(), "data_routines.json");

// Helper to read JSON data safely
function readJSONFile<T>(filePath: string, defaultData: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

// Helper to write JSON data safely
function writeJSONFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize databases if needed
const initialEntries = readJSONFile(ENTRIES_FILE, []);
const initialRoutines = readJSONFile(ROUTINES_FILE, []);

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const geminiKey = process.env.GEMINI_API_KEY;

if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY" && geminiKey.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Fallback regex parser will be used.");
}

// API Routes

// 1. Voice-to-Text Parsing Endpoint using Gemini Structured JSON
app.post("/api/voice/parse", async (req, res) => {
  const { transcript, currentDateTime } = req.body;

  if (!transcript || typeof transcript !== "string") {
    return res.status(400).json({ error: "Transcript must be a non-empty string" });
  }

  // Fallback regex parsing function
  const fallbackParse = (text: string) => {
    const textLower = text.toLowerCase();
    
    // Default asset pairs regex
    const assetRegex = /\b(eurusd|gbpjpy|audusd|usdjpy|gbpusd|usdcad|usdchf|nzdusd|eurjpy|eurgbp|xauusd|gold|btcusd|ethusd)\b/i;
    const assetMatch = textLower.match(assetRegex);
    const assetPair = assetMatch ? assetMatch[0].toUpperCase() : "EURUSD";

    // Lot size parser (e.g., "1.5 lots", "0.5 lot", "size 2")
    const lotsMatch = textLower.match(/(\d+(?:\.\d+)?)\s*lot/i) || textLower.match(/lot(?:\s+size)?\s*of?\s*(\d+(?:\.\d+)?)/i);
    const positionSize = lotsMatch ? parseFloat(lotsMatch[1]) : 1.0;

    // Capital risked (e.g., "risking 2 percent", "risk 1.5%", "2% risk")
    const riskMatch = textLower.match(/risk(?:ing)?\s*(\d+(?:\.\d+)?)\s*%/i) || textLower.match(/(\d+(?:\.\d+)?)\s*%\s*risk/i) || textLower.match(/risk(?:ing)?\s*(\d+(?:\.\d+)?)\s*percent/i);
    const capitalRisked = riskMatch ? parseFloat(riskMatch[1]) : 1.0;

    // Take Profit, Stop Loss
    // e.g. "stop loss at 1.0820", "take profit at 1.0950", "stop at 50 pips", "tp of 80 pips"
    const slMatch = textLower.match(/stop\s*loss\s*(?:at|of)?\s*(\d+(?:\.\d+)?\b|\b\d+\s*pips)/i) || textLower.match(/sl\s*(?:at|of)?\s*(\d+(?:\.\d+)?\b|\b\d+\s*pips)/i);
    const stopLoss = slMatch ? slMatch[1].toUpperCase() : "50 pips";

    const tpMatch = textLower.match(/take\s*profit\s*(?:at|of)?\s*(\d+(?:\.\d+)?\b|\b\d+\s*pips)/i) || textLower.match(/tp\s*(?:at|of)?\s*(\d+(?:\.\d+)?\b|\b\d+\s*pips)/i);
    const takeProfit = tpMatch ? tpMatch[1].toUpperCase() : "100 pips";

    // BE status: e.g. "break even is yes", "breakeven", "be active"
    const beStatus = (textLower.includes("break even") || textLower.includes("breakeven") || textLower.includes("be active")) ? "YES" : "NO";

    // Date/Time
    const now = currentDateTime ? new Date(currentDateTime) : new Date();
    const tradeDate = now.toISOString().split("T")[0];
    const tradeTime = now.toTimeString().split(" ")[0].substring(0, 5);

    // Profile Info
    // e.g., "my name is Altay", "user altay"
    const nameMatch = textLower.match(/my\s+name\s+is\s+([a-zA-Z]+)/i) || textLower.match(/i\s+am\s+([a-zA-Z]+)/i);
    const name = nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : "Trader";
    const email = name !== "Trader" ? `${name.toLowerCase()}@tradingjournal.com` : "trader@tradingjournal.com";

    return {
      name,
      email,
      tradeDate,
      tradeTime,
      assetPair,
      positionSize,
      capitalRisked,
      takeProfit,
      stopLoss,
      beStatus
    };
  };

  // If Gemini is not initialized, run the fallback immediately
  if (!ai) {
    console.log("No Gemini API client initialized. Processing transcript with regex parser.");
    return res.json({
      parsed: fallbackParse(transcript),
      warning: "Processed using offline local parsing. Setup your GEMINI_API_KEY for deep AI-driven extraction."
    });
  }

  try {
    const prompt = `
      Extract forex trade journal data from the following spoken transcript.
      Transcript: "${transcript}"
      Current Time Context: ${currentDateTime || new Date().toISOString()}

      If specific fields are missing, make a smart guess:
      - Name/Email: Look for spoken name. If not found, use default "Trader" and "trader@tradingjournal.com".
      - Date/Time: Use the Current Time Context provided above to set tradeDate (YYYY-MM-DD) and tradeTime (HH:MM).
      - Asset Pair: Normalize it to a 6-character forex symbol (e.g. "EURUSD", "GBPJPY") or crypto (e.g., "BTCUSD").
      - Position Size: Extract lot size, default to 1.0.
      - Capital Risked: Extract risk percentage, default to 1.0.
      - Take Profit/Stop Loss: Extract values (could be pips like '40 pips' or price like '1.0850').
      - BE status: Is break even active/achieved? Respond with "YES" or "NO".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "First name of the trader" },
            email: { type: Type.STRING, description: "Email address" },
            tradeDate: { type: Type.STRING, description: "Trade Date (format YYYY-MM-DD)" },
            tradeTime: { type: Type.STRING, description: "Trade Time (format HH:MM)" },
            assetPair: { type: Type.STRING, description: "The trading pair, e.g., EURUSD" },
            positionSize: { type: Type.NUMBER, description: "Lot size" },
            capitalRisked: { type: Type.NUMBER, description: "Percentage of capital risked, e.g., 2 for 2%" },
            takeProfit: { type: Type.STRING, description: "Take Profit target price or pip count" },
            stopLoss: { type: Type.STRING, description: "Stop Loss target price or pip count" },
            beStatus: { type: Type.STRING, description: "Break Even Status, must be YES or NO" }
          },
          required: ["name", "email", "tradeDate", "tradeTime", "assetPair", "positionSize", "capitalRisked", "takeProfit", "stopLoss", "beStatus"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({ parsed: parsedData });

  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    // If Gemini fails, gracefully fallback to regex extraction so user never experiences an error
    return res.json({
      parsed: fallbackParse(transcript),
      warning: "AI extraction encountered an error; processed using robust fallback regex parser."
    });
  }
});

// 2. Journal Entries CRUD

// GET all entries
app.get("/api/journal", (req, res) => {
  const entries = readJSONFile<any[]>(ENTRIES_FILE, []);
  // Sort entries by date and time descending
  const sorted = [...entries].sort((a, b) => {
    const dateTimeA = `${a.tradeDate}T${a.tradeTime}`;
    const dateTimeB = `${b.tradeDate}T${b.tradeTime}`;
    return new Date(dateTimeB).getTime() - new Date(dateTimeA).getTime();
  });
  res.json(sorted);
});

// POST save entry
app.post("/api/journal", (req, res) => {
  const entries = readJSONFile<any[]>(ENTRIES_FILE, []);
  const newEntry = {
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
    ...req.body
  };
  entries.push(newEntry);
  writeJSONFile(ENTRIES_FILE, entries);
  res.status(201).json(newEntry);
});

// PUT update entry
app.put("/api/journal/:id", (req, res) => {
  const { id } = req.params;
  const entries = readJSONFile<any[]>(ENTRIES_FILE, []);
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Entry not found" });
  }

  entries[index] = {
    ...entries[index],
    ...req.body
  };
  writeJSONFile(ENTRIES_FILE, entries);
  res.json(entries[index]);
});

// DELETE entry
app.delete("/api/journal/:id", (req, res) => {
  const { id } = req.params;
  const entries = readJSONFile<any[]>(ENTRIES_FILE, []);
  const filtered = entries.filter(e => e.id !== id);
  writeJSONFile(ENTRIES_FILE, filtered);
  res.json({ success: true });
});

// 3. Routines State Management
app.get("/api/routines", (req, res) => {
  const { date } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split("T")[0];
  const routines = readJSONFile<any[]>(ROUTINES_FILE, []);
  
  let dayRoutine = routines.find(r => r.date === targetDate);
  if (!dayRoutine) {
    // Create new daily routine checklist state
    dayRoutine = {
      date: targetDate,
      morningCompleted: false,
      morningCompletedAt: null,
      morningItems: {
        marketStructureAnalyzed: false,
        keyLevelsMarked: false,
        economicCalendarChecked: false,
        hydrationAndStretchDone: false,
        mentalFocusCentered: false
      },
      eveningCompleted: false,
      eveningCompletedAt: null,
      eveningItems: {
        openPositionsReviewed: false,
        tradesLoggedWithGrades: false,
        mistakesDocumented: false,
        terminalClosed: false,
        marketPrepsDone: false
      }
    };
    routines.push(dayRoutine);
    writeJSONFile(ROUTINES_FILE, routines);
  }
  res.json(dayRoutine);
});

// POST save routines
app.post("/api/routines", (req, res) => {
  const updatedRoutine = req.body;
  if (!updatedRoutine.date) {
    return res.status(400).json({ error: "Date parameter is required in routine payload" });
  }

  const routines = readJSONFile<any[]>(ROUTINES_FILE, []);
  const index = routines.findIndex(r => r.date === updatedRoutine.date);
  
  if (index !== -1) {
    routines[index] = { ...routines[index], ...updatedRoutine };
  } else {
    routines.push(updatedRoutine);
  }
  
  writeJSONFile(ROUTINES_FILE, routines);
  res.json(updatedRoutine);
});

// 4. Statistics Endpoint
app.get("/api/statistics", (req, res) => {
  const entries = readJSONFile<any[]>(ENTRIES_FILE, []);
  const totalTrades = entries.length;

  let gradeAPlusCount = 0;
  let gradeBCount = 0;
  let gradeCCount = 0;
  let fomoSum = 0;
  let fearSum = 0;
  let sleepSum = 0;
  let fatigueSum = 0;
  let rulesBrokenCount = 0;

  entries.forEach(entry => {
    if (entry.setupGrade === "A+") gradeAPlusCount++;
    else if (entry.setupGrade === "B") gradeBCount++;
    else if (entry.setupGrade === "C") gradeCCount++;

    fomoSum += entry.fomoScore || 1;
    fearSum += entry.fearScore || 1;
    sleepSum += entry.sleepQuality || 1;
    fatigueSum += entry.fatigueLevel || 1;

    // Count broken rules
    if (entry.rulesStatus) {
      Object.keys(entry.rulesStatus).forEach(key => {
        if (entry.rulesStatus[key] === false) {
          rulesBrokenCount++;
        }
      });
    }
  });

  res.json({
    totalTrades,
    gradeAPlusCount,
    gradeBCount,
    gradeCCount,
    avgFomo: totalTrades ? parseFloat((fomoSum / totalTrades).toFixed(1)) : 0,
    avgFear: totalTrades ? parseFloat((fearSum / totalTrades).toFixed(1)) : 0,
    avgSleep: totalTrades ? parseFloat((sleepSum / totalTrades).toFixed(1)) : 0,
    avgFatigue: totalTrades ? parseFloat((fatigueSum / totalTrades).toFixed(1)) : 0,
    rulesBrokenCount
  });
});

// Vite Middleware Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Forex Trading Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
