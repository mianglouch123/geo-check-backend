import mongoose, { Schema } from "mongoose";

const RegistroSchema = new Schema({
  tipo: {
    type: String,
    required: true,
    enum: ["ENTRADA", "SALIDA"]
  },
  broker: {
    type: String,
    required: true
  },
  token: {
    type: Schema.Types.ObjectId,
    ref: "Token",
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
RegistroSchema.index({ fechaRegistro: -1 });
RegistroSchema.index({ broker: 1 });
RegistroSchema.index({ tipo: 1 });

// ✅ TTL de 1 mes - MongoDB borra automáticamente
RegistroSchema.index(
  { fechaRegistro: 1 }, 
  { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 días
);

export const RegistroModel = mongoose.model("Registro", RegistroSchema);