import { Router } from "express";
import { CheckTokenController } from "../../controllers/token/check.token.controller.js";
import { AuthenticationMiddleware } from "../../controllers/middlewares/auhentication.middleware.js";

const checkTokenRouter = Router();

checkTokenRouter.get("/token/check" , new AuthenticationMiddleware().run , 
new CheckTokenController().run);

export { checkTokenRouter };