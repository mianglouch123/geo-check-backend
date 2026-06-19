import { Router } from "express";
import { VerifyPasswordResetController } from "../../controllers/auth/verifyPasswordReset.controller.js";

const verifyPasswordResetRouter = Router();

verifyPasswordResetRouter.get("/auth/verify-password-reset" , 
new VerifyPasswordResetController().run);

export { verifyPasswordResetRouter };