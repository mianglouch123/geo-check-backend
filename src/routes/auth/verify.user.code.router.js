import { Router } from "express";
import { VerifyController } from "../../controllers/auth/verify.controller.js";
console.log("VERIFY USER CODE ROUTER CARGADO");
const verifyUserCodeRouter = Router();

verifyUserCodeRouter.get("/auth/verify-user-code" , new VerifyController().run);

export { verifyUserCodeRouter }