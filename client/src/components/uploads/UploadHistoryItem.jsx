import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const statusStyles = {
  completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  processing: "border-luxury-300/20 bg-luxury-500/10 text-luxury-100",
  failed: "border-red-400/20 bg-red-400/10 text-red-200",
};

const UploadHistoryItem = ({ upload, index }) => {
  const badgeClass = statusStyles[upload.status] || statusStyles.processing;
  const structuredData = upload.structuredData || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card rounded-[1.5rem] p-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${badgeClass}`}>
              {upload.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
              {upload.mimeType}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{upload.originalName}</h3>
            <p className="mt-1 text-sm text-slate-400">
              Uploaded {new Date(upload.createdAt || upload.uploadedAt || Date.now()).toLocaleString()}
            </p>
          </div>
          {upload.errorMessage ? <p className="text-sm text-red-300">{upload.errorMessage}</p> : null}
          <Link
            to={`/uploads/${upload._id}`}
            className="inline-flex rounded-full border border-luxury-300/20 bg-luxury-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-luxury-100 transition-all duration-300 hover:border-luxury-300/40 hover:bg-luxury-500/15"
          >
            View details
          </Link>
          <Link
            to={`/itineraries?uploadId=${upload._id}`}
            className="ml-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition-all duration-300 hover:border-luxury-300/40 hover:bg-white/10"
          >
            Generate itinerary
          </Link>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 md:min-w-72">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Text preview</p>
            <p className="mt-2 line-clamp-3 text-slate-200">{upload.ocrText || "No OCR text captured yet."}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Structured travel JSON</p>
            <div className="mt-2 space-y-1 text-slate-200">
              <p>Type: {structuredData.documentType || "travel_document"}</p>
              <p>Dates: {(structuredData.dates || []).slice(0, 2).join(", ") || "None detected"}</p>
              <p>Amounts: {(structuredData.amounts || []).slice(0, 2).join(", ") || "None detected"}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadHistoryItem;
