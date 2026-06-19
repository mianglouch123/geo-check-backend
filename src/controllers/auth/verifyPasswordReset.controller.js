import { request, response } from "express";
import { PasswordResetTokenModel } from "../../models/PasswordResetToken.model.js";
import { UserModel } from "../../models/User.model.js";

export class VerifyPasswordResetController {
  run = async (req = request, res = response) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          ok: false,
          message: "Token no proporcionado"
        });
      }

      const cleanToken = String(token).trim();

      // 1. Buscar token válido (no expirado)
      const resetToken = await PasswordResetTokenModel.findOne({
        token : cleanToken,
        expiresAt: { $gt: new Date() }
      });

      if (!resetToken) {
        return res.status(400).json({
          ok: false,
          message: "Token inválido o expirado. Solicita un nuevo enlace."
        });
      }

      // 2. Buscar usuario asociado al email del token
      const user = await UserModel.findOne({ email: resetToken.email });

      if (!user) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado"
        });
      }

      // 3. Token válido → devolver información del usuario
      return res.status(200).json({
        ok: true,
        message: "Token valido",
        data: {
          email: user.email,
          broker: user.brokerName,
          token: resetToken.token
        }
      });

    } catch (error) {
      console.error("Error en verifyPasswordReset controller:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error al verificar el token"
      });
    }
  };
}