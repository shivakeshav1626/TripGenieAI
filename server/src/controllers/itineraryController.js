import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createItineraryForUser, ensureItineraryShareId, getItineraryById, getItineraryByShareId, listUserItineraries } from "../services/itineraryService.js";
import { generateItineraryPdfBuffer } from "../services/itineraryExportService.js";

const getShareBaseUrl = () => process.env.CLIENT_URL || "http://localhost:4173";

const sendPdfResponse = async (res, itinerary) => {
  const pdfBuffer = await generateItineraryPdfBuffer(itinerary);
  const safeFileName = String(itinerary.tripTitle || "tripgenie-itinerary")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeFileName || "tripgenie-itinerary"}.pdf"`);
  res.status(200).send(pdfBuffer);
};

const generateItinerary = asyncHandler(async (req, res) => {
  const { sourceUploadId, ...preferences } = req.body || {};

  if (!sourceUploadId && !preferences.destination && !preferences.tripName) {
    throw new ApiError(400, "Add a destination or select an OCR upload to generate an itinerary");
  }

  const itinerary = await createItineraryForUser({
    userId: req.user._id,
    sourceUploadId,
    preferences,
  });

  res.status(201).json(
    new ApiResponse(201, { itinerary }, "AI itinerary generated successfully")
  );
});

const getItineraryHistory = asyncHandler(async (req, res) => {
  const { itineraries, stats } = await listUserItineraries(req.user._id, {
    limit: req.query.limit || 12,
  });

  res.status(200).json(
    new ApiResponse(200, { itineraries, stats }, "Itinerary history retrieved successfully")
  );
});

const getItineraryDetails = asyncHandler(async (req, res) => {
  const itinerary = await getItineraryById(req.params.itineraryId, req.user._id);

  if (!itinerary) {
    throw new ApiError(404, "Itinerary not found");
  }

  res.status(200).json(
    new ApiResponse(200, { itinerary }, "Itinerary details retrieved successfully")
  );
});

const createItineraryShare = asyncHandler(async (req, res) => {
  const itinerary = await ensureItineraryShareId(req.params.itineraryId, req.user._id);

  if (!itinerary) {
    throw new ApiError(404, "Itinerary not found");
  }

  const shareUrl = `${getShareBaseUrl().replace(/\/$/, "")}/share/${itinerary.shareId}`;

  res.status(200).json(new ApiResponse(200, { itinerary, shareUrl }, "Share link ready"));
});

const downloadItineraryPdf = asyncHandler(async (req, res) => {
  const itinerary = await getItineraryById(req.params.itineraryId, req.user._id);

  if (!itinerary) {
    throw new ApiError(404, "Itinerary not found");
  }

  await sendPdfResponse(res, itinerary);
});

const getPublicItinerary = asyncHandler(async (req, res) => {
  const itinerary = await getItineraryByShareId(req.params.shareId);

  if (!itinerary) {
    throw new ApiError(404, "Shared itinerary not found");
  }

  res.status(200).json(new ApiResponse(200, { itinerary }, "Public itinerary retrieved successfully"));
});

const downloadPublicItineraryPdf = asyncHandler(async (req, res) => {
  const itinerary = await getItineraryByShareId(req.params.shareId);

  if (!itinerary) {
    throw new ApiError(404, "Shared itinerary not found");
  }

  await sendPdfResponse(res, itinerary);
});

export { createItineraryShare, downloadItineraryPdf, downloadPublicItineraryPdf, generateItinerary, getItineraryDetails, getItineraryHistory, getPublicItinerary };