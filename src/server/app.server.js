import express, { Router } from "express"; // ← Corregido: Importar Router
import cors from "cors";
import { env } from '../enviorment/system.js';
import { appRouter } from "../routes/app.router.js";

class AppServer {
 /**@type {Express.Application} */
 #app = null; 

 constructor() {
  this.#app = express();
  this.#middlewares();
  this.#app.set("trust proxy" , 1);
  this.#routes();
 }

 #middlewares() {
  this.#app.use(
   cors({
     origin: [
      "http://localhost:3002", 
      "http://localhost:5173",
      String(`${env.BACKEND_URL || "http://localhost:3002" }`),
      String(`${env.FRONTED_URL || "http://localhost:5173"}`),
      "https://geo-votation-backend.onrender.com"
     ],
     credentials: true,
     allowedHeaders: ["Content-Type", "Authorization"],
     methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
   })
  );
  
  this.#app.use(express.json({ limit: '30mb' }));
  this.#app.use(express.urlencoded({ extended: true, limit: '30mb' }));
 }

 #routes() {
  const router = Router(); // ← Ahora sí funcionará porque está importado arriba
  router.use(appRouter);
  this.#app.use(router);
 }

 start = () => {
  const { PORT } = env;
  // Retornamos una promesa para poder controlar si el servidor web levantó con éxito
  return new Promise((resolve) => {
    this.#app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
     resolve();
    });
  });
 }
}

export const appServer = new AppServer();
