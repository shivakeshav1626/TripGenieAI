import mongoose from "mongoose";
import crypto from "crypto";

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, default: "" },
    focus: { type: String, default: "" },
    morning: { type: [mongoose.Schema.Types.Mixed], default: [] },
    afternoon: { type: [mongoose.Schema.Types.Mixed], default: [] },
    evening: { type: [mongoose.Schema.Types.Mixed], default: [] },
    food: { type: [mongoose.Schema.Types.Mixed], default: [] },
    notes: { type: [String], default: [] },
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceUpload: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      default: null,
    },
    tripTitle: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: String,
      default: "",
      trim: true,
    },
    travelStyle: {
      type: String,
      default: "balanced",
      trim: true,
    },
    budget: {
      type: String,
      default: "mid-range",
      trim: true,
    },
    travelers: {
      type: Number,
      default: 2,
      min: 1,
    },
    daysCount: {
      type: Number,
      default: 3,
      min: 1,
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    hotelDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    transportSchedule: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    nearbyAttractions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    foodRecommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    travelReminders: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    days: {
      type: [itineraryDaySchema],
      default: [],
    },
    itineraryData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    sourceContext: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    modelName: {
      type: String,
      default: "gemini-1.5-flash",
    },
    promptVersion: {
      type: String,
      default: "day-3",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    shareId: {
      type: String,
      default: () => crypto.randomUUID().replace(/-/g, "").slice(0, 16),
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Itinerary = mongoose.models.Itinerary || mongoose.model("Itinerary", itinerarySchema);

export default Itinerary;