// backend/routes/banner.routes.js
import express from "express";
import { 
    getBanners, 
    addBanner, 
    removeBanner,
    editBanner 
} from "../controllers/banner.controller.js";

const router = express.Router();

// GET all banners
router.get("/", getBanners);

// POST new banner
router.post("/", addBanner);

// DELETE banner by ID
router.delete("/:id", removeBanner);

// PUT update banner by ID (optional)
router.put("/:id", editBanner);

export default router;