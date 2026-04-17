import {
    getAllAds,
    createAd,
    deleteAd
} from "../utils/advertisement.db.js";

// GET ADS (HOME + ADMIN)
export const getAds = async (req, res) => {
    try {
        const ads = await getAllAds();
        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch advertisements",
            error: error.message
        });
    }
};

// ADD AD
export const addAd = async (req, res) => {
    try {
        const { photo_url } = req.body;

        if (!photo_url) {
            return res.status(400).json({
                message: "photo_url is required"
            });
        }

        const result = await createAd(photo_url);

        res.status(201).json({
            message: "Advertisement created",
            id: result.id
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create advertisement",
            error: error.message
        });
    }
};

// DELETE AD
export const removeAd = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await deleteAd(id);

        if (!deleted) {
            return res.status(404).json({
                message: "Advertisement not found"
            });
        }

        res.status(200).json({
            message: "Advertisement deleted"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete advertisement",
            error: error.message
        });
    }
};