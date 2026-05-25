import fs from "fs";
import path from "path";
import ApiError from "../utils/ApiError.js";

const OCR_SPACE_URL = "https://api.ocr.space/parse/image";

const extractTextFromImage = async (filePath, mimeType) => {
  if (!process.env.OCR_SPACE_API_KEY) {
    throw new ApiError(500, "OCR.Space API key is missing");
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const formData = new FormData();
  formData.append("apikey", process.env.OCR_SPACE_API_KEY);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("scale", "true");
  formData.append("detectOrientation", "true");
  formData.append("filetype", mimeType === "application/pdf" ? "pdf" : "auto");

  const fileName = path.basename(filePath);
  const fileBlob = new Blob([fileBuffer], { type: mimeType });
  formData.append("file", fileBlob, fileName);

  const response = await fetch(OCR_SPACE_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(502, "OCR.Space request failed");
  }

  const payload = await response.json();

  if (payload.IsErroredOnProcessing) {
    const message = payload.ErrorMessage || payload.ErrorDetails || "Unable to extract text from document";
    throw new ApiError(422, Array.isArray(message) ? message.join(", ") : message);
  }

  const parsedResults = payload.ParsedResults || [];
  const extractedText = parsedResults.map((result) => result.ParsedText || "").join("\n").trim();

  return {
    extractedText,
    ocrPayload: payload,
  };
};

export { extractTextFromImage };
