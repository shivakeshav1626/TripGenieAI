import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CalendarDays, MapPinned, Sparkles } from "lucide-react";

const ItineraryPreviewCard = ({ itinerary, index = 0 }) => {
  const summary = itinerary.summary || itinerary.itineraryData?.tripSummary || {};
  const sourceName = itinerary.sourceUpload?.originalName || "Manual trip input";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-[1.75rem] p-5"
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-luxury-300/20 bg-luxury-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-luxury-100">
                <Sparkles className="h-3.5 w-3.5" />
                AI itinerary
              </span>
              <h3 className="mt-3 text-xl font-bold text-white">{itinerary.tripTitle}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <MapPinned className="h-4 w-4 text-luxury-300" />
                {itinerary.destination}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right text-xs text-slate-400">
              <p className="font-semibold uppercase tracking-[0.22em] text-slate-300">{itinerary.daysCount || itinerary.days?.length || 0} days</p>
              <p className="mt-1">{itinerary.travelStyle || "balanced"}</p>
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-slate-400">{summary.overview || "A structured itinerary generated from Gemini with premium day-wise planning."}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Source</p>
              <p className="mt-2 text-sm font-medium text-slate-100 line-clamp-1">{sourceName}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Generated</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-100">
                <CalendarDays className="h-4 w-4 text-luxury-300" />
                {new Date(itinerary.createdAt || itinerary.generatedAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <Link to={`/itineraries/${itinerary._id}`} className="secondary-button w-full justify-center">
          Open itinerary
        </Link>
      </div>
    </motion.article>
  );
};

export default ItineraryPreviewCard;