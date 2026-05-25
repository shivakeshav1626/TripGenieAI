import express from "express";
import { createItineraryShare, downloadItineraryPdf, downloadPublicItineraryPdf, generateItinerary, getItineraryDetails, getItineraryHistory, getPublicItinerary } from "../controllers/itineraryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateItinerary);
router.get("/", protect, getItineraryHistory);
router.get("/share/:shareId/pdf", downloadPublicItineraryPdf);
router.get("/share/:shareId", getPublicItinerary);
router.post("/:itineraryId/share", protect, createItineraryShare);
router.get("/:itineraryId/pdf", protect, downloadItineraryPdf);
router.get("/:itineraryId", protect, getItineraryDetails);

export default router;