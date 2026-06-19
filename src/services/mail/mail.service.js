import sgMail from '@sendgrid/mail';
import { env } from '../../enviorment/system.js';
export class MailService {
  constructor() {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
  }

  // ============================================
  // 1. Verificación de cuenta (registro)
  // ============================================
  async sendVerificationEmail(to, token, name, broker) {
    try {
      const frontendUrl = env.FRONTEND_URL || 'https://geo-check-frontend.vercel.app';
      const verificationLink = `${frontendUrl}/verify?token=${token}`;

      const info = await sgMail.send({
        from: `GeoCheck <${env.EMAIL_FROM || 'noreply@geoinsure.cl'}>`,
        to,
        subject: "Verifica tu cuenta - GeoCheck",
        html: this.generateVerificationEmailHTML(verificationLink, name, broker, token),
      });

      console.log(`📨 Email de verificación enviado a ${to}`);
      return info;
    } catch (err) {
      console.error("❌ Error enviando email de verificación:", err);
      throw err;
    }
  }

  // ============================================
  // 2. Recuperación de contraseña
  // ============================================
  async sendPasswordResetEmail(to, token, name) {
    try {
      const frontendUrl = env.FRONTEND_URL || 'https://geo-check-frontend.vercel.app';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      const info = await sgMail.send({
        from: `GeoCheck <${env.EMAIL_FROM || 'noreply@geoinsure.cl'}>`,
        to,
        subject: "Recuperación de contraseña - GeoCheck",
        html: this.generatePasswordResetEmailHTML(resetLink, name),
      });

      console.log(`📨 Email de recuperación enviado a ${to}`);
      return info;
    } catch (err) {
      console.error("❌ Error enviando email de recuperación:", err);
      throw err;
    }
  }

  // ============================================
  // 3. Confirmación de registro exitoso (ENTRADA/SALIDA)
  // ============================================
  async sendRegistroConfirmEmail(to, name, broker, tipo, fecha, hora) {
    try {
      const info = await sgMail.send({
        from: `GeoCheck <${env.EMAIL_FROM || 'noreply@geoinsure.cl'}>`,
        to,
        subject: `✅ ${tipo} registrada - GeoCheck`,
        html: this.generateRegistroConfirmEmailHTML(name, broker, tipo, fecha, hora),
      });

      console.log(`📨 Email de confirmación de ${tipo} enviado a ${to}`);
      return info;
    } catch (err) {
      console.error(`❌ Error enviando email de confirmación de ${tipo}:`, err);
      throw err;
    }
  }

  // ============================================
  // PLANTILLAS HTML
  // ============================================

  // 1. Plantilla de verificación
  generateVerificationEmailHTML(verificationLink, name, broker, token) {
    const expiresInMinutes = 7;
    const expiresInSeconds = expiresInMinutes * 60;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta - GeoCheck</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; font-size: 28px; margin-bottom: 4px; letter-spacing: -0.5px; }
          .header p { color: rgba(255,255,255,0.8); font-size: 14px; }
          .content { padding: 30px; }
          .greeting { margin-bottom: 25px; }
          .greeting h2 { color: #1f2937; font-size: 20px; margin-bottom: 8px; }
          .greeting p { color: #6b7280; line-height: 1.6; }
          .broker-info { background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin: 15px 0; display: inline-block; }
          .broker-info strong { color: #4f46e5; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .btn:hover { transform: scale(1.02); }
          .expiry { background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 15px 0; font-size: 14px; color: #92400e; border-left: 4px solid #f59e0b; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #9ca3af; font-size: 12px; margin: 5px 0; }
          .footer a { color: #6366f1; text-decoration: none; }
          .code-box { background: #1e1e2e; color: #a6e22e; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; margin: 10px 0; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📍 GeoCheck</h1>
            <p>Sistema de registro laboral</p>
          </div>
          <div class="content">
            <div class="greeting">
              <h2>Hola, ${name || 'Usuario'}!</h2>
              <p>Gracias por registrarte en <strong>GeoCheck</strong>. Para comenzar a usar el sistema de registro laboral, necesitamos verificar tu cuenta.</p>
            </div>

            <div class="broker-info">
              <strong>🏢 Broker:</strong> ${broker || 'No especificado'}
            </div>

            <div style="text-align: center;">
              <a href="${verificationLink}" class="btn">
                ✅ Verificar mi cuenta
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 10px 0;">
              O copia y pega este enlace en tu navegador:
            </p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 8px; font-size: 12px; color: #4b5563; text-align: center;">
              ${verificationLink}
            </p>

            <div class="expiry">
              ⏱️ Este enlace expirará en <strong>${expiresInMinutes} minutos</strong> (${expiresInSeconds} segundos).
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
              Si no solicitaste este registro, puedes ignorar este mensaje.
            </p>
          </div>
          <div class="footer">
            <p>📍 GeoCheck - Sistema de registro laboral</p>
            <p>© ${new Date().getFullYear()} GeoCheck - Todos los derechos reservados</p>
            <p style="margin-top: 8px;">
              <a href="${env.FRONTEND_URL || 'https://geo-check-frontend.vercel.app'}">Ir a GeoCheck</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 2. Plantilla de recuperación de contraseña
  generatePasswordResetEmailHTML(resetLink, name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar contraseña - GeoCheck</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; font-size: 28px; margin-bottom: 4px; }
          .header p { color: rgba(255,255,255,0.8); font-size: 14px; }
          .content { padding: 30px; }
          .greeting { margin-bottom: 25px; }
          .greeting h2 { color: #1f2937; font-size: 20px; margin-bottom: 8px; }
          .greeting p { color: #6b7280; line-height: 1.6; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .expiry { background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 15px 0; font-size: 14px; color: #92400e; border-left: 4px solid #f59e0b; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #9ca3af; font-size: 12px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📍 GeoCheck</h1>
            <p>Sistema de registro laboral</p>
          </div>
          <div class="content">
            <div class="greeting">
              <h2>Hola, ${name || 'Usuario'}!</h2>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>GeoCheck</strong>.</p>
            </div>

            <div style="text-align: center;">
              <a href="${resetLink}" class="btn">
                🔑 Restablecer contraseña
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 10px 0;">
              O copia y pega este enlace en tu navegador:
            </p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 8px; font-size: 12px; color: #4b5563; text-align: center;">
              ${resetLink}
            </p>

            <div class="expiry">
              ⏱️ Este enlace expirará en <strong>15 minutos</strong>.
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">
              Si no solicitaste este cambio, puedes ignorar este mensaje.<br>
              Tu contraseña actual seguirá siendo válida.
            </p>
          </div>
          <div class="footer">
            <p>📍 GeoCheck - Sistema de registro laboral</p>
            <p>© ${new Date().getFullYear()} GeoCheck - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 3. Plantilla de confirmación de registro (ENTRADA/SALIDA)
  generateRegistroConfirmEmailHTML(name, broker, tipo, fecha, hora) {
    const isEntrada = tipo === 'ENTRADA';
    const emoji = isEntrada ? '✅' : '👋';
    const color = isEntrada ? '#22c55e' : '#3b82f6';
    const mensaje = isEntrada 
      ? 'Tu jornada laboral ha comenzado. ¡Que tengas un excelente día!' 
      : 'Tu jornada laboral ha finalizado. ¡Descansa y nos vemos mañana!';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tipo} registrada - GeoCheck</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; font-size: 28px; margin-bottom: 4px; }
          .header p { color: rgba(255,255,255,0.8); font-size: 14px; }
          .content { padding: 30px; }
          .greeting { margin-bottom: 25px; }
          .greeting h2 { color: #1f2937; font-size: 20px; margin-bottom: 8px; }
          .greeting p { color: #6b7280; line-height: 1.6; }
          .status-box { background: ${color}10; border: 2px solid ${color}; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
          .status-box .emoji { font-size: 48px; display: block; margin-bottom: 10px; }
          .status-box .tipo { font-size: 24px; font-weight: bold; color: ${color}; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #6b7280; font-weight: 500; }
          .detail-value { color: #1f2937; font-weight: 600; }
          .message-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-style: italic; color: #4b5563; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #9ca3af; font-size: 12px; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📍 GeoCheck</h1>
            <p>Sistema de registro laboral</p>
          </div>
          <div class="content">
            <div class="greeting">
              <h2>Hola, ${name || 'Usuario'}!</h2>
              <p>Tu registro ha sido procesado exitosamente.</p>
            </div>

            <div class="status-box">
              <span class="emoji">${emoji}</span>
              <span class="tipo">${tipo}</span>
              <p style="color: #6b7280; margin-top: 5px;">Registro de jornada laboral</p>
            </div>

            <div style="margin: 20px 0;">
              <div class="detail-row">
                <span class="detail-label">🏢 Broker</span>
                <span class="detail-value">${broker}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha</span>
                <span class="detail-value">${fecha}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora</span>
                <span class="detail-value">${hora}</span>
              </div>
            </div>

            <div class="message-box">
              ${mensaje}
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Este es un comprobante de tu registro. Puedes consultar tu historial en la plataforma.
            </p>
          </div>
          <div class="footer">
            <p>📍 GeoCheck - Sistema de registro laboral</p>
            <p>© ${new Date().getFullYear()} GeoCheck - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Método para enviar email de recuperación de contraseña
async sendPasswordResetEmail(to, token, name) {
  try {
    const frontendUrl = env.FRONTEND_URL || 'https://geo-check-frontend.vercel.app';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const info = await sgMail.send({
      from: `GeoCheck <${env.EMAIL_FROM || 'noreply@geoinsure.cl'}>`,
      to,
      subject: "Recuperación de contraseña - GeoCheck",
      html: this.generatePasswordResetEmailHTML(resetLink, name),
    });

    console.log(`📨 Email de recuperación enviado a ${to}`);
    return info;
  } catch (err) {
    console.error("❌ Error enviando email de recuperación:", err);
    throw err;
  }
}
}