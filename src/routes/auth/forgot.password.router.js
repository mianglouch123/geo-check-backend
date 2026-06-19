import { Router } from "express";
import { ForgotPasswordController } from "../../controllers/auth/forgotPassword.controller.js";

const forgotPasswordRouter = Router();

forgotPasswordRouter.post("/auth/forgot-password" , new ForgotPasswordController().run);

export { forgotPasswordRouter };