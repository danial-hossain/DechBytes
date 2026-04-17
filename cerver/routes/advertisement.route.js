import express from "express";
import {
    getAds,
    addAd,
    removeAd
} from "../controllers/advertisement.controller.js";

const router = express.Router();

// GET ALL ADS
router.get("/", getAds);

// ADD AD
router.post("/", addAd);

// DELETE AD
router.delete("/:id", removeAd);

export default router;