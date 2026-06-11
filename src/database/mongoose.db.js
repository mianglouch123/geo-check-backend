import mongoose from 'mongoose';
import { env } from '../enviorment/system.js';

class MongooseDb {
  static #instance = null;

  constructor() {
    // Evita que usen 'new MongooseDb()' fuera de la clase
    if (MongooseDb.#instance) {
      throw new Error("Use MongooseDb.getInstance() instead of 'new'");
    }
    this.connectionString = env.DATABASE_URL || 'mongodb://localhost:27017/your_database_name';
  }
   
  static getInstance() {
    if (!MongooseDb.#instance) {
      MongooseDb.#instance = Object.freeze(new MongooseDb());
    }
    return MongooseDb.#instance;  
  }

  initialize = async () => { 
    try {
      console.log(this.connectionString);
      await mongoose.connect(String(this.connectionString));
      console.log('Connected to MongoDB');
    }
    catch(error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }
}

// 3. Ahora funciona correctamente porque el método es estático
export const mongooseDb = MongooseDb.getInstance();
