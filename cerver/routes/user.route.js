import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  loginUserController,
  logoutController,
  registerUserController,
  uploadAvatarController,        // ✅ যোগ করা হয়েছে
} from "../controllers/user.controller.js";
import { verifyEmailController, resendOTPController } from "../controllers/verifyEmail.controller.js";
import auth from "../middlewares/auth.js";
import { upload } from "../config/cloudinary.js";              // ✅ যোগ করা হয়েছে

const userRouter = Router();

// Auth routes
userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyEmailController);
userRouter.post("/resend-otp", resendOTPController);
userRouter.post("/login", loginUserController);
userRouter.get("/logout", auth, logoutController);

// Profile routes
userRouter.get("/profile", auth, getProfileController);
userRouter.put("/profile/update", auth, updateProfileController);

// Avatar upload ✅
userRouter.post("/upload-avatar", auth, upload.single("avatar"), uploadAvatarController);

export default userRouter;