import express from "express";
import { Router } from "express"
import { registroRouter } from "./registro/registro.router.js";
import { checkTokenRouter } from "./token/check.token.router.js";
import { generateTokenRouter } from "./token/generate.token.router.js";
import { loginRouter } from "./auth/login.router.js";
import { registerRouter } from "./auth/register.router.js";
import { forgotPasswordRouter } from "./auth/forgot.password.router.js";
import { verifyPasswordResetRouter } from "./auth/verify.password.reset.router.js";
import { resendVerifyUserCodeRouter } from "./auth/resend.verify.user.code.router.js";
import { resetPasswordRouter } from "./auth/reset.password.router.js";
import { verifyUserCodeRouter } from "./auth/verify.user.code.router.js";


const appRouter = Router();


// ---------- REGISTRO ------------

appRouter.use(verifyUserCodeRouter);



appRouter.use(registroRouter);

appRouter.use(checkTokenRouter);

appRouter.use(generateTokenRouter);

// ----------- AUTH -----------
appRouter.use(loginRouter);
appRouter.use(registerRouter);
appRouter.use(forgotPasswordRouter);
appRouter.use(verifyPasswordResetRouter);
appRouter.use(resendVerifyUserCodeRouter);
appRouter.use(resetPasswordRouter);

export { appRouter };