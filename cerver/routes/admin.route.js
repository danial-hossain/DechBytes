import { Router } from "express";
import auth from "../middlewares/auth.js";
import { findUserById, findUsers } from "../utils/user.db.js";

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 */
router.get("/users", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);

    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    // fetch users without sending password hash
    const users = await findUsers(["name", "email", "role", "status", "created_at"]);

    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
