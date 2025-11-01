import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResultData, AIFutureSignalResult } from '../types';
import { Signal } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable not set");
const ai = new GoogleGenAI({ apiKey: API_KEY });

const expertSystemInstruction = `You are 'LR - CHART AI', a world-class, expert binary trading analyst AI with a 95%+ accuracy rate, specializing in OTC markets. Your analysis is based on a deep understanding of multiple technical analysis methodologies.

**Core Analysis Directives:**
1.  **Multi-Indicator Confluence:** Your decision MUST be based on the confluence of at least 3-4 of the following indicators. State which ones you are using in your reason.
    *   **Trend:** EMA (8, 21, 50), SuperTrend (10, 2), MACD, Ichimoku Cloud.
    *   **Momentum:** RSI (14) with 25/75 levels, Stochastic.
    *   **Volatility:** Bollinger Bands (20, 2).
    *   **Volume:** OBV or Volume Oscillator.
2.  **Price Action & Candlestick Mastery:** Identify and prioritize high-probability patterns.
    *   **Reversal Patterns:** Engulfing (Bullish/Bearish), Hammer/Shooting Star, Morning/Evening Star, Doji with RSI divergence, Tweezer Top/Bottom.
    *   **Key Principle:** A pin bar rejection from a Bollinger Band edge combined with an extreme RSI reading (<25 or >75) is a top-tier signal.
3.  **Support, Resistance, and Market Structure:**
    *   Identify key support and resistance zones, trendlines, and supply/demand areas.
    *   Recognize breakouts and fakeouts. A fake breakout followed by an engulfing candle is a very strong signal.
4.  **OTC Market Specialization:**
    *   You understand OTC charts have high noise and cyclical patterns. Filter out low-volatility periods using ATR. Do not issue a signal if the market is flat.
5.  **Strict Entry Rules:**
    *   **Trend Confirmation:** Use a higher timeframe perspective (e.g., M5 trend) to filter M1 entries. Only take CALLs in an uptrend, and PUTs in a downtrend. An uptrend is defined as price > EMA 50.
    *   **Exhaustion Detection:** Avoid trading after 3 consecutive large candles in the same direction.
    *   **Volume Confirmation:** A volume spike on a reversal candle significantly increases its validity.
`;

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    signal: { type: Type.STRING, enum: [Signal.CALL, Signal.PUT] },
    reason: { type: Type.STRING },
  },
  required: ['signal', 'reason'],
};

const futureSignalSchema = {
    type: Type.OBJECT,
    properties: {
        signals: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    time: { type: Type.STRING, description: "The predicted time for the signal (e.g., 'in 5 mins', 'at 14:30 UTC')." },
                    pair: { type: Type.STRING, description: "The asset pair for the signal." },
                    direction: { type: Type.STRING, enum: [Signal.CALL, Signal.PUT] },
                    reason: { type: Type.STRING, description: "A concise reason for this specific future signal." },
                },
                 required: ['time', 'pair', 'direction', 'reason'],
            }
        }
    },
    required: ['signals']
};


export async function analyzeChart(base64Image: string, mimeType: string): Promise<AnalysisResultData> {
  const prompt = `Your Task: Analyze the provided 1-minute timeframe trading chart. Based on your core directives, provide a single 'CALL' or 'PUT' signal for the very next 1-minute expiry. Your reasoning must be concise, highly technical, and directly reference the patterns and indicators on the chart that led to your decision. Be fast, results must be generated in under 10 seconds.`;

  const imagePart = { inlineData: { data: base64Image, mimeType } };
  const textPart = { text: prompt };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: expertSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1,
      }
    });

    const parsedResult = JSON.parse(response.text.trim());
    if (Object.values(Signal).includes(parsedResult.signal) && typeof parsedResult.reason === 'string') {
        return parsedResult as AnalysisResultData;
    }
    throw new Error("Invalid response structure from AI.");
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("The AI failed to process the chart analysis.");
  }
}

export async function analyzeForFutureSignals(base64Image: string, mimeType: string, pair: string): Promise<AIFutureSignalResult> {
    const prompt = `Your Task: Analyze the provided trading chart for the pair ${pair}. Based on your core directives and analysis of the current market structure, predict potential trading signals for the NEXT 30 MINUTES. Generate a list of 3-5 signals with at least a 3-5 minute interval between them. For each signal, provide the predicted time, pair, direction, and a brief technical reason.`;
  
    const imagePart = { inlineData: { data: base64Image, mimeType } };
    const textPart = { text: prompt.replace('{pair}', pair) };
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using a more powerful model for complex future prediction
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction: expertSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: futureSignalSchema,
          temperature: 0.4,
        }
      });
  
      const parsedResult = JSON.parse(response.text.trim());
       if (Array.isArray(parsedResult.signals)) {
        return parsedResult as AIFutureSignalResult;
      }
      throw new Error("Invalid future signal response structure from AI.");
    } catch (error) {
      console.error("Gemini API call for future signals failed:", error);
      throw new Error("The AI failed to process the future signal analysis.");
    }
  }