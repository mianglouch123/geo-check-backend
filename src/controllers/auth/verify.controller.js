import { request, response } from "express";
import { UserModel } from "../../models/User.model.js";
import { TokenVerificationUserModel } from "../../models/TokenVerificationUser.model.js";
import { env } from "../../enviorment/system.js";
export class VerifyController {
  run = async (req = request, res = response) => {
    console.log("🔥🔥🔥 VERIFY CONTROLLER EJECUTADO 🔥🔥🔥"); // ← LOG FUERTE
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
      const verificationToken = await TokenVerificationUserModel.findOne({
        token : cleanToken,
        expiresAt: { $gt: new Date() }
      });

      if (!verificationToken) {
        return res.status(400).json({
          ok: false,
          message: "Token inválido o expirado. Solicita un nuevo código."
        });
      }

      // 2. Buscar usuario asociado
      const user = await UserModel.findById(verificationToken.userId);

      if (!user) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado"
        });
      }

      // 3. Si ya está verificado, responder igual (idempotente)
      if (user.isVerified) {
        return res.status(200).json({
          ok: true,
          message: "El usuario ya estaba verificado",
          data: {
            email: user.email,
            broker: user.brokerName
          }
        });
      }

      // 4. Marcar como verificado
      user.isVerified = true;
      await user.save();

      // 5. Eliminar token (ya fue usado)
      await verificationToken.deleteOne();

      // 6. Redirigir al frontend o responder JSON
      const frontendUrl = env.FRONTEND_URL || 'https://geo-check-frontend.vercel.app';


      // Si es petición API, responder JSON
      return res.status(200).json({
        ok: true,
        message: "Cuenta verificada exitosamente",
        data: {
          email: user.email,
          broker: user.brokerName,
          isVerified: user.isVerified
        }
      });

    } catch (error) {
      console.error("Error en verify controller:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error al verificar usuario"
      });
    }
  };
}