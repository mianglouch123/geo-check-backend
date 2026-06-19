import mongoose from "mongoose";
import { request, response } from "express";
import { UserModel } from "../../models/User.model.js";
import { TokenVerificationUserModel } from "../../models/TokenVerificationUser.model.js";
import { MailService } from "../../services/mail/mail.service.js";
import { randomBytes } from "crypto";
import { getBrokerDetails } from "../../utils/constants/functions/brokers/getBrokerDetails.js";

export class ResendVerifyUserCodeController {
  run = async (req = request, res = response) => {
    const session = await mongoose.startSession();
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          ok: false,
          message: "Email es requerido"
        });
      }

      session.startTransaction();

      // 1. Buscar usuario
      const findEmail = await UserModel.findOne({ email: email.toLowerCase() });

      // ❌ CORREGIDO: Si NO existe, abortar
      if (!findEmail) {
        await session.abortTransaction();
        return res.status(404).json({
          ok: false,
          message: "No se encontró usuario con este email"
        });
      }

      // 2. Si ya está verificado, no se puede reenviar
      if (findEmail.isVerified) {
        await session.abortTransaction();
        return res.status(400).json({
          ok: false,
          message: "Usuario ya verificado. No es necesario reenviar código."
        });
      }

      // 3. Obtener detalles del broker
      const brokerDetails = getBrokerDetails(findEmail.email);

      if (!brokerDetails) {
        await session.abortTransaction();
        return res.status(404).json({
          ok: false,
          message: "Datos del broker no encontrados"
        });
      }

      // 4. Eliminar tokens de verificación anteriores (si existen)
      await TokenVerificationUserModel.deleteMany(
        { userId: findEmail._id },
        { session }
      );

      // 5. Generar nuevo token (15 minutos)
      const token = randomBytes(32).toString('hex');

      await TokenVerificationUserModel.create([{
        token,
        userId: findEmail._id,
      }], { session });

      // 6. Confirmar transacción antes de enviar email
      await session.commitTransaction();

      // 7. Enviar email (FUERA de la transacción)
      const emailService = new MailService();
      emailService.sendVerificationEmail(
        findEmail.email,
        token,
        brokerDetails.name,
        brokerDetails.brk
      ).catch(err => {
        console.error("❌ Error enviando correo de verificación:", err);
      });

      // 8. Respuesta exitosa
      return res.status(200).json({
        ok: true,
        message: "Nuevo código de verificación enviado a tu correo",
        data: {
          email: findEmail.email,
          broker: findEmail.brokerName,
          expiresIn: "15 minutos"
        }
      });

    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error("Error en resendVerification controller:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error al reenviar código de verificación"
      });
    } finally {
      session.endSession();
    }
  };
}