import Itinerary from "../models/Itinerary.js";
import Upload from "../models/Upload.js";
import ApiError from "../utils/ApiError.js";
import { generateTravelItineraryJson } from "./geminiService.js";
import crypto from "crypto";

const SYSTEM_PROMPT = `You are TripGenie AI, a premium travel planner for modern travelers.
Return only valid JSON.
Do not wrap the answer in markdown, code fences, or commentary.
Use concise, concrete, product-ready travel guidance.
When source OCR data is present, treat it as the primary factual source.
Do not invent confirmation numbers, flight numbers, hotel names, or dates unless they are explicitly present.
If information is missing, infer conservatively and record the assumption.

The JSON shape must be:
{
  "tripTitle": string,
  "destination": string,
  "origin": string,
  "tripSummary": {
    "overview": string,
    "bestFor": string,
    "travelStyle": string,
    "budgetRange": string,
    "weatherNote": string,
    "keyInsight": string
  },
  "hotelDetails": {
    "recommendedArea": string,
    "hotelType": string,
    "checkInStrategy": string,
    "checkOutStrategy": string,
    "amenities": [string],
    "bookingNotes": [string]
  },
  "transportSchedule": [
    {
      "day": number,
      "time": string,
      "mode": string,
      "from": string,
      "to": string,
      "duration": string,
      "bookingNote": string
    }
  ],
  "days": [
    {
      "day": number,
      "title": string,
      "focus": string,
      "morning": [
        {
          "time": string,
          "title": string,
          "description": string,
          "location": string,
          "cost": string,
          "bookingNote": string
        }
      ],
      "afternoon": [same structure as morning],
      "evening": [same structure as morning],
      "food": [
        {
          "meal": string,
          "recommendation": string,
          "area": string,
          "reason": string,
          "dietaryNotes": string
        }
      ],
      "notes": [string]
    }
  ],
  "nearbyAttractions": [
    {
      "name": string,
      "area": string,
      "whyGo": string,
      "bestTime": string,
      "estimatedCost": string,
      "travelTime": string
    }
  ],
  "foodRecommendations": [
    {
      "meal": string,
      "recommendation": string,
      "area": string,
      "reason": string,
      "dietaryNotes": string
    }
  ],
  "travelReminders": [string],
  "recommendations": [string],
  "assumptions": [string]
}`;

const clampNumber = (value, min, max, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
};

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const uniqueStrings = (values) => [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];

const createShareId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 16);

const buildTravelContext = ({ upload, preferences }) => {
  const daysRequested = clampNumber(preferences.days || preferences.durationDays, 1, 10, 3);
  const destination = preferences.destination || preferences.tripName || upload?.structuredData?.destination || upload?.structuredData?.summary || "Suggested destination";
  const origin = preferences.origin || upload?.structuredData?.origin || "";
  const tripTitle = preferences.tripName || `${destination} ${daysRequested}-Day Itinerary`;

  return {
    tripTitle,
    destination,
    origin,
    daysRequested,
    travelers: clampNumber(preferences.travelers, 1, 12, 2),
    budget: preferences.budget || "mid-range",
    travelStyle: preferences.travelStyle || "balanced",
    transportPreference: preferences.transportPreference || "mix of private and public transport",
    hotelPreference: preferences.hotelPreference || "centrally located comfortable hotel",
    foodPreference: preferences.foodPreference || "balanced local dining",
    interests: uniqueStrings(toArray(preferences.interests)),
    notes: uniqueStrings(toArray(preferences.notes)),
    startDate: preferences.startDate || upload?.structuredData?.dates?.[0] || "",
    endDate: preferences.endDate || upload?.structuredData?.dates?.[1] || "",
    sourceUpload: upload
      ? {
          id: upload._id,
          originalName: upload.originalName,
          status: upload.status,
          ocrText: upload.ocrText || "",
          structuredData: upload.structuredData || {},
          uploadedAt: upload.uploadedAt || upload.createdAt || null,
        }
      : null,
    detectedSignals: {
      documentType: upload?.structuredData?.documentType || "travel_document",
      dates: uniqueStrings(upload?.structuredData?.dates || []),
      amounts: uniqueStrings(upload?.structuredData?.amounts || []),
      confirmationNumbers: uniqueStrings(upload?.structuredData?.confirmationNumbers || []),
      flightNumbers: uniqueStrings(upload?.structuredData?.flightNumbers || []),
      hotels: uniqueStrings(upload?.structuredData?.hotels || []),
      summary: upload?.structuredData?.summary || "",
      keywords: uniqueStrings(upload?.structuredData?.keywords || []),
    },
  };
};

const buildPrompt = (travelContext) => {
  return `Create a premium, product-level travel itinerary using the following structured input.

Rules:
- Return a single valid JSON object only.
- Keep the itinerary day-wise and practical.
- Use the OCR signal data when present, but do not invent facts.
- Generate realistic hotel, transport, attraction, food, and reminder guidance.
- Match the trip pace to the requested style and budget.
- Include ${travelContext.daysRequested} day sections in the days array.
- Keep recommendations concise, specific, and traveler-friendly.

Structured input:
${JSON.stringify(travelContext, null, 2)}`;
};

const normalizeDayBlocks = (days, requestedDays) => {
  const fallbackDays = Array.from({ length: requestedDays }, (_, index) => ({
    day: index + 1,
    title: `Day ${index + 1}`,
    focus: "Suggested exploration",
    morning: [],
    afternoon: [],
    evening: [],
    food: [],
    notes: [],
  }));

  const sourceDays = Array.isArray(days) && days.length ? days : fallbackDays;

  return sourceDays.slice(0, requestedDays).map((day, index) => ({
    day: Number(day.day || day.dayNumber || index + 1),
    title: day.title || `Day ${index + 1}`,
    focus: day.focus || day.theme || "Suggested exploration",
    morning: Array.isArray(day.morning) ? day.morning : [],
    afternoon: Array.isArray(day.afternoon) ? day.afternoon : [],
    evening: Array.isArray(day.evening) ? day.evening : [],
    food: Array.isArray(day.food) ? day.food : Array.isArray(day.dining) ? day.dining : [],
    notes: Array.isArray(day.notes) ? day.notes : [],
  }));
};

const normalizeItineraryPayload = (generated, travelContext) => {
  const tripSummary = generated.tripSummary || generated.summary || {};
  const hotelDetails = generated.hotelDetails || generated.hotel || {};
  const transportSchedule = Array.isArray(generated.transportSchedule) ? generated.transportSchedule : [];
  const nearbyAttractions = Array.isArray(generated.nearbyAttractions) ? generated.nearbyAttractions : [];
  const foodRecommendations = Array.isArray(generated.foodRecommendations) ? generated.foodRecommendations : [];
  const travelReminders = Array.isArray(generated.travelReminders) ? generated.travelReminders : [];
  const recommendations = Array.isArray(generated.recommendations) ? generated.recommendations : [];
  const assumptions = Array.isArray(generated.assumptions) ? generated.assumptions : [];

  return {
    tripTitle: generated.tripTitle || travelContext.tripTitle,
    destination: generated.destination || travelContext.destination,
    origin: generated.origin || travelContext.origin,
    tripSummary: {
      overview: tripSummary.overview || tripSummary.summary || "",
      bestFor: tripSummary.bestFor || "",
      travelStyle: tripSummary.travelStyle || travelContext.travelStyle,
      budgetRange: tripSummary.budgetRange || travelContext.budget,
      weatherNote: tripSummary.weatherNote || "",
      keyInsight: tripSummary.keyInsight || tripSummary.highlight || "",
    },
    hotelDetails: {
      recommendedArea: hotelDetails.recommendedArea || hotelDetails.area || "",
      hotelType: hotelDetails.hotelType || hotelDetails.type || "",
      checkInStrategy: hotelDetails.checkInStrategy || "",
      checkOutStrategy: hotelDetails.checkOutStrategy || "",
      amenities: Array.isArray(hotelDetails.amenities) ? hotelDetails.amenities : [],
      bookingNotes: Array.isArray(hotelDetails.bookingNotes) ? hotelDetails.bookingNotes : [],
    },
    transportSchedule,
    nearbyAttractions,
    foodRecommendations,
    travelReminders,
    recommendations,
    assumptions,
    days: normalizeDayBlocks(generated.days, travelContext.daysRequested),
  };
};

const createItineraryForUser = async ({ userId, sourceUploadId, preferences = {} }) => {
  const upload = sourceUploadId
    ? await Upload.findOne({ _id: sourceUploadId, user: userId })
    : null;

  if (sourceUploadId && !upload) {
    throw new ApiError(404, "Source upload not found");
  }

  const travelContext = buildTravelContext({ upload, preferences });
  try {
    const generatedItinerary = await generateTravelItineraryJson({
      systemInstruction: SYSTEM_PROMPT,
      prompt: buildPrompt(travelContext),
    });

    const itineraryData = normalizeItineraryPayload(generatedItinerary, travelContext);

    const itinerary = await Itinerary.create({
      user: userId,
      sourceUpload: upload?._id || null,
      tripTitle: itineraryData.tripTitle,
      destination: itineraryData.destination,
      origin: itineraryData.origin,
      travelStyle: travelContext.travelStyle,
      budget: travelContext.budget,
      travelers: travelContext.travelers,
      daysCount: travelContext.daysRequested,
      summary: itineraryData.tripSummary,
      hotelDetails: itineraryData.hotelDetails,
      transportSchedule: itineraryData.transportSchedule,
      nearbyAttractions: itineraryData.nearbyAttractions,
      foodRecommendations: itineraryData.foodRecommendations,
      travelReminders: itineraryData.travelReminders,
      recommendations: itineraryData.recommendations,
      days: itineraryData.days,
      itineraryData,
      sourceContext: travelContext,
      modelName: process.env.GEMINI_MODEL || "models/gemini-2.5-flash",
      promptVersion: "day-3",
      generatedAt: new Date(),
      shareId: createShareId(),
    });

    return itinerary.populate("sourceUpload", "originalName status createdAt uploadedAt");
  } catch (err) {
    // Log and persist a fallback itinerary indicating the failure so front-end
    // can display a helpful message and the user retains a record.
    console.error("Gemini generation failed:", err?.message || err);
    return createItineraryWithFailure({ userId, sourceUploadId, preferences, error: err });
  }
};

const createItineraryWithFailure = async ({ userId, sourceUploadId, preferences = {}, error }) => {
  console.error("Itinerary generation failed:", error?.message || error);

  const upload = sourceUploadId ? await Upload.findOne({ _id: sourceUploadId, user: userId }) : null;

  const travelContext = buildTravelContext({ upload, preferences });

  const fallback = await Itinerary.create({
    user: userId,
    sourceUpload: upload?._id || null,
    tripTitle: travelContext.tripTitle || "AI itinerary (failed)",
    destination: travelContext.destination || "",
    origin: travelContext.origin || "",
    travelStyle: travelContext.travelStyle,
    budget: travelContext.budget,
    travelers: travelContext.travelers,
    daysCount: travelContext.daysRequested,
    summary: { overview: `Itinerary generation failed: ${String(error?.message || error)}` },
    hotelDetails: {},
    transportSchedule: [],
    nearbyAttractions: [],
    foodRecommendations: [],
    travelReminders: [],
    recommendations: [],
    days: [],
    itineraryData: { error: String(error?.message || error) },
    sourceContext: travelContext,
    modelName: process.env.GEMINI_MODEL || "models/gemini-2.5-flash",
    promptVersion: "day-3",
    generatedAt: new Date(),
    shareId: createShareId(),
  });

  return fallback.populate("sourceUpload", "originalName status createdAt uploadedAt");
};

const listUserItineraries = async (userId, { limit = 12 } = {}) => {
  const parsedLimit = clampNumber(limit, 1, 50, 12);
  const [itineraries, totalCount] = await Promise.all([
    Itinerary.find({ user: userId })
      .select("tripTitle destination origin travelStyle budget travelers daysCount summary sourceUpload generatedAt createdAt updatedAt shareId modelName")
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .populate("sourceUpload", "originalName status createdAt uploadedAt"),
    Itinerary.countDocuments({ user: userId }),
  ]);

  return {
    itineraries,
    stats: {
      totalItineraries: totalCount,
      recentCount: itineraries.length,
    },
  };
};

const getItineraryById = async (itineraryId, userId) => {
  return Itinerary.findOne({ _id: itineraryId, user: userId }).populate(
    "sourceUpload",
    "originalName status createdAt uploadedAt"
  );
};

const getItineraryByShareId = async (shareId) => {
  if (!shareId) {
    return null;
  }

  return Itinerary.findOne({ shareId: String(shareId).trim() }).populate(
    "sourceUpload",
    "originalName status createdAt uploadedAt"
  );
};

const ensureItineraryShareId = async (itineraryId, userId) => {
  const itinerary = await Itinerary.findOne({ _id: itineraryId, user: userId });

  if (!itinerary) {
    return null;
  }

  if (!itinerary.shareId) {
    itinerary.shareId = createShareId();
    await itinerary.save();
  }

  return itinerary.populate("sourceUpload", "originalName status createdAt uploadedAt");
};

export { createItineraryForUser, ensureItineraryShareId, getItineraryById, getItineraryByShareId, listUserItineraries };