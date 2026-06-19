import { Router } from "express";
import { ResetPasswordController } from "../../controllers/auth/resetPassword.controller.js";

const resetPasswordRouter = Router();

resetPasswordRouter.post("/auth/reset-password" , new ResetPasswordController().run);

export { resetPasswordRouter };