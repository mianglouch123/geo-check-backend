import { Router } from "express";
import { RegistroController } from "../../controllers/registro/registro.controller.js";

const registroRouter = Router();

registroRouter.post("/registro" , new RegistroController().run);

export { registroRouter };