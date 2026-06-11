import { Router } from "express";
import { CheckTokenController } from "../../controllers/token/check.token.controller.js";

const checkTokenRouter = Router();

checkTokenRouter.get("/token/check" , new CheckTokenController().run);

export { checkTokenRouter };