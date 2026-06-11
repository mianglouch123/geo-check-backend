import dns from "node:dns";
if (process.env.NODE_ENV === "development") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
  dns.setDefaultResultOrder("ipv4first");
}

import { mongooseDb } from "./database/mongoose.db.js";
import { appServer } from "./server/app.server.js";
import { sheetsDb } from "./database/sheets.db.js";

const bootstrap = async () => {
  try {
    // 1. Conectar a MongoDB
    await mongooseDb.initialize();
    console.log('✅ MongoDB conectado');
    
    // 2. Conectar a Google Sheets (ANTES de levantar el servidor)
    await sheetsDb.initialize();
    console.log('✅ Google Sheets conectado');
    
    // 3. Una vez todo conectado, levantamos el servidor Express
    await appServer.start();
    
    console.log('🚀 Aplicación completamente iniciada con éxito');
  } catch (err) {
    console.error('❌ Error crítico al iniciar la aplicación:', err);
    process.exit(1); // Detiene el proceso si algo falla en el arranque
  }
}

bootstrap();