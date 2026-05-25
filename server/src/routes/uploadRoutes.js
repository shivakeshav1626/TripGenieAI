import express from "express";
import { getUploadDetails, getUploadHistory, uploadFiles } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, getUploadHistory);
router.get("/:uploadId", protect, getUploadDetails);
router.post("/", protect, upload.array("files", 5), uploadFiles);

export default router;
