import mongoose, { Schema } from 'mongoose';

const PasswordResetTokenSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
  }
}, {
  timestamps: { createdAt: 'created_at' }
});

// Índices
PasswordResetTokenSchema.index({ email: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetTokenModel = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);