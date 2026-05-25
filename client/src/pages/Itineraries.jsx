import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Sparkles } from "lucide-react";
import ItineraryGeneratorPanel from "../components/itineraries/ItineraryGeneratorPanel.jsx";
import ItineraryPreviewCard from "../components/itineraries/ItineraryPreviewCard.jsx";
import ItinerarySkeleton from "../components/itineraries/ItinerarySkeleton.jsx";
import { fetchUploadHistory } from "../api/uploads.js";
import { fetchItineraryHistory, generateItinerary } from "../api/itineraries.js";

const Itineraries = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [stats, setStats] = useState({ totalItineraries: 0, recentCount: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedUploadData, setSelectedUploadData] = useState(null);

  const defaultUploadId = searchParams.get("uploadId") || "";

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [itineraryResponse, uploadHistory] = await Promise.all([
          fetchItineraryHistory(8),
          fetchUploadHistory(),
        ]);

        if (!isMounted) {
          return;
        }

        setItineraries(itineraryResponse.itineraries || []);
        setStats(itineraryResponse.stats || { totalItineraries: 0, recentCount: 0 });
        setUploads(uploadHistory || []);

        // Auto-populate form if uploadId is present
        if (defaultUploadId && uploadHistory.length > 0) {
          const selectedUpload = uploadHistory.find((u) => u._id === defaultUploadId);
          if (selectedUpload) {
            setSelectedUploadData(selectedUpload);
          }
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load itineraries");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [defaultUploadId]);

  const previewCards = useMemo(() => itineraries.slice(0, 3), [itineraries]);

  const handleGenerate = async (formData) => {
    try {
      setGenerating(true);
      const itinerary = await generateItinerary(formData);
      toast.success("AI itinerary generated successfully");
      navigate(`/itineraries/${itinerary._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to generate itinerary");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-luxury-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="premium-badge">
              <Sparkles className="h-4 w-4" />
              Day 3 AI itinerary builder
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Turn OCR travel data into a premium, shareable AI trip plan.
              </h1>
              <p className="max-w-2xl text-slate-400">
                Generate structured itineraries from uploaded travel documents or fresh trip details, then save them in MongoDB and review them in a beautiful timeline layout.
              </p>
            </div>
          </div>

          <Link to="/dashboard" className="secondary-button sm:w-auto">
            Back to dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="glass-card rounded-3xl p-6">
          <p className="text-sm text-slate-400">Saved itineraries</p>
          <p className="mt-3 text-4xl font-black text-white">{stats.totalItineraries || 0}</p>
        </div>
        <div className="glass-card rounded-3xl p-6">
          <p className="text-sm text-slate-400">Recent plans</p>
          <p className="mt-3 text-4xl font-black text-white">{stats.recentCount || 0}</p>
        </div>
        <div className="glass-card rounded-3xl p-6">
          <p className="text-sm text-slate-400">OCR uploads ready</p>
          <p className="mt-3 text-4xl font-black text-white">{uploads.filter((upload) => upload.status === "completed").length}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ItineraryGeneratorPanel
          uploads={uploads}
          defaultUploadId={defaultUploadId}
          selectedUploadData={selectedUploadData}
          isGenerating={generating}
          onGenerate={handleGenerate}
        />

        <div className="space-y-5">
          <div className="glass-card rounded-[2rem] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Generation flow</p>
            <h2 className="mt-2 text-2xl font-bold text-white">How the itinerary engine works</h2>
            <ol className="mt-5 space-y-3 text-sm text-slate-300">
              <li>1. Pick a processed upload or start from destination details.</li>
              <li>2. Gemini converts OCR and preferences into structured JSON.</li>
              <li>3. The itinerary is saved in MongoDB and rendered as a timeline.</li>
              <li>4. Review transport, hotel, food, reminders, and daily flow.</li>
            </ol>
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Recent preview</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Trip cards</h2>
            <div className="mt-5 space-y-4">
              {loading ? (
                <ItinerarySkeleton />
              ) : previewCards.length ? (
                previewCards.map((itinerary, index) => <ItineraryPreviewCard key={itinerary._id} itinerary={itinerary} index={index} />)
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                  No saved itineraries yet. Generate the first AI trip plan to unlock the dashboard preview cards.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Itinerary history</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Saved AI travel plans</h2>
          </div>
          <Link to="/uploads" className="text-sm text-slate-400 transition hover:text-white">
            Need OCR data? Check uploads
          </Link>
        </div>

        {loading ? (
          <ItinerarySkeleton />
        ) : itineraries.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {itineraries.map((itinerary, index) => (
              <ItineraryPreviewCard key={itinerary._id} itinerary={itinerary} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-[1.75rem] p-6 text-slate-400">
            Generate your first AI itinerary to populate this history view and the dashboard preview.
          </div>
        )}
      </section>
    </div>
  );
};

export default Itineraries;