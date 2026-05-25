import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Hotel, MapPinned, PlaneTakeoff, Sparkles, UtensilsCrossed, CheckCircle2, Zap } from "lucide-react";
import FormInput from "../FormInput.jsx";

const budgetOptions = ["budget", "mid-range", "premium"];
const travelStyles = ["balanced", "luxury", "budget-conscious", "family-friendly", "adventure", "relaxed"];

const createInitialForm = (defaultUploadId = "") => ({
  tripName: "",
  destination: "",
  origin: "",
  days: 3,
  travelers: 2,
  budget: "mid-range",
  travelStyle: "balanced",
  transportPreference: "",
  hotelPreference: "",
  foodPreference: "",
  interests: "",
  notes: "",
  startDate: "",
  endDate: "",
  sourceUploadId: defaultUploadId,
});

const fieldIconClass = "absolute right-4 top-1/2 -translate-y-1/2 text-slate-500";

// Detect which fields were AI-filled
const getDetectedFields = (form, initialForm) => {
  const detected = {};
  const fieldsToCheck = ["tripName", "destination", "origin", "days", "travelers", "budget", "hotelPreference", "transportPreference"];
  
  fieldsToCheck.forEach((field) => {
    if (form[field] !== initialForm[field] && form[field] !== "") {
      detected[field] = true;
    }
  });

  return detected;
};

const AIDetectedBadge = ({ confidence = 0.8 }) => {
  if (confidence < 0.5) return null;
  
  const bgColor = confidence > 0.8 ? "bg-luxury-500/20" : "bg-amber-500/20";
  const textColor = confidence > 0.8 ? "text-luxury-300" : "text-amber-300";
  const icon = confidence > 0.8 ? "✓" : "?";

  return (
    <span className={`ml-2 inline-flex items-center gap-1 rounded-full ${bgColor} px-2 py-1 text-xs font-medium ${textColor}`}>
      {icon} AI detected
    </span>
  );
};

const ItineraryGeneratorPanel = ({ uploads = [], defaultUploadId = "", selectedUploadData = null, isGenerating = false, onGenerate }) => {
  const initialForm = createInitialForm(defaultUploadId);
  const [form, setForm] = useState(initialForm);
  const [detectedFields, setDetectedFields] = useState({});
  const [isPrefilling, setIsPrefilling] = useState(false);

  // Auto-fill form when selectedUploadData changes
  useEffect(() => {
    if (selectedUploadData?.structuredData?.extractedFormFields) {
      setIsPrefilling(true);
      const extracted = selectedUploadData.structuredData.extractedFormFields;
      
      // Simulate a loading delay for better UX perception
      const timer = setTimeout(() => {
        setForm((current) => ({
          ...current,
          tripName: extracted.tripName || current.tripName,
          destination: extracted.destination || current.destination,
          origin: extracted.origin || current.origin,
          days: extracted.days || current.days,
          travelers: extracted.travelers || current.travelers,
          budget: extracted.budget || current.budget,
          travelStyle: extracted.travelStyle || current.travelStyle,
          hotelPreference: extracted.hotelPreference || current.hotelPreference,
          transportPreference: extracted.transportPreference || current.transportPreference,
          startDate: extracted.startDate || current.startDate,
          endDate: extracted.endDate || current.endDate,
          sourceUploadId: defaultUploadId || current.sourceUploadId,
        }));

        const newDetected = {};
        if (extracted.destination) newDetected.destination = true;
        if (extracted.origin) newDetected.origin = true;
        if (extracted.days && extracted.days !== 3) newDetected.days = true;
        if (extracted.travelers && extracted.travelers !== 2) newDetected.travelers = true;
        if (extracted.budget && extracted.budget !== "mid-range") newDetected.budget = true;
        if (extracted.hotelPreference) newDetected.hotelPreference = true;
        if (extracted.transportPreference) newDetected.transportPreference = true;

        setDetectedFields(newDetected);
        setIsPrefilling(false);
      }, 600);

      return () => clearTimeout(timer);
    } else {
      setForm((current) => ({
        ...current,
        sourceUploadId: defaultUploadId || current.sourceUploadId,
      }));
      setDetectedFields({});
      setIsPrefilling(false);
    }
  }, [defaultUploadId, selectedUploadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onGenerate(form);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card rounded-[2rem] p-6 sm:p-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <span className="premium-badge">
            <Sparkles className="h-4 w-4" />
            AI itinerary generator
          </span>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Generate a polished travel plan from OCR or fresh trip details.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Use an uploaded travel document as the source signal, or start from a destination and let Gemini build a structured itinerary with day-wise actions, hotel guidance, transport, food, and reminders.
            </p>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3 lg:max-w-xl">
          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 px-5 py-4 h-32">
            <CalendarDays className="h-5 w-5 text-luxury-300 flex-shrink-0" />
            <p className="font-semibold text-white mt-2 line-clamp-2">Day-wise flow</p>
            <p className="text-slate-400 text-xs mt-2 line-clamp-2">Timeline cards</p>
          </div>
          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 px-5 py-4 h-32">
            <PlaneTakeoff className="h-5 w-5 text-luxury-300 flex-shrink-0" />
            <p className="font-semibold text-white mt-2 line-clamp-2">Transport aware</p>
            <p className="text-slate-400 text-xs mt-2 line-clamp-2">Schedules & transfers</p>
          </div>
          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 px-5 py-4 h-32">
            <Hotel className="h-5 w-5 text-luxury-300 flex-shrink-0" />
            <p className="font-semibold text-white mt-2 line-clamp-2">Hotel guidance</p>
            <p className="text-slate-400 text-xs mt-2 line-clamp-2">Stay + booking tips</p>
          </div>
        </div>
      </div>

      <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Trip name</label>
            {detectedFields.tripName && <AIDetectedBadge />}
          </div>
          <FormInput name="tripName" placeholder="Kyoto cultural escape" value={form.tripName} onChange={handleChange} inputClassName={isPrefilling && detectedFields.tripName ? "animate-pulse" : ""} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Destination</label>
            {detectedFields.destination && <AIDetectedBadge />}
          </div>
          <FormInput name="destination" placeholder="Kyoto, Japan" value={form.destination} onChange={handleChange} inputClassName={isPrefilling && detectedFields.destination ? "animate-pulse" : ""} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Origin</label>
            {detectedFields.origin && <AIDetectedBadge />}
          </div>
          <FormInput name="origin" placeholder="San Francisco, USA" value={form.origin} onChange={handleChange} inputClassName={isPrefilling && detectedFields.origin ? "animate-pulse" : ""} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Days</label>
            {detectedFields.days && <AIDetectedBadge />}
          </div>
          <FormInput type="number" min="1" max="10" name="days" value={form.days} onChange={handleChange} inputClassName={isPrefilling && detectedFields.days ? "animate-pulse" : ""} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Travelers</label>
            {detectedFields.travelers && <AIDetectedBadge />}
          </div>
          <FormInput type="number" min="1" max="12" name="travelers" value={form.travelers} onChange={handleChange} inputClassName={isPrefilling && detectedFields.travelers ? "animate-pulse" : ""} />
        </div>

        <label className="relative block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Budget</span>
            {detectedFields.budget && <AIDetectedBadge />}
          </div>
          <select name="budget" value={form.budget} onChange={handleChange} className={`input-field pr-10 ${isPrefilling && detectedFields.budget ? "animate-pulse" : ""}`}>
            {budgetOptions.map((option) => (
              <option key={option} value={option} className="bg-slate-950">
                {option}
              </option>
            ))}
          </select>
          <MapPinned className={fieldIconClass} />
        </label>

        <label className="relative block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Travel style</span>
          <select name="travelStyle" value={form.travelStyle} onChange={handleChange} className="input-field pr-10">
            {travelStyles.map((option) => (
              <option key={option} value={option} className="bg-slate-950">
                {option}
              </option>
            ))}
          </select>
          <Sparkles className={fieldIconClass} />
        </label>

        <div className="relative block">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Transport preference</label>
            {detectedFields.transportPreference && <AIDetectedBadge />}
          </div>
          <FormInput name="transportPreference" placeholder="Private transfers, metro, rental car" value={form.transportPreference} onChange={handleChange} inputClassName={`pr-10 ${isPrefilling && detectedFields.transportPreference ? "animate-pulse" : ""}`} />
          <PlaneTakeoff className={fieldIconClass} />
        </div>

        <div className="relative block">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Hotel preference</label>
            {detectedFields.hotelPreference && <AIDetectedBadge />}
          </div>
          <FormInput name="hotelPreference" placeholder="Central boutique hotel with breakfast" value={form.hotelPreference} onChange={handleChange} inputClassName={`pr-10 ${isPrefilling && detectedFields.hotelPreference ? "animate-pulse" : ""}`} />
          <Hotel className={fieldIconClass} />
        </div>

        <div className="relative block md:col-span-2">
          <FormInput label="Food preference" name="foodPreference" placeholder="Local cafes, street food, vegetarian-friendly spots" value={form.foodPreference} onChange={handleChange} inputClassName="pr-10" />
          <UtensilsCrossed className={fieldIconClass} />
        </div>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-300">OCR source upload {isPrefilling && <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="inline-block ml-2 text-luxury-300">Loading...</motion.span>}</span>
          <select name="sourceUploadId" value={form.sourceUploadId} onChange={handleChange} className="input-field" disabled={isPrefilling}>
            <option value="">Generate from trip details only</option>
            {uploads.map((upload) => (
              <option key={upload._id} value={upload._id} className="bg-slate-950">
                {upload.originalName} {upload.status ? `(${upload.status})` : ""}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">Choose a processed upload to convert OCR text into a structured AI itinerary.</p>
        </label>

        <FormInput type="date" label="Start date" name="startDate" value={form.startDate} onChange={handleChange} />
        <FormInput type="date" label="End date" name="endDate" value={form.endDate} onChange={handleChange} />

        <div className="md:col-span-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Interests</span>
            <textarea
              name="interests"
              value={form.interests}
              onChange={handleChange}
              rows={3}
              placeholder="Museums, scenic walks, shopping streets, coffee spots"
              className="input-field min-h-28 resize-none"
            />
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Travel notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Accessibility needs, pace preferences, special occasions, must-see places"
              className="input-field min-h-32 resize-none"
            />
          </label>
        </div>

        <button type="submit" className="primary-button md:col-span-2" disabled={isGenerating}>
          {isGenerating ? "Generating itinerary..." : "Generate AI Itinerary"}
        </button>
      </form>
    </motion.section>
  );
};

export default ItineraryGeneratorPanel;