import { motion } from "framer-motion";
import { Compass, MapPin, UtensilsCrossed } from "lucide-react";

const formatMomentItems = (items = []) => {
  return Array.isArray(items) ? items : [];
};

const MomentGroup = ({ title, items, accentClass, icon }) => {
  if (!items.length) {
    return null;
  }

  const Icon = icon;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Icon className={`h-4 w-4 ${accentClass}`} />
        {title}
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-white">{item.title || item.time || `Stop ${index + 1}`}</p>
              <span className="rounded-full border border-luxury-300/20 bg-luxury-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-luxury-100">
                {item.time || "Suggested"}
              </span>
            </div>
            {item.description ? <p className="mt-2 leading-6 text-slate-400">{item.description}</p> : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              {item.location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-luxury-300" />{item.location}</span> : null}
              {item.cost ? <span>{item.cost}</span> : null}
              {item.bookingNote ? <span>{item.bookingNote}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ItineraryTimeline = ({ itinerary }) => {
  const days = Array.isArray(itinerary.days) && itinerary.days.length ? itinerary.days : itinerary.itineraryData?.days || [];

  if (!days.length) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-slate-400">
        This itinerary does not include day blocks yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {days.map((day, index) => (
        <motion.article
          key={`${day.day}-${index}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative"
        >
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-luxury-500 text-sm font-black text-slate-950 shadow-lg shadow-luxury-500/20">
                {day.day || index + 1}
              </div>
              {index !== days.length - 1 ? <div className="mt-3 h-full w-px flex-1 bg-white/10" /> : null}
            </div>

            <div className="flex-1 rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5 sm:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-luxury-300">Day {day.day || index + 1}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{day.title || `Day ${index + 1}`}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{day.focus || "Suggested exploration"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <p className="font-semibold text-white">{itinerary.tripTitle}</p>
                  <p className="mt-1 text-slate-400">{itinerary.destination}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                <MomentGroup title="Morning" items={formatMomentItems(day.morning)} accentClass="text-luxury-300" icon={Compass} />
                <MomentGroup title="Afternoon" items={formatMomentItems(day.afternoon)} accentClass="text-luxury-200" icon={MapPin} />
                <MomentGroup title="Evening" items={formatMomentItems(day.evening)} accentClass="text-luxury-100" icon={UtensilsCrossed} />
              </div>

              {Array.isArray(day.food) && day.food.length ? (
                <div className="mt-5 rounded-3xl border border-luxury-300/10 bg-luxury-500/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-luxury-300">Food plan</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {day.food.map((food, foodIndex) => (
                      <div key={`${day.day}-food-${foodIndex}`} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 text-sm text-slate-300">
                        <p className="font-semibold text-white">{food.meal || `Meal ${foodIndex + 1}`}</p>
                        <p className="mt-2 text-slate-400">{food.recommendation || food.description || "Local dining recommendation"}</p>
                        {food.area ? <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">{food.area}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {Array.isArray(day.notes) && day.notes.length ? (
                <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Notes</p>
                  <ul className="mt-3 space-y-2">
                    {day.notes.map((note, noteIndex) => (
                      <li key={`${day.day}-note-${noteIndex}`} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-luxury-300" />
                        <span className="leading-6 text-slate-400">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
};

export default ItineraryTimeline;