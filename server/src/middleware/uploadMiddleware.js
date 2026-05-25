import fs from "fs";
import path from "path";
import multer from "multer";
import ApiError from "../utils/ApiError.js";

const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);
const maxSizeMb = Number(process.env.UPLOAD_MAX_SIZE_MB || 10);
const uploadRoot = path.resolve("uploads");
const tempRoot = path.join(uploadRoot, "tmp");

const ensureUploadDirectories = () => {
  if (!fs.existsSync(uploadRoot)) {
    fs.mkdirSync(uploadRoot, { recursive: true });
  }

  if (!fs.existsSync(tempRoot)) {
    fs.mkdirSync(tempRoot, { recursive: true });
  }
};

ensureUploadDirectories();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempRoot);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeMb * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new ApiError(400, "Only PDF, PNG, JPG, and JPEG files are allowed"));
      return;
    }

    cb(null, true);
  },
});

export { upload, uploadRoot };
