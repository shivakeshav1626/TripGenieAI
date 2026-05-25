import ApiError from "../utils/ApiError.js";
import { jsonrepair } from "jsonrepair";

// Default to a stable Gemini Flash model available on the API for generateContent
const GEMINI_MODEL = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/${GEMINI_MODEL}:generateContent`;

const stripCodeFence = (value) => String(value || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();

const extractJsonText = (value) => {
  const text = stripCodeFence(value);
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  const candidates = [firstBrace, firstBracket].filter((i) => i >= 0);
  if (candidates.length === 0) return text;
  const startIndex = Math.min(...candidates);
  const endIndex = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (endIndex <= startIndex) return text.slice(startIndex).trim();
  return text.slice(startIndex, endIndex + 1).trim();
};

const parseModelJson = (responseText) => {
  if (typeof responseText === "object" && responseText !== null) return responseText;
  const normalized = extractJsonText(responseText);
  console.debug("[Gemini] normalized JSON snippet:", normalized ? normalized.slice(0, 1200) : "<empty>");

  try {
    return JSON.parse(normalized);
  } catch (err) {
    console.warn("JSON.parse failed; attempting jsonrepair:", err?.message || err);
    try {
      const repaired = jsonrepair(normalized);
      console.debug("[Gemini] repaired JSON snippet:", repaired ? repaired.slice(0, 1200) : "<empty>");
      return JSON.parse(repaired);
    } catch (repairErr) {
      console.error("jsonrepair failed:", repairErr?.message || repairErr);
      throw new ApiError(502, "Gemini returned malformed JSON");
    }
  }
};

const readResponseText = (payload) => {
  const candidate = payload?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts.map((p) => p.text || "").join("").trim();
};

const generateTravelItineraryJson = async ({ systemInstruction = "", prompt = "", temperature = 0.35 }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ApiError(500, "Gemini API key is missing");

  const requestBody = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature, topP: 0.95, maxOutputTokens: 4096, responseMimeType: "application/json" },
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response;
    try {
      response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    } catch (networkErr) {
      console.error("Gemini network error:", networkErr?.message || networkErr);
      if (attempt === maxAttempts) throw new ApiError(502, "Failed to reach Gemini API");
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      continue;
    }

    const rawBody = await response.text().catch((_) => null);
    console.debug("[Gemini] status", response.status, "attempt", attempt);
    console.debug("[Gemini] rawBody", rawBody);

    if (!response.ok) {
      // retry on 5xx
      if (response.status >= 500 && attempt < maxAttempts) {
        console.warn("Gemini transient error, retrying", response.status, "attempt", attempt);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }

      let message = "Gemini request failed";
      try {
        const errObj = rawBody ? JSON.parse(rawBody) : null;
        message = errObj?.error?.message || errObj?.message || message;
      } catch (e) {
        message = rawBody || message;
      }

      console.error("Gemini API error (status=", response.status, "):", message);
      console.error("[Gemini] Raw error body:", rawBody);
      throw new ApiError(502, `Gemini API error: ${message}`);
    }

    let payload;
    try {
      payload = rawBody ? JSON.parse(rawBody) : null;
    } catch (err) {
      console.error("Failed to parse Gemini JSON response:", err?.message || err);
      throw new ApiError(502, "Invalid JSON received from Gemini");
    }

    const responseText = readResponseText(payload);
    console.debug("[Gemini] candidate text snippet:", responseText ? responseText.slice(0, 1200) : "<empty>");
    if (!responseText) {
      console.error("Gemini returned empty candidate response", payload);
      throw new ApiError(502, "Gemini returned an empty response");
    }

    // Try to parse; if malformed, try a tolerant unwrapping pass
    try {
      return parseModelJson(responseText);
    } catch (err) {
      console.warn("Initial parse failed, attempting tolerant unwrapping:", err?.message || err);
      let cleaned = responseText.trim();
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      cleaned = cleaned.replace(/\\\"/g, '"');

      try {
        return parseModelJson(cleaned);
      } catch (err2) {
        console.error("Tolerant parse also failed:", err2?.message || err2);
        throw new ApiError(502, "Gemini returned malformed JSON");
      }
    }
  }

  throw new ApiError(502, "Gemini API error: request failed after retries");
};

export { generateTravelItineraryJson };
