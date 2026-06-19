import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { request, response } from "express";
import { UserModel } from "../../models/User.model.js";
import { TokenVerificationUserModel } from "../../models/TokenVerificationUser.model.js";
import { getBrokerDetails } from "../../utils/constants/functions/brokers/getBrokerDetails.js";
import { MailService } from "../../services/mail/mail.service.js";
import { randomBytes } from "crypto";

export class RegisterController {
  run = async (req = request, res = response) => {
    const session = await mongoose.startSession();
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          ok: false,
          message: "Campos faltantes: email, password."
        });
      }

      session.startTransaction();

      // 1. Verificar si el usuario ya existe
      const findEmail = await UserModel.findOne({ email: email.toLowerCase() });

      if (findEmail) {
        let msg = "El usuario ya existe.";
        if (!findEmail.isVerified) {
          msg += " Falta por verificar. Revisa tu correo.";
        }
        return res.status(400).json({ ok: false, message: msg });
      }

      // 2. Obtener detalles del broker por email
      const brokerDetail = getBrokerDetails(email);

      if (!brokerDetail) {
        return res.status(404).json({
          ok: false,
          message: "Datos del broker no encontrados. Email no registrado en la lista."
        });
      }

      // 3. Hashear contraseña (bcrypt.hashSync(password, saltRounds))
      const hashedPassword = bcrypt.hashSync(password, 10);

      // 4. Crear usuario (NO verificado)
      const [newUser] = await UserModel.create([{
        email: email.toLowerCase(),
        brokerName: brokerDetail.brk,
        password: hashedPassword,
      }], { session });

      // 5. Generar token de verificación (7 minutos)
      const token = randomBytes(32).toString('hex');

      await TokenVerificationUserModel.create([{
        token,
        userId: newUser._id,
      }], { session });

      // 6. Commit de la transacción (guardar usuario y token)
      await session.commitTransaction();

      // 7. Enviar email de verificación (FUforgotPassword.controller.jsERA de la transacción, no bloquear)
      const mailService = new MailService();
      mailService.sendVerificationEmail(
        brokerDetail.email,
        token,
        brokerDetail.name,
        brokerDetail.brk
      ).catch(err => console.error("Error enviando email de verificación:", err));

      // 8. Respuesta exitosa (NO devolver token de login)
      return res.status(201).json({
        ok: true,
        message: "Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.",
        data: {
          email: newUser.email,
          broker: newUser.brokerName,
          name: newUser.name,
          isVerified: newUser.isVerified
        }
      });

    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error("Error en register controller:", err);
      return res.status(500).json({
        ok: false,
        message: err.message || "Error al registrar usuario"
      });
    } finally {
      session.endSession();
    }
  };
}