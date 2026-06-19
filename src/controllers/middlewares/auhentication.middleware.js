import { request, response } from "express";
import jsonwebtoken from "jsonwebtoken";
import { UserModel } from "../../models/User.model.js";
import { env } from "../../enviorment/system.js";
export class AuthenticationMiddleware {
  run = async (req = request, res = response, next) => {
    try {
      // 1. Obtener token del header
      const authHeader = req.header("Authorization")?.replace("Bearer ", "").trim();
      
      if (!authHeader) {
        return res.status(401).json({
          ok: false,
          message: "Acceso denegado. Token no proporcionado o formato inválido."
        });
      }

      // 2. Extraer token (removear "Bearer ")
      const accessToken = authHeader;

      // 3. Verificar token (NO usar decode, usar verify)
      let decoded;
      try {
        decoded = jsonwebtoken.verify(accessToken, env.JWT_SECRET || 'I_LOVE_THE_CATS');
      } catch (verifyError) {
        if (verifyError.name === "TokenExpiredError") {
          return res.status(401).json({
            ok: false,
            message: "Token expirado. Por favor, inicia sesión nuevamente."
          });
        }
        if (verifyError.name === "JsonWebTokenError") {
          return res.status(401).json({
            ok: false,
            message: "Token inválido. Por favor, inicia sesión nuevamente."
          });
        }
        throw verifyError;
      }

      // 4. Buscar usuario en base de datos (opcional pero recomendado)
      const user = await UserModel.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no encontrado. El token no corresponde a un usuario válido."
        });
      }

      if (!user.isVerified) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no verificado. Por favor, verifica tu cuenta."
        });
      }

      req.user = user;
      req.userId = user._id;
      req.broker = user.brokerName;

      next();

    } catch (error) {
      console.error("Error en authentication middleware:", error);
      return res.status(500).json({
        ok: false,
        message: "Error interno al autenticar usuario."
      });
    }
  };
}