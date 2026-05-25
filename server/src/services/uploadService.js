import fs from "fs";
import path from "path";
import Upload from "../models/Upload.js";
import ApiError from "../utils/ApiError.js";
import { uploadRoot } from "../middleware/uploadMiddleware.js";
import { extractTextFromImage } from "./ocrService.js";
import { parseStructuredTravelData } from "./travelParserService.js";

const supportedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);

const buildPublicUrl = (relativePath) => {
  const normalizedPath = relativePath.split(path.sep).join("/");
  return `/uploads/${normalizedPath}`;
};

const moveFileToUserFolder = async (file, userId) => {
  const safeUserId = String(userId);
  const userFolder = path.join(uploadRoot, safeUserId);
  await fs.promises.mkdir(userFolder, { recursive: true });

  const destinationPath = path.join(userFolder, file.filename);
  await fs.promises.rename(file.path, destinationPath);

  const relativePath = path.join(safeUserId, file.filename);
  return {
    absolutePath: destinationPath,
    relativePath,
    publicUrl: buildPublicUrl(relativePath),
  };
};

const createUploadRecord = async ({ file, userId, baseUrl }) => {
  if (!supportedMimeTypes.has(file.mimetype)) {
    throw new ApiError(400, "Unsupported file type");
  }

  const movedFile = await moveFileToUserFolder(file, userId);

  const uploadDoc = await Upload.create({
    user: userId,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    relativePath: movedFile.relativePath,
    publicUrl: `${baseUrl}${movedFile.publicUrl}`,
    status: "processing",
    uploadedAt: new Date(),
  });

  try {
    const { extractedText } = await extractTextFromImage(movedFile.absolutePath, file.mimetype);
    const structuredData = parseStructuredTravelData(extractedText, file.originalname);

    uploadDoc.status = "completed";
    uploadDoc.ocrText = extractedText;
    uploadDoc.structuredData = structuredData;
    await uploadDoc.save();
  } catch (error) {
    uploadDoc.status = "failed";
    uploadDoc.errorMessage = error.message || "Failed to process file";
    await uploadDoc.save();
  }

  return uploadDoc;
};

const listUserUploads = async (userId) => {
  return Upload.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
};

const getUploadById = async (uploadId, userId) => {
  return Upload.findOne({ _id: uploadId, user: userId });
};

export { createUploadRecord, getUploadById, listUserUploads };
