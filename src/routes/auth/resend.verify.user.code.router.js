import { Router } from "express";
import { ResendVerifyUserCodeController } from "../../controllers/auth/resend.verify.user.code.controller.js";

const resendVerifyUserCodeRouter = Router();

resendVerifyUserCodeRouter.post("/auth/resend-verify-user-code" , new ResendVerifyUserCodeController().run);

export { resendVerifyUserCodeRouter }