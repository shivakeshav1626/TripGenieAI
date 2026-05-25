import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import UploadDropzone from "../components/uploads/UploadDropzone.jsx";
import UploadHistoryItem from "../components/uploads/UploadHistoryItem.jsx";
import UploadPreviewCard from "../components/uploads/UploadPreviewCard.jsx";
import UploadSkeleton from "../components/uploads/UploadSkeleton.jsx";
import { fetchUploadHistory, uploadTravelDocuments } from "../api/uploads.js";

const createPreviewFiles = (files) =>
  files.map((file) => {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    return Object.assign(file, { previewUrl });
  });

const Uploads = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalSize = useMemo(() => selectedFiles.reduce((sum, file) => sum + file.size, 0), [selectedFiles]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        setLoadingHistory(true);
        const uploads = await fetchUploadHistory();
        if (isMounted) {
          setHistory(uploads);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load upload history");
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilesSelected = (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    const nextFiles = createPreviewFiles(acceptedFiles);
    setSelectedFiles((current) => [...current, ...nextFiles].slice(0, 5));
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((current) => {
      const removedFile = current[indexToRemove];
      if (removedFile?.previewUrl) {
        URL.revokeObjectURL(removedFile.previewUrl);
      }

      const next = current.filter((_, index) => index !== indexToRemove);
      return next;
    });
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      toast.error("Select at least one file first");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      // Debug: inspect FormData contents before sending to server
      // (helps diagnose empty file uploads)
      // eslint-disable-next-line no-console
      console.group("Uploading files (FormData contents)");
      for (const pair of formData.entries()) {
        // For File entries, log name and size
        const [key, value] = pair;
        if (value instanceof File) {
          // eslint-disable-next-line no-console
          console.log(key, value.name, value.type, `${(value.size / 1024 / 1024).toFixed(2)} MB`);
        } else {
          // eslint-disable-next-line no-console
          console.log(key, value);
        }
      }
      // eslint-disable-next-line no-console
      console.groupEnd();

      setUploading(true);
      setProgress(0);
      const uploads = await uploadTravelDocuments(formData, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded * 100) / event.total));
        }
      });
      selectedFiles.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      setResults(uploads);
      setSelectedFiles([]);
      toast.success("Files uploaded and processed successfully");
      const refreshedHistory = await fetchUploadHistory();
      setHistory(refreshedHistory);
    } catch (error) {
      // Log full error for debugging
      // eslint-disable-next-line no-console
      console.error("Upload failed:", error);

      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 401) {
        toast.error("Please log in before uploading files");
      } else if (status === 413) {
        toast.error("One or more files exceed the upload size limit");
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Upload failed — check console for details");
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const latestResult = results[0] || history[0];

  return (
    <div className="space-y-10">
      <section className="glass-card relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-luxury-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <span className="premium-badge">
              Day 2 upload workflow
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Upload travel documents and turn them into structured data.
              </h1>
              <p className="max-w-xl text-slate-400">
                Securely upload PDFs and images, extract OCR text through OCR.Space, and review parsed trip details in one smooth workflow.
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-luxury-500/15 bg-white/5 px-5 py-4 text-sm text-slate-300 backdrop-blur">
            <p className="font-semibold text-white">Upload limit</p>
            <p className="mt-1">5 files per batch</p>
            <p className="mt-1">PDF, PNG, JPG, JPEG</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <UploadDropzone onFilesSelected={handleFilesSelected} isDisabled={uploading} />

          {selectedFiles.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Selected files</h2>
                <p className="text-sm text-slate-400">{selectedFiles.length} files · {(totalSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative">
                    <UploadPreviewCard file={file} index={index} />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-3 top-3 rounded-full border border-white/10 bg-card-800/90 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-luxury-300/40 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="glass-card rounded-[1.5rem] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">Upload action</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Process documents</h2>
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="primary-button sm:w-auto"
              >
                {uploading ? "Processing..." : "Upload & Extract"}
              </button>
            </div>

            {uploading ? (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Upload progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-luxury-500 to-luxury-300 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">OCR extraction flow</p>
            <h2 className="mt-2 text-2xl font-bold text-white">From file to travel JSON</h2>
            <ol className="mt-5 space-y-3 text-sm text-slate-300">
              <li>1. Files are validated in the browser and on the server.</li>
              <li>2. Multer stores the upload safely and limits size/type.</li>
              <li>3. OCR.Space extracts text from PDFs and images.</li>
              <li>4. Travel parser turns text into structured JSON.</li>
              <li>5. Metadata and results are saved to MongoDB.</li>
            </ol>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">Latest result</p>
            {latestResult ? (
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <h3 className="text-lg font-semibold text-white">{latestResult.originalName}</h3>
                <p>Status: {latestResult.status}</p>
                <p>Type: {latestResult.structuredData?.documentType || "travel_document"}</p>
                <p>Dates: {(latestResult.structuredData?.dates || []).slice(0, 3).join(", ") || "None detected"}</p>
                <p className="line-clamp-5 text-slate-400">{latestResult.ocrText || "No extracted text yet."}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Upload a file to see the latest structured travel data here.</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-luxury-300">Upload history</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Recent document processing</h2>
          </div>
          <p className="text-sm text-slate-400">{history.length} records</p>
        </div>

        {loadingHistory ? (
          <UploadSkeleton />
        ) : history.length > 0 ? (
          <div className="grid gap-4">
            {history.map((upload, index) => (
              <UploadHistoryItem key={upload._id || `${upload.originalName}-${index}`} upload={upload} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-[1.75rem] p-6 text-slate-400">
            No uploads yet. Drop a travel document above to start building your history.
          </div>
        )}
      </section>
    </div>
  );
};

export default Uploads;
