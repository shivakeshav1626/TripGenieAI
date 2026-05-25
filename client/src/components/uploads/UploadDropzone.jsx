import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

const accept = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

// Default limits - keep in sync with server (UPLOAD_MAX_SIZE_MB)
const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_MB = 10;

const UploadDropzone = ({ onFilesSelected, isDisabled = false, maxFiles = DEFAULT_MAX_FILES, maxSizeMB = DEFAULT_MAX_MB }) => {
  const maxSize = maxSizeMB * 1024 * 1024;

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
    acceptedFiles,
  } = useDropzone({
    accept,
    multiple: true,
    disabled: isDisabled,
    maxFiles,
    maxSize,
    onDrop: (accepted) => {
      if (accepted && accepted.length) {
        onFilesSelected(accepted);
      }
    },
  });

  // Show per-file rejection reasons to the user
  const rejectionMessages = fileRejections.map(({ file, errors }) => {
    const reasons = errors.map((e) => e.message).join("; ");
    return `${file.name}: ${reasons}`;
  });

  if (rejectionMessages.length > 0) {
    // Notify via toast so it's visible immediately — do not spam for every change,
    // but this is helpful when users drop an unsupported file or a too-large file.
    // eslint-disable-next-line no-console
    console.warn("File rejections:", rejectionMessages);
    toast.error(rejectionMessages.join(" | "));
  }

  return (
    <div className="space-y-3">
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`glass-card cursor-pointer rounded-[2rem] border-2 border-dashed p-6 sm:p-8 ${
          isDragActive ? "border-luxury-300 bg-luxury-500/10" : "border-white/10"
        } ${isDisabled ? "pointer-events-none opacity-70" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <span className="premium-badge">
              Drag & drop upload
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Drop travel PDFs and images here
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Upload boarding passes, itineraries, hotel confirmations, visa pages, or scanned travel documents. We’ll validate, OCR, parse, and store them.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Supported files</p>
            <p className="mt-1">PDF, PNG, JPG, JPEG</p>
            <p className="mt-1">Up to {maxFiles} files per upload</p>
            <p className="mt-1">Max file size: {maxSizeMB} MB</p>
            {acceptedFiles.length > 0 ? <p className="mt-2 text-xs text-slate-400">{acceptedFiles.length} file(s) ready</p> : null}
          </div>
        </div>
      </motion.div>

      {fileRejections.length > 0 ? (
        <div className="space-y-1">
          {fileRejections.map(({ file, errors }, idx) => (
            <p key={`${file.name}-${idx}`} className="text-sm text-red-300">
              {file.name}: {errors.map((e) => e.message).join("; ")}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default UploadDropzone;
