// CheckTokenController.js
import mongoose from "mongoose";
import { request, response } from "express";
import { TokenModel } from "../../models/Token.schema.model.js";

export class CheckTokenController {
  run = async (req = request, res = response) => {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        ok: false, 
        message: "Token no proporcionado" 
      });
    }

    try {
      const findToken = await TokenModel.findOne({ 
        token, 
        used: false, 
        expiresAt: { $gt: new Date() } 
      });
      
      if (!findToken) {
        return res.status(404).json({ 
          ok: false, 
          message: "Token inválido o expirado" 
        });
      }
      
      return res.status(200).json({ 
        ok: true, 
        data: {
          valid: true,
          token: findToken.token,
          expiresAt: findToken.expiresAt
        }
      });
      
    } catch (err) {
      console.error("Error in check token controller", err);
      return res.status(500).json({
        ok: false,
        message: "Error al validar el token"
      });
    }
  }
}