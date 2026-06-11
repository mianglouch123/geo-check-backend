// Token.js
import mongoose, { Schema } from "mongoose";

const TokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  used: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 60 * 1000)
  }
});

// Índice TTL para auto-eliminación
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenModel = mongoose.model("Token", TokenSchema);