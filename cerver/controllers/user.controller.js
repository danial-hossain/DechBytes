// controllers/user.controller.js
import { findUserByEmail, createUser, findUserById, updateUserById } from '../utils/user.db.js';
import { findAddressesByUserId, createAddress, updateAddressById } from '../utils/address.db.js';
import bcryptjs from "bcryptjs";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";

// ===== REGISTER USER =====
export async function registerUserController(req, res) {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message: "Provide name, email, mobile, and password",
        error: true,
        success: false,
      });
    }

    if (!/^\d{11}$/.test(mobile)) {
      return res.status(400).json({
        message: "Mobile number must be 11 digits",
        error: true,
        success: false,
      });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "User already registered with this email",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await createUser({
      name,
      email,
      mobile: mobile.toString(),
      password: hashPassword,
      otp: verifyCode,
      otpExpires: otpExpiry,
      verify_email: false,
      status: 'Active',
      role: 'USER',
      last_login_date: null,
    });

    await sendEmailFun({
      to: email,
      subject: "Verify your account",
      html: VerificationEmail(name, verifyCode),
    });

    const accessToken = await generatedAccessToken(user.id);
    const refreshToken = await generatedRefreshToken(user.id);

    const cookieOptions = { httpOnly: true, secure: false, sameSite: "Lax" };
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.status(201).json({
      message: "User registered successfully! Please verify your email.",
      error: false,
      success: true,
      data: { id: user.id, accessToken, refreshToken },
    });

  } catch (error) {
    console.error("registerUserController error:", error);
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

// ===== VERIFY EMAIL =====
export async function verifyEmailController(req, res) {
  try {
    const { email, otp } = req.body;
    
    console.log('Verifying email:', email, 'with OTP:', otp);
    
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ 
        error: true, 
        success: false, 
        message: "User not found" 
      });
    }

    console.log('User found:', { 
      email: user.email, 
      dbOtp: user.otp, 
      dbExpires: user.otp_expires,  // ✅ use otp_expires
      currentTime: new Date(),
      expiresTime: user.otp_expires ? new Date(user.otp_expires) : null
    });

    // Check if OTP matches
    if (user.otp !== otp) {
      console.log('OTP mismatch:', { provided: otp, stored: user.otp });
      return res.status(400).json({ 
        error: true, 
        success: false, 
        message: "Invalid OTP" 
      });
    }

    // ✅ Check OTP expiry using otp_expires
    if (user.otp_expires) {
      const now = new Date();
      const expiryDate = new Date(user.otp_expires);
      
      console.log('OTP expiry check:', {
        now: now.toISOString(),
        expiry: expiryDate.toISOString(),
        isExpired: now > expiryDate
      });

      if (now > expiryDate) {
        return res.status(400).json({ 
          error: true, 
          success: false, 
          message: "OTP expired" 
        });
      }
    } else {
      // If no expiry set, consider it expired
      return res.status(400).json({ 
        error: true, 
        success: false, 
        message: "OTP expired" 
      });
    }

    // ✅ Update using correct column names
    await updateUserById(user.id, { 
      verify_email: true, 
      otp: null, 
      otp_expires: null   // ✅ use otp_expires
    });

    console.log('Email verified successfully for user:', user.email);

    return res.status(200).json({ 
      error: false, 
      success: true, 
      message: "Email verified successfully" 
    });

  } catch (error) {
    console.error("verifyEmailController error:", error);
    return res.status(500).json({ 
      message: error.message, 
      error: true, 
      success: false 
    });
  }
}

// ===== LOGIN =====
export async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user)
      return res.status(400).json({ message: "User not registered", error: true, success: false });

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Incorrect password", error: true, success: false });

    if (user.status === "Suspended")
      return res.status(400).json({ message: "Account suspended", error: true, success: false });

    const accessToken = await generatedAccessToken(user.id);
    const refreshToken = await generatedRefreshToken(user.id);

    await updateUserById(user.id, { last_login_date: new Date(), status: "Active" });

    const cookieOptions = { httpOnly: true, secure: false, sameSite: "Lax" };
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.json({ message: "Login successful", error: false, success: true, data: { id: user.id, accessToken, refreshToken } });

  } catch (error) {
    console.error("loginUserController error:", error);
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
}

// ===== LOGOUT =====
export async function logoutController(req, res) {
  try {
    const userId = req.userId;
    const cookieOptions = { httpOnly: true, secure: false, sameSite: "Lax" };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    await updateUserById(userId, { status: "Inactive" });

    return res.json({ message: "Logout successful", error: false, success: true });

  } catch (error) {
    console.error("logoutController error:", error);
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
}

// ===== GET PROFILE =====
export async function getProfileController(req, res) {
  try {
    const user = await findUserById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found", error: true, success: false });

    const addresses = await findAddressesByUserId(req.userId);

    return res.status(200).json({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address_details: addresses,
      role: user.role,
    });

  } catch (error) {
    console.error("getProfileController error:", error);
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
}

// ===== UPDATE PROFILE =====
export async function updateProfileController(req, res) {
  try {
    const userId = req.userId;
    const { name, mobile, password, address_details } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (mobile) {
      if (!/^\d{11}$/.test(mobile)) {
        return res.status(400).json({ message: "Mobile number must be 11 digits", error: true, success: false });
      }
      updateFields.mobile = mobile.toString();
    }
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    // 1️⃣ Update Users table
    const updatedUser = await updateUserById(userId, updateFields);

    // 2️⃣ Handle Addresses
    if (Array.isArray(address_details)) {
      for (const addr of address_details) {
        if (addr.id) {
          // Update existing
          await updateAddressById(addr.id, {
            address_line: addr.address_line,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            country: addr.country,
            mobile: addr.mobile,
            status: addr.status !== undefined ? addr.status : true
          });
        } else {
          // Create new
          await createAddress({ ...addr, userId, status: true });
        }
      }
    }

    // 3️⃣ Fetch updated addresses
    const addresses = await findAddressesByUserId(userId);

    // 4️⃣ Return combined response
    return res.status(200).json({
      message: "Profile updated successfully",
      error: false,
      success: true,
      data: { ...updatedUser, address_details: addresses },
    });

  } catch (error) {
    console.error("updateProfileController error:", error);
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};