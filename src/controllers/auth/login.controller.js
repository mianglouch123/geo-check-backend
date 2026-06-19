import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { request, response } from "express";
import { UserModel } from "../../models/User.model.js";
import { TokenVerificationUserModel } from "../../models/TokenVerificationUser.model.js";
import { MailService } from "../../services/mail/mail.service.js";
import { getBrokerDetails } from "../../utils/constants/functions/brokers/getBrokerDetails.js";
import { randomBytes } from "crypto";
import { env } from "../../enviorment/system.js";

export class LoginController {
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

      // 1. Buscar usuario
      const findEmail = await UserModel.findOne({ email: email.toLowerCase() });

      if (!findEmail) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado"
        });
      }

      // 2. Verificar si está verificado
      if (!findEmail.isVerified) {
        // Verificar si ya tiene un token de verificación activo
        const existingToken = await TokenVerificationUserModel.findOne({
          userId: findEmail._id,
          expiresAt: { $gt: new Date() }
        });

        if (existingToken) {
          return res.status(401).json({
            ok: false,
            message: "Cuenta no verificada. Revisa tu correo (el token aún es válido).",
            needsVerification: true,
            email: findEmail.email
          });
        }

        // Si no tiene token activo, generar uno nuevo y enviar email
        const brokerDetail = getBrokerDetails(findEmail.email);
        if (!brokerDetail) {
          return res.status(404).json({
            ok: false,
            message: "Datos del broker no encontrados."
          });
        }

        const newToken = randomBytes(32).toString('hex');
        await TokenVerificationUserModel.create([{
          token: newToken,
          userId: findEmail._id,
        }], { session });

        await session.commitTransaction();

        // Enviar nuevo email de verificación
        const mailService = new MailService();
        mailService.sendVerificationEmail(
          brokerDetail.email,
          newToken,
          brokerDetail.name,
          brokerDetail.brk
        ).catch(err => console.error("Error enviando email de verificación:", err));

        return res.status(401).json({
          ok: false,
          message: "Cuenta no verificada. Se ha enviado un nuevo código de verificación a tu correo.",
          needsVerification: true,
          email: findEmail.email
        });
      }

      // 3. Verificar contraseña
      const isPasswordValid = bcrypt.compareSync(password, findEmail.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          ok: false,
          message: "Credenciales inválidas"
        });
      }

      // 4. Generar JWT (2 horas como tienes en tu código)
      const accessToken = jsonwebtoken.sign(
        {
          userId: findEmail._id,
          email: findEmail.email,
          broker: findEmail.brokerName
        },
        env.JWT_SECRET || 'I_LOVE_THE_CATS',
        { expiresIn: "30d" }
      );

      await session.commitTransaction();

      return res.status(200).json({
        ok: true,
        message: "Login exitoso",
        data: {
          token: accessToken,
          user: {
            id: findEmail._id,
            email: findEmail.email,
            broker: findEmail.brokerName,
            name: findEmail.name,
            isVerified: findEmail.isVerified
          }
        }
      });

    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error("Error en login controller:", err);
      return res.status(500).json({
        ok: false,
        message: err.message || "Error al iniciar sesión"
      });
    } finally {
      session.endSession();
    }
  };
}