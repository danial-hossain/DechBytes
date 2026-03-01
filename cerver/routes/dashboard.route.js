import auth from "../middlewares/auth.js";
import { findUserById, countUsers, findUsers } from "../utils/user.db.js";
import { countProducts, createProduct, findProductByIdAndCategoryId, searchProducts } from "../utils/product.db.js"; // Import createProduct, findProductByIdAndCategoryId, searchProducts
import { findCategoryByName, findAllCategories } from "../utils/category.db.js";
import { countOrders, findAllOrders } from "../utils/order.db.js"; // Assume these exist or will be created
import { countReports, findAllReportsWithUser } from "../utils/report.db.js"; // Assume these exist or will be created, findReportById for populate
import { countHelps, findAllHelps } from "../utils/help.db.js"; // Assume these exist or will be created
import { Router } from "express"; // Added import for Router

const router = Router();

// ===== DASHBOARD STATS =====
router.get("/", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const userCount = await countUsers();
    const productCount = await countProducts();
    const orderCount = await countOrders();
    const reportCount = await countReports();
    const helpCount = await countHelps();

    res.json({ userCount, productCount, orderCount, reportCount, helpCount });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== USERS =====
router.get("/users", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const users = await findUsers(["name", "email", "role", "status", "created_at"]);
    res.json({ users });
  } catch (err) {
    console.error("Dashboard users error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== PRODUCTS =====
router.get("/products", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const products = await searchProducts('');

    res.json({ products });
  } catch (err) {
    console.error("Dashboard products error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== ADD PRODUCT =====
router.post("/add-product", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const { categoryName, name, price, photo, details } = req.body;
    if (!categoryName || !name || !price || !photo || !details)
      return res.status(400).json({ message: "All fields are required" });

    const category = await findCategoryByName(categoryName);
    if (!category) return res.status(404).json({ message: "Category not found" });

    await createProduct({ name, price, photo, details, categoryId: category.id });

    res.json({ message: "Product added successfully" });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== ORDERS =====
router.get("/orders", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    const orders = await findAllOrders();
    res.json({ orders });
  } catch (err) {
    console.error("Dashboard orders error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== REPORTS =====
router.get("/reports", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const reports = await findAllReportsWithUser();
    res.json({ reports });
  } catch (err) {
    console.error("Dashboard reports error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===== HELPS =====
router.get("/helps", auth, async (req, res) => {
  try {
    const currentUser = await findUserById(req.userId);
    if (!currentUser || currentUser.role !== "ADMIN") return res.status(403).json({ message: "Access denied" });

    const helps = await findAllHelps();
    res.json({ helps });
  } catch (err) {
    console.error("Dashboard helps error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// ===== LOGOUT =====
router.post("/logout", auth, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Mark user inactive
    await updateUserById(user.id, { status: "Inactive" });

    // ✅ Clear cookie if using cookie auth
    res.clearCookie("token"); 

    res.json({ message: "Logged out successfully ✅" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;