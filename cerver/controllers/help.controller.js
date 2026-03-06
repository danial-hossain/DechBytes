import { createHelp } from "../utils/help.db.js";

export const submitHelp = async (req, res) => {
  try {
    const { email, message } = req.body;

    // Validation
    if (!email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and message are required" 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    console.log('Creating help request for:', email);

    const newHelp = await createHelp({ email, message });

    console.log('Help request created:', newHelp);

    res.status(201).json({
      success: true,
      message: "Help request submitted successfully",
      data: newHelp
    });
  } catch (error) {
    console.error("❌ Help submission error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};