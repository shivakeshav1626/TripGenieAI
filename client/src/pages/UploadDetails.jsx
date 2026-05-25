import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchUploadById } from "../api/uploads.js";

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "None detected";
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return value || "None detected";
};

const UploadDetails = () => {
  const { uploadId } = useParams();
  const [upload, setUpload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUpload = async () => {
      try {
        setLoading(true);
        const record = await fetchUploadById(uploadId);
        if (isMounted) {
          setUpload(record);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load upload details");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUpload();

    return () => {
      isMounted = false;
    };
  }, [uploadId]);

  if (loading) {
    return (
      <div className="glass-card rounded-[2rem] p-6 sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-40 rounded-full bg-white/10" />
          <div className="h-10 w-3/4 rounded-2xl bg-white/10" />
          <div className="h-24 rounded-3xl bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-36 rounded-3xl bg-white/10" />
            <div className="h-36 rounded-3xl bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!upload) {
    return (
      <div className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-slate-300">Upload not found or you do not have access.</p>
        <Link to="/uploads" className="mt-4 inline-flex secondary-button">
          Back to uploads
        </Link>
      </div>
    );
  }

  const structuredData = upload.structuredData || {};

  return (
    <div className="space-y-8">
      <section className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-luxury-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <span className="premium-badge">
              Upload details
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                {upload.originalName}
              </h1>
              <p className="max-w-xl text-slate-400">
                Review the OCR output, extracted travel fields, and stored file metadata for this document.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={`/itineraries?uploadId=${upload._id}`} className="primary-button sm:w-auto">
              Generate AI Itinerary
            </Link>
            <Link to="/uploads" className="secondary-button sm:w-auto">
              Back to history
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-5">
          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">Metadata</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailField label="Status" value={upload.status} />
              <DetailField label="Type" value={upload.mimeType} />
              <DetailField label="Size" value={`${(upload.size / 1024 / 1024).toFixed(2)} MB`} />
              <DetailField label="Uploaded" value={new Date(upload.createdAt || upload.uploadedAt || Date.now()).toLocaleString()} />
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">OCR text</p>
            <div className="mt-4 max-h-[28rem] overflow-auto rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-slate-200">
              {upload.ocrText || "No OCR text captured for this file."}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">Structured travel JSON</p>
            <pre className="mt-4 max-h-[34rem] overflow-auto rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-xs leading-6 text-slate-200">
              {JSON.stringify(structuredData, null, 2)}
            </pre>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">Extracted fields</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailField label="Document type" value={structuredData.documentType} />
              <DetailField label="Dates" value={formatValue(structuredData.dates)} />
              <DetailField label="Amounts" value={formatValue(structuredData.amounts)} />
              <DetailField label="Confirmations" value={formatValue(structuredData.confirmationNumbers)} />
              <DetailField label="Flight numbers" value={formatValue(structuredData.flightNumbers)} />
              <DetailField label="Hotels" value={formatValue(structuredData.hotels)} />
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">File link</p>
            <a
              href={upload.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex secondary-button"
            >
              Open stored file
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

const DetailField = ({ label, value }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value || "None detected"}</p>
    </div>
  );
};

export default UploadDetails;
