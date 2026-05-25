import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchItineraryHistory } from "../api/itineraries.js";
import ItineraryPreviewCard from "../components/itineraries/ItineraryPreviewCard.jsx";
import ItinerarySkeleton from "../components/itineraries/ItinerarySkeleton.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [stats, setStats] = useState({ totalItineraries: 0, recentCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetchItineraryHistory(3);

        if (!isMounted) {
          return;
        }

        setItineraries(response.itineraries || []);
        setStats(response.stats || { totalItineraries: 0, recentCount: 0 });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestItinerary = itineraries[0];
  const cards = [
    { label: "Trips planned", value: String(stats.totalItineraries || 0) },
    { label: "Recent itineraries", value: String(stats.recentCount || 0) },
    { label: "AI generated", value: latestItinerary ? "1" : "0" },
  ];

  return (
    <div className="space-y-10">
      <section className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-luxury-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="premium-badge">
              <Sparkles className="mr-2 h-4 w-4" />
              Luxury travel command center
            </span>
            <div>
              <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Welcome back, {user?.name || "Traveler"}
              </h1>
              <p className="mt-3 max-w-xl text-slate-400">
                Generate itinerary plans from OCR uploads, preview recent AI trips, and keep the product flow centered around a premium travel assistant experience.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-luxury-500/20 bg-luxury-500/10 px-5 py-4 text-sm text-luxury-100 backdrop-blur">
            AI itinerary workflow active
            <div className="mt-3 flex flex-col gap-3">
              <Link to="/itineraries" className="secondary-button w-full justify-center">
                Generate AI Itinerary
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/uploads" className="secondary-button w-full justify-center">
                Review uploads
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="glass-card rounded-3xl p-6">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Generator flow</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Quick itinerary launch</h2>
          <p className="mt-4 text-slate-300">
            Use OCR uploads as source data, or create a fresh trip briefing and let Gemini output a structured itinerary JSON object that is stored in MongoDB.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/itineraries" className="primary-button sm:w-auto">
              Generate AI Itinerary
            </Link>
            <Link to="/uploads" className="secondary-button sm:w-auto">
              View OCR history
            </Link>
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
            The itinerary page now acts as the product entry point for AI planning, history, and detail views.
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Recent preview</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Latest AI trips</h2>
            </div>
            <Link to="/itineraries" className="text-sm font-medium text-luxury-200 transition hover:text-white">
              Open history
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <ItinerarySkeleton />
            ) : itineraries.length ? (
              itineraries.map((itinerary, index) => <ItineraryPreviewCard key={itinerary._id} itinerary={itinerary} index={index} />)
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                No itineraries yet. Generate the first AI trip plan from the itineraries page.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
