// backend/controllers/banner.controller.js
import { getAllBanners, createBanner, deleteBanner, updateBanner } from "../utils/banner.db.js";

// GET ALL BANNERS
export const getBanners = async (req, res) => {
    try {
        const banners = await getAllBanners();
        res.status(200).json(banners);
    } catch (error) {
        console.error("Get banners error:", error);
        res.status(500).json({
            message: "Failed to fetch banners",
            error: error.message
        });
    }
};

// ADD BANNER
export const addBanner = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        
        const { photo_url, title, link, display_order } = req.body;

        if (!photo_url) {
            return res.status(400).json({ 
                success: false,
                message: "photo_url is required" 
            });
        }

        const result = await createBanner(
            photo_url, 
            title || '', 
            link || '/', 
            display_order || 0
        );

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            id: result.id
        });
    } catch (error) {
        console.error("Add banner error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create banner",
            error: error.message
        });
    }
};

// DELETE BANNER
export const removeBanner = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Banner ID is required"
            });
        }

        const deleted = await deleteBanner(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        console.error("Delete banner error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete banner",
            error: error.message
        });
    }
};

// UPDATE BANNER (optional)
export const editBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, link, display_order, is_active } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Banner ID is required"
            });
        }

        const updated = await updateBanner(id, title, link, display_order, is_active);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Banner updated successfully"
        });
    } catch (error) {
        console.error("Update banner error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update banner",
            error: error.message
        });
    }
};