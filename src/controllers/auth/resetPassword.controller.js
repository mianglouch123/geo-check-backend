import { request, response } from "express";
import bcrypt from "bcrypt";
import { PasswordResetTokenModel } from "../../models/PasswordResetToken.model.js";
import { UserModel } from "../../models/User.model.js";

export class ResetPasswordController {
  run = async (req = request, res = response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          ok: false,
          message: "Token y nueva contraseña son requeridos"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          ok: false,
          message: "La contraseña debe tener al menos 6 caracteres"
        });
      }

      // 1. Buscar token válido
      const resetToken = await PasswordResetTokenModel.findOne({
        token,
        expiresAt: { $gt: new Date() }
      });

      if (!resetToken) {
        return res.status(400).json({
          ok: false,
          message: "Token inválido o expirado. Solicita un nuevo enlace."
        });
      }

      // 2. Buscar usuario por email
      const user = await UserModel.findOne({ email: resetToken.email });

      if (!user) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado"
        });
      }

      // 3. Hashear nueva contraseña
      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      // 4. Actualizar contraseña
      user.password = hashedPassword;
      await user.save();

      // 5. Eliminar token usado
      await resetToken.deleteOne();

      return res.status(200).json({
        ok: true,
        message: "Contraseña actualizada exitosamente"
      });

    } catch (error) {
      console.error("Error en resetPassword controller:", error);
      return res.status(500).json({
        ok: false,
        message: error.message || "Error al restablecer la contraseña"
      });
    }
  };
}