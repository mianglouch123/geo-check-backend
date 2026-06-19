import 'dotenv/config';

export class SystemEnv {
  // 1. Declaramos la variable de instancia como estática y privada
  static #instance = null;

  constructor() {
    // Evitamos que se creen instancias con 'new' desde fuera
    if (SystemEnv.#instance) {
      throw new Error("Use SystemEnv.getInstance() instead of 'new'");
    }
    this.PORT = process.env.PORT || 3000;
    this.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001",
    this.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/your_database_name';
    this.JWT_SECRET = process.env.JWT_SECRET || 'I_LOVE_THE_CATS';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '5min';
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.ID_GOOGLE_SERVICE = process.env.ID_GOOGLE_SERVICE || 'geo-sheet-backend@hybrid-zephyr-449119-r7.iam.gserviceaccount.com';
    this.EMAIL_GOOGLE_SERVICE = process.env.EMAIL_GOOGLE_SERVICE || 'geo-sheet-backend@hybrid-zephyr-449119-r7.iam.gserviceaccount.com'
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "none";
    this.EMAIL_FROM = process.env.EMAIL_FROM || "noreply@geoinsure.cl"
  }

  // 2. Convertimos el método en estático
  static getInstance() {
    if (!SystemEnv.#instance) {
      SystemEnv.#instance = Object.freeze(new SystemEnv());
    }
    return SystemEnv.#instance;
  }
}

// 3. Exportamos la instancia única ya creada
export const env = SystemEnv.getInstance();
