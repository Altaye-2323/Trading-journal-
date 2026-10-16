// Google Forms API integration service

export interface CreatedGoogleFormInfo {
  formId: string;
  title: string;
  responderUri: string;
  editUri: string;
  createdAt: string;
}

export async function createTradingJournalGoogleForm(
  accessToken: string,
  formCustomTitle?: string
): Promise<CreatedGoogleFormInfo> {
  const title = formCustomTitle || "Forex Trading Journal - Discipline & Psychology";

  // 1. Create the base Form
  const createRes = await fetch("https://forms.googleapis.com/v1/forms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: title,
        description:
          "Professional Forex Trading Journal with Execution Tracking, Technical Setup Grading, Psychological Metrics (FOMO/Fear/Fatigue), 5 Core Commandments Violation Log, and Daily Routine Audits.",
      },
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Failed to create Google Form: HTTP ${createRes.status} ${createRes.statusText}`
    );
  }

  const formData = await createRes.json();
  const formId = formData.formId;
  const responderUri = formData.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;
  const editUri = `https://docs.google.com/forms/d/${formId}/edit`;

  // 2. Add all structured questions & sections to the Form
  const requests = [
    // --- SECTION 1: TRADE SPECIFICATIONS ---
    {
      createItem: {
        item: {
          title: "Trader Name / Account ID",
          description: "Your trader handle or account number",
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 0 },
      },
    },
    {
      createItem: {
        item: {
          title: "Asset Pair",
          description: "Select or specify the currency / asset traded",
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: "RADIO",
                options: [
                  { value: "EUR/USD" },
                  { value: "GBP/USD" },
                  { value: "USD/JPY" },
                  { value: "AUD/USD" },
                  { value: "USD/CAD" },
                  { value: "USD/CHF" },
                  { value: "NZD/USD" },
                  { value: "GBP/JPY" },
                  { value: "EUR/JPY" },
                  { value: "XAU/USD (Gold)" },
                  { value: "BTC/USD" },
                  { value: "Other (Specify in notes)" },
                ],
              },
            },
          },
        },
        location: { index: 1 },
      },
    },
    {
      createItem: {
        item: {
          title: "Trade Date & Time (UTC or Local)",
          description: "Format: YYYY-MM-DD HH:MM (e.g. 2026-10-16 09:30)",
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 2 },
      },
    },
    {
      createItem: {
        item: {
          title: "Position Size (Lots)",
          description: "Total volume entered in standard lots (e.g. 1.0, 0.50, 0.10)",
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 3 },
      },
    },
    {
      createItem: {
        item: {
          title: "Capital Risked (%)",
          description: "Percentage of total account equity risked (e.g. 1.0%, 1.5%, 2.0%)",
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 4 },
      },
    },
    {
      createItem: {
        item: {
          title: "Entry Price",
          description: "Exact fill price at trade execution",
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 5 },
      },
    },
    {
      createItem: {
        item: {
          title: "Stop Loss Price / Pips",
          description: "Mandatory stop loss price level or pip distance",
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 6 },
      },
    },
    {
      createItem: {
        item: {
          title: "Take Profit Target",
          description: "Target exit price or reward target",
          questionItem: {
            question: {
              required: true,
              textQuestion: { paragraph: false },
            },
          },
        },
        location: { index: 7 },
      },
    },
    {
      createItem: {
        item: {
          title: "Break-Even (BE) Protected?",
          description: "Was the stop loss moved to entry after initial target reached?",
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: "RADIO",
                options: [
                  { value: "YES - Stop loss moved to risk-free break-even" },
                  { value: "NO - Standard stop loss / trade still developing" },
                ],
              },
            },
          },
        },
        location: { index: 8 },
      },
    },

    // --- SECTION 2: SETUP CONFLUENCE & PRE-TRADE CHECKLIST ---
    {
      createItem: {
        item: {
          title: "SECTION 2: Technical Confluence & Setup Grading",
          description: "Evaluate your technical criteria before pulling the trigger",
          pageBreakItem: {},
        },
        location: { index: 9 },
      },
    },
    {
      createItem: {
        item: {
          title: "Pre-Trade Confluence Checklist",
          description: "Select all rules verified prior to placing order:",
          questionItem: {
            question: {
              choiceQuestion: {
                type: "CHECKBOX",
                options: [
                  { value: "1. Trend Aligned with Higher Timeframe (Daily/4H)" },
                  { value: "2. Key Support / Resistance or Supply / Demand Level Confirmed" },
                  { value: "3. Multi-Timeframe Structure & Momentum In Sync" },
                  { value: "4. High-Impact News Checked (ForexFactory - No immediate Red Folders)" },
                  { value: "5. Risk-to-Reward Ratio Valid (Minimum 1:2 R:R mathematically verified)" },
                ],
              },
            },
          },
        },
        location: { index: 10 },
      },
    },
    {
      createItem: {
        item: {
          title: "Setup Quality Grade",
          description: "Algorithmic grade based on confluences present",
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: "RADIO",
                options: [
                  { value: "Grade A+ (All 5 technical confluences checked - High Conviction)" },
                  { value: "Grade B (3 to 4 technical confluences checked - Moderate Quality)" },
                  { value: "Grade C (2 or fewer confluences checked - Sub-optimal / Low Quality)" },
                ],
              },
            },
          },
        },
        location: { index: 11 },
      },
    },

    // --- SECTION 3: TRADER PSYCHOLOGY ---
    {
      createItem: {
        item: {
          title: "SECTION 3: Trader Psychology & Mental Capital",
          description: "Rate internal emotional and physiological state at time of entry",
          pageBreakItem: {},
        },
        location: { index: 12 },
      },
    },
    {
      createItem: {
        item: {
          title: "FOMO Score (Fear of Missing Out)",
          description: "Rate temptation to enter impulsively: 1 = Calm & Disciplined, 10 = Severe Chasing",
          questionItem: {
            question: {
              required: true,
              scaleQuestion: {
                low: 1,
                high: 10,
                lowLabel: "Calm & Patient",
                highLabel: "Extreme FOMO",
              },
            },
          },
        },
        location: { index: 13 },
      },
    },
    {
      createItem: {
        item: {
          title: "Fear & Hesitation Score",
          description: "Rate fear or anxiety: 1 = Confident & Decisive, 10 = Paralyzed / Scared",
          questionItem: {
            question: {
              required: true,
              scaleQuestion: {
                low: 1,
                high: 10,
                lowLabel: "Completely Confident",
                highLabel: "Paralyzed by Fear",
              },
            },
          },
        },
        location: { index: 14 },
      },
    },
    {
      createItem: {
        item: {
          title: "Sleep Quality Prior to Session",
          description: "Rate restfulness: 1 = Severe Insomnia / Exhausted, 10 = Deep 8h+ Restorative Sleep",
          questionItem: {
            question: {
              required: true,
              scaleQuestion: {
                low: 1,
                high: 10,
                lowLabel: "Sleep Deprived",
                highLabel: "Fully Rested",
              },
            },
          },
        },
        location: { index: 15 },
      },
    },
    {
      createItem: {
        item: {
          title: "Physical & Mental Fatigue Level",
          description: "Rate brain fog / exhaustion: 1 = Sharp & Alert, 10 = Drained / Heavy Brain Fog",
          questionItem: {
            question: {
              required: true,
              scaleQuestion: {
                low: 1,
                high: 10,
                lowLabel: "Peak Sharpness",
                highLabel: "Exhausted / Foggy",
              },
            },
          },
        },
        location: { index: 16 },
      },
    },

    // --- SECTION 4: THE 5 COMMANDMENTS ---
    {
      createItem: {
        item: {
          title: "SECTION 4: The 5 Core Trading Commandments",
          description: "Discipline enforcement: verify adherence to non-negotiable rules",
          pageBreakItem: {},
        },
        location: { index: 17 },
      },
    },
    {
      createItem: {
        item: {
          title: "Commandment Adherence Checklist",
          description: "Check EVERY rule you strictly respected for this trade:",
          questionItem: {
            question: {
              choiceQuestion: {
                type: "CHECKBOX",
                options: [
                  { value: "Commandment 1: Never Overtrade (Strict max 2 setups per session)" },
                  { value: "Commandment 2: Always Use a Hard Stop-Loss Before Entering" },
                  { value: "Commandment 3: Wait for Definite Candle Close Confirmation" },
                  { value: "Commandment 4: Never Chase Impulsive Price Spikes" },
                  { value: "Commandment 5: Respect Maximum Daily Loss Limit (No revenge trading)" },
                ],
              },
            },
          },
        },
        location: { index: 18 },
      },
    },
    {
      createItem: {
        item: {
          title: "Mandatory Violation Log: Explain Broken Rules",
          description:
            "If ANY of the 5 commandments above was NOT checked/broken, you MUST honestly explain why you broke it and what triggered the lapse:",
          questionItem: {
            question: {
              textQuestion: { paragraph: true },
            },
          },
        },
        location: { index: 19 },
      },
    },

    // --- SECTION 5: DAILY ROUTINES & POST-TRADE AUDIT ---
    {
      createItem: {
        item: {
          title: "SECTION 5: Daily Routines & Post-Trade Review",
          description: "Session preparation, post-trade audit, and reflections",
          pageBreakItem: {},
        },
        location: { index: 20 },
      },
    },
    {
      createItem: {
        item: {
          title: "Morning Routine Audit",
          description: "Check completed preparation items:",
          questionItem: {
            question: {
              choiceQuestion: {
                type: "CHECKBOX",
                options: [
                  { value: "Market Structure & Dominant Trend Analyzed" },
                  { value: "Key Support / Resistance & Liquidity Pools Marked" },
                  { value: "Economic Calendar Filtered (USD/EUR events noted)" },
                  { value: "Physical Hydration, Stretches & Breathing Done" },
                  { value: "Mental Focus Centered & Risk Parameter Set" },
                ],
              },
            },
          },
        },
        location: { index: 21 },
      },
    },
    {
      createItem: {
        item: {
          title: "Evening Routine Audit",
          description: "Check completed post-market wrap-up items:",
          questionItem: {
            question: {
              choiceQuestion: {
                type: "CHECKBOX",
                options: [
                  { value: "All Open Positions & Limit Orders Reconciled" },
                  { value: "Trades Logged with Confluences & Setup Grades" },
                  { value: "Emotional Triggers & Mistakes Documented" },
                  { value: "Trading Terminal & Charts Closed for the Night" },
                  { value: "Market Preps Done for Upcoming London/NY Sessions" },
                ],
              },
            },
          },
        },
        location: { index: 22 },
      },
    },
    {
      createItem: {
        item: {
          title: "Post-Trade Observations & Execution Takeaways",
          description: "What did the market teach you on this trade? What did you execute well?",
          questionItem: {
            question: {
              textQuestion: { paragraph: true },
            },
          },
        },
        location: { index: 23 },
      },
    },
  ];

  const updateRes = await fetch(
    `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    console.error("Batch update error:", errorData);
    throw new Error(
      errorData.error?.message ||
        `Created form, but failed to insert question items: HTTP ${updateRes.status}`
    );
  }

  const result: CreatedGoogleFormInfo = {
    formId,
    title,
    responderUri,
    editUri,
    createdAt: new Date().toISOString(),
  };

  return result;
}
