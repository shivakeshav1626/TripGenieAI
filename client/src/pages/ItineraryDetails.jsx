import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Copy, Download, Link2, Sparkles, Share2 } from "lucide-react";
import { downloadItineraryPdf, fetchItineraryById, requestItineraryShare } from "../api/itineraries.js";
import ItineraryTimeline from "../components/itineraries/ItineraryTimeline.jsx";
import ItinerarySkeleton from "../components/itineraries/ItinerarySkeleton.jsx";

const DetailCard = ({ label, value }) => (
  <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-medium text-slate-100">{value || "Not specified"}</p>
  </div>
);

const ListCard = ({ title, items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-300">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-luxury-300" />
            <span className="leading-6 text-slate-400">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ItineraryDetails = () => {
  const { itineraryId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadItinerary = async () => {
      try {
        setLoading(true);
        const record = await fetchItineraryById(itineraryId);

        if (isMounted) {
          setItinerary(record);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load itinerary details");
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
  }, [itineraryId]);

  const shareUrl = itinerary?.shareId ? `${window.location.origin}/share/${itinerary.shareId}` : "";

  const handleCopyShareLink = async () => {
    try {
      setShareLoading(true);
      const { itinerary: updatedItinerary, shareUrl: generatedShareUrl } = await requestItineraryShare(itineraryId);
      setItinerary(updatedItinerary);
      const finalShareUrl = generatedShareUrl || `${window.location.origin}/share/${updatedItinerary.shareId}`;
      await navigator.clipboard.writeText(finalShareUrl);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to create share link");
    } finally {
      setShareLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      const blob = await downloadItineraryPdf(itineraryId);
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

  if (loading) {
    return <ItinerarySkeleton />;
  }

  if (!itinerary) {
    return (
      <div className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-slate-300">Itinerary not found or access denied.</p>
        <Link to="/itineraries" className="mt-4 inline-flex secondary-button">
          Back to itineraries
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
              Saved AI itinerary
            </span>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">{itinerary.tripTitle}</h1>
              <p className="max-w-2xl text-slate-400">{summary.overview || "A structured, premium itinerary generated from Gemini and stored in MongoDB."}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={handleCopyShareLink} disabled={shareLoading} className="secondary-button sm:w-auto">
              <Share2 className="mr-2 h-4 w-4" />
              {shareLoading ? "Preparing link..." : "Copy Share Link"}
            </button>
            <button onClick={handleDownloadPdf} disabled={pdfLoading} className="secondary-button sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading ? "Exporting PDF..." : "Download PDF"}
            </button>
            <Link to="/itineraries" className="secondary-button sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to history
            </Link>
          </div>
        </div>
        {shareUrl ? (
          <div className="relative z-10 mt-5 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <Link2 className="h-4 w-4 text-luxury-300" />
            <span className="truncate">{shareUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success("Share link copied"))}
              className="ml-auto rounded-full border border-white/10 bg-card-800/80 px-3 py-1.5 text-xs font-semibold text-luxury-100 transition hover:bg-white/10"
            >
              <Copy className="mr-2 inline h-3.5 w-3.5" />
              Copy
            </button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Destination" value={itinerary.destination} />
        <DetailCard label="Days" value={String(itinerary.daysCount || itinerary.days?.length || 0)} />
        <DetailCard label="Travel style" value={itinerary.travelStyle} />
        <DetailCard label="Budget" value={itinerary.budget} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Travel summary</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailCard label="Best for" value={summary.bestFor} />
              <DetailCard label="Weather note" value={summary.weatherNote} />
              <DetailCard label="Key insight" value={summary.keyInsight} />
              <DetailCard label="Origin" value={itinerary.origin || "Not specified"} />
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
              <DetailCard label="Recommended area" value={hotel.recommendedArea} />
              <DetailCard label="Hotel type" value={hotel.hotelType} />
              <DetailCard label="Check-in strategy" value={hotel.checkInStrategy} />
              <DetailCard label="Check-out strategy" value={hotel.checkOutStrategy} />
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Transport schedule</p>
            <div className="mt-4 space-y-3">
              {(itinerary.transportSchedule || []).length ? (
                itinerary.transportSchedule.map((item, index) => (
                  <div key={`${item.day}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">Day {item.day || index + 1} · {item.mode || "Transfer"}</p>
                      <span className="text-xs uppercase tracking-[0.22em] text-luxury-300">{item.time || "Suggested"}</span>
                    </div>
                    <p className="mt-2 text-slate-400">{item.from || "Origin"} → {item.to || "Destination"}</p>
                    {item.duration ? <p className="mt-1 text-slate-500">{item.duration}</p> : null}
                    {item.bookingNote ? <p className="mt-2 text-slate-400">{item.bookingNote}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No transport schedule was generated.</p>
              )}
            </div>
          </div>

          <ListCard title="Nearby attractions" items={(itinerary.nearbyAttractions || []).map((item) => `${item.name || "Attraction"}${item.area ? ` · ${item.area}` : ""}${item.whyGo ? ` - ${item.whyGo}` : ""}`)} />
          <ListCard title="Food recommendations" items={(itinerary.foodRecommendations || []).map((item) => `${item.meal || "Meal"}: ${item.recommendation || item.description || "Suggested dining spot"}`)} />
          <ListCard title="Travel reminders" items={itinerary.travelReminders || []} />
          <ListCard title="AI recommendations" items={itinerary.recommendations || []} />

          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-luxury-300">Source</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>{itinerary.sourceUpload?.originalName || "Manual generation"}</p>
              <p className="text-slate-500">Generated with {itinerary.modelName || "Gemini"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ItineraryDetails;