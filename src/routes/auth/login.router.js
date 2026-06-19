import { Router } from "express";
import { LoginController } from "../../controllers/auth/login.controller.js";

const loginRouter = Router();

loginRouter.post("/auth/login" , new LoginController().run);

export { loginRouter }