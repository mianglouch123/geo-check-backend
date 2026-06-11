import express from "express";
import { Router } from "express"
import { registroRouter } from "./registro/registro.router.js";
import { checkTokenRouter } from "./token/check.token.router.js";
import { generateTokenRouter } from "./token/generate.token.router.js";
const appRouter = Router();

appRouter.use(registroRouter);

appRouter.use(checkTokenRouter);

appRouter.use(generateTokenRouter)
export { appRouter };