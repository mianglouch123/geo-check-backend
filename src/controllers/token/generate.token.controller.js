// GenerateTokenController.js
import mongoose from "mongoose";
import { request, response } from "express";
import { TokenModel } from "../../models/Token.schema.model.js";
import { randomBytes } from "crypto";

export class GenerateTokenController {
  run = async (req = request, res = response) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      
      // Generar token aleatorio en hexadecimal
      const tokenValue = randomBytes(16).toString('hex'); // 16 bytes = 32 caracteres hex
      const expiresAt = new Date(Date.now() + 7 * 60 * 1000); // 7 minutos
      
      const [tokenDoc] = await TokenModel.create([{
        token: tokenValue,
        used: false,
        expiresAt: expiresAt
      }], { session });
      
      await session.commitTransaction();
      
      return res.status(200).json({
        ok: true,
        data: { 
          token: tokenValue,
          expiresAt: expiresAt,
          expiresIn: '5 minutos'
        }
      });
      
    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error("Error in generate token", err);
      return res.status(500).json({
        ok: false,
        message: "Error al generar el token"
      });
    } finally {
      session.endSession();
    }
  }
}