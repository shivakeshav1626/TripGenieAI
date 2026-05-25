import { motion } from "framer-motion";

const UploadPreviewCard = ({ file, index }) => {
  const isImage = file.type.startsWith("image/");
  const previewUrl = file.previewUrl || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-3xl p-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
          {isImage && previewUrl ? (
            <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="text-lg font-black text-luxury-200">PDF</div>
              <div className="text-xs text-slate-500">Document</div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{file.name}</p>
              <p className="mt-1 text-xs text-slate-400">{file.type || "application/octet-stream"}</p>
            </div>
            <span className="rounded-full border border-luxury-300/20 bg-luxury-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-luxury-100">
              Ready
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>Preview {index + 1}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadPreviewCard;
