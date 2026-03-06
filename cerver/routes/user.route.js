import { Router } from "express";
import {
  getProfileController,
  updateProfileController,
  loginUserController,
  logoutController,
  registerUserController,
} from "../controllers/user.controller.js";
import { verifyEmailController, resendOTPController } from "../controllers/verifyEmail.controller.js"; // ✅ নতুন import
import auth from "../middlewares/auth.js";

const userRouter = Router();

// Auth routes
userRouter.post("/register", registerUserController);
userRouter.post("/verify-email", verifyEmailController);        // ✅ আলাদা controller
userRouter.post("/resend-otp", resendOTPController);            // ✅ নতুন route
userRouter.post("/login", loginUserController);
userRouter.get("/logout", auth, logoutController);

// Profile routes
userRouter.get("/profile", auth, getProfileController);
userRouter.put("/profile/update", auth, updateProfileController);

export default userRouter;