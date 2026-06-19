import { Router } from "express";
import { RegisterController } from "../../controllers/auth/register.controller.js";

const registerRouter = Router();

registerRouter.post("/auth/register" , new RegisterController().run);

export { registerRouter };