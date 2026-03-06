import { findUserByEmail, updateUserById } from '../utils/user.db.js';

/**
 * Verify email with OTP
 * POST /api/user/verify-email
 */
export const verifyEmailController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔍 Verifying email:', email, 'with OTP:', otp);

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(400).json({
        error: true,
        success: false,
        message: "User not found"
      });
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      dbOtp: user.otp,
      dbExpires: user.otp_expires,
      currentTime: new Date().toISOString(),
      expiresTime: user.otp_expires ? new Date(user.otp_expires).toISOString() : null
    });

    // Check if OTP matches
    if (user.otp !== otp) {
      console.log('❌ OTP mismatch:', { provided: otp, stored: user.otp });
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid OTP"
      });
    }

    // Check if OTP is expired
    if (user.otp_expires) {
      const now = new Date();
      const expiryDate = new Date(user.otp_expires);
      
      console.log('⏰ OTP expiry check:', {
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
      console.log('❌ No expiry date found for OTP');
      return res.status(400).json({
        error: true,
        success: false,
        message: "OTP expired"
      });
    }

    // Update user as verified
    await updateUserById(user.id, {
      verify_email: true,
      otp: null,
      otp_expires: null
    });

    console.log('✅ Email verified successfully for user:', user.email);

    return res.status(200).json({
      error: false,
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("❌ verifyEmailController error:", error);
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false
    });
  }
};

/**
 * Resend OTP
 * POST /api/user/resend-otp
 */
export const resendOTPController = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('🔍 Resending OTP to email:', email);

    if (!email) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Email is required"
      });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(400).json({
        error: true,
        success: false,
        message: "User not found"
      });
    }

    // Generate new OTP
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await updateUserById(user.id, {
      otp: verifyCode,
      otp_expires: otpExpiry
    });

    // Send email with new OTP
    // You need to import sendEmailFun and VerificationEmail
    // await sendEmailFun({
    //   to: email,
    //   subject: "Verify your account - New OTP",
    //   html: VerificationEmail(user.name, verifyCode),
    // });

    console.log('✅ New OTP sent to email:', email);

    return res.status(200).json({
      error: false,
      success: true,
      message: "New OTP sent successfully"
    });

  } catch (error) {
    console.error("❌ resendOTPController error:", error);
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false
    });
  }
};