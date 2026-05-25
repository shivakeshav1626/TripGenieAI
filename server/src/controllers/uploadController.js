import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createUploadRecord, getUploadById, listUserUploads } from "../services/uploadService.js";

const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files || [];

  if (!files.length) {
    throw new ApiError(400, "Please upload at least one PDF, PNG, JPG, or JPEG file");
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const processedUploads = [];

  for (const file of files) {
    const processedUpload = await createUploadRecord({
      file,
      userId: req.user._id,
      baseUrl,
    });
    processedUploads.push(processedUpload);
  }

  const hasFailures = processedUploads.some((upload) => upload.status === "failed");
  const message = hasFailures
    ? "Files uploaded, but one or more documents could not be processed"
    : "Files uploaded and processed successfully";

  res.status(201).json(
    new ApiResponse(201, { uploads: processedUploads }, message)
  );
});

const getUploadHistory = asyncHandler(async (req, res) => {
  const uploads = await listUserUploads(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { uploads }, "Upload history retrieved successfully")
  );
});

const getUploadDetails = asyncHandler(async (req, res) => {
  const upload = await getUploadById(req.params.uploadId, req.user._id);

  if (!upload) {
    throw new ApiError(404, "Upload not found");
  }

  res.status(200).json(
    new ApiResponse(200, { upload }, "Upload details retrieved successfully")
  );
});

export { getUploadDetails, getUploadHistory, uploadFiles };
