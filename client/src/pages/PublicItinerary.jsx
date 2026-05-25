import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Copy, Download, Sparkles } from "lucide-react";
import { downloadPublicItineraryPdf, fetchPublicItineraryByShareId } from "../api/itineraries.js";
import ItineraryTimeline from "../components/itineraries/ItineraryTimeline.jsx";
import ItinerarySkeleton from "../components/itineraries/ItinerarySkeleton.jsx";

const StatCard = ({ label, value }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-medium text-slate-100">{value || "Not specified"}</p>
  </div>
);

const PublicItinerary = () => {
  const { shareId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadItinerary = async () => {
      try {
        setLoading(true);
        const record = await fetchPublicItineraryByShareId(shareId);

        if (isMounted) {
          setItinerary(record);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Shared itinerary not found");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadItinerary();

    return () => {
      isMounted = false;
    };
  }, [shareId]);

  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      const blob = await downloadPublicItineraryPdf(shareId);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${String(itinerary?.tripTitle || "tripgenie-itinerary").toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tripgenie-itinerary"}.pdf`;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success("PDF download started");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to export PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Share link copied");
    } catch (error) {
      toast.error("Unable to copy share link");
    }
  };

  if (loading) {
    return <ItinerarySkeleton />;
  }

  if (!itinerary) {
    return (
      <div className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-slate-300">This shared itinerary is no longer available.</p>
        <Link to="/login" className="mt-4 inline-flex secondary-button">
          Back to login
        </Link>
      </div>
    );
  }

  const summary = itinerary.summary || itinerary.itineraryData?.tripSummary || {};
  const hotel = itinerary.hotelDetails || itinerary.itineraryData?.hotelDetails || {};

  return (
    <div className="space-y-8">
      <section className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-luxury-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="premium-badge">
              <Sparkles className="h-4 w-4" />
              Public share itinerary
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">{itinerary.tripTitle}</h1>
              <p className="max-w-2xl text-slate-400">{summary.overview || "A premium AI-generated itinerary shared from TripGenie AI."}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleCopyLink} className="secondary-button sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Copy Share Link
            </button>
            <button onClick={handleDownloadPdf} disabled={pdfLoading} className="secondary-button sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading ? "Exporting PDF..." : "Download PDF"}
            </button>
            <Link to="/register" className="secondary-button sm:w-auto">
              Create your own
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Destination" value={itinerary.destination} />
        <StatCard label="Days" value={String(itinerary.daysCount || itinerary.days?.length || 0)} />
        <StatCard label="Travel style" value={itinerary.travelStyle} />
        <StatCard label="Budget" value={itinerary.budget} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Travel summary</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <StatCard label="Best for" value={summary.bestFor} />
              <StatCard label="Weather note" value={summary.weatherNote} />
              <StatCard label="Key insight" value={summary.keyInsight} />
              <StatCard label="Origin" value={itinerary.origin || "Not specified"} />
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Day-wise itinerary</p>
            <div className="mt-5">
              <ItineraryTimeline itinerary={itinerary} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Stay details</p>
            <div className="mt-4 grid gap-4">
              <StatCard label="Recommended area" value={hotel.recommendedArea} />
              <StatCard label="Hotel type" value={hotel.hotelType} />
              <StatCard label="Check-in strategy" value={hotel.checkInStrategy} />
              <StatCard label="Check-out strategy" value={hotel.checkOutStrategy} />
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5 text-sm text-slate-300">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Shared link</p>
            <p className="mt-4 break-all text-slate-400">{window.location.href}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicItinerary;