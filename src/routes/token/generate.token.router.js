import { Router } from "express";
import { GenerateTokenController } from "../../controllers/token/generate.token.controller.js";
import { AuthenticationMiddleware } from "../../controllers/middlewares/auhentication.middleware.js";
const generateTokenRouter = Router();

generateTokenRouter.post("/token/generate", new AuthenticationMiddleware().run, new GenerateTokenController().run);

export { generateTokenRouter }