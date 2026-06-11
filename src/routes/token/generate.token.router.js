import { Router } from "express";
import { GenerateTokenController } from "../../controllers/token/generate.token.controller.js";

const generateTokenRouter = Router();

generateTokenRouter.post("/token/generate", new GenerateTokenController().run);

export { generateTokenRouter }