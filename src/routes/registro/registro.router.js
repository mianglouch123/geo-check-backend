import { Router } from "express";
import { RegistroController } from "../../controllers/registro/registro.controller.js";
import { AuthenticationMiddleware } from "../../controllers/middlewares/auhentication.middleware.js";
const registroRouter = Router();

registroRouter.post("/registro" , 
new AuthenticationMiddleware().run, 
new RegistroController().run);

export { registroRouter };