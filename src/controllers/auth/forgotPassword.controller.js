import { request, response } from "express";
import { randomBytes } from "crypto";
import { UserModel } from "../../models/User.model.js";
import { PasswordResetTokenModel } from "../../models/PasswordResetToken.model.js";
import { MailService } from "../../services/mail/mail.service.js";
import { getBrokerDetails } from "../../utils/constants/functions/brokers/getBrokerDetails.js";
import { env } from "../../enviorment/system.js";

const mailService = new MailService();

export class ForgotPasswordController {
  run = async (req = request, res = response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          ok: false,
          message: "Email es requerido"
        });
      }

      // 1. Buscar usuario
      const user = await UserModel.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(404).json({
          ok: false,
          message: "No existe una cuenta con este email"
        });
      }

      // 2. Verificar si está verificado
      if (!user.isVerified) {
        return res.status(400).json({
          ok: false,
          message: "Esta cuenta no está verificada. Primero debes verificar tu cuenta.",
          needsVerification: true,
          email: user.email
        });
      }

      // 3. Obtener detalles del broker
      const brokerDetail = getBrokerDetails(email);

      if (!brokerDetail) {
        return res.status(404).json({
          ok: false,
          message: "Datos del broker no encontrados."
        });
      }

      // 4. Eliminar tokens anteriores
      await PasswordResetTokenModel.deleteMany({ email: user.email });

      // 5. Generar token (15 minutos)
      const token = randomBytes(32).toString('hex');

      await PasswordResetTokenModel.create({
        email: user.email,
        token,
      });

      // 6. Enviar email (no bloquear respuesta)
      const frontendUrl = env.FRONTEND_URL || 'https://geo-check-frontend.vercel.app';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      // Usamos el servicio de email existente, pero con el link de reset
      mailService.sendPasswordResetEmail(
        brokerDetail.email,
        token,
        brokerDetail.name
      ).catch(err => console.error("Error enviando email de recuperación:", err));

      return res.status(200).json({
        ok: true,
        message: "Se ha enviado un enlace de recuperación a tu correo"
      });

    } catch (error) {
      console.error("Error en forgotPassword controller:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error al procesar la solicitud"
      });
    }
  };
}