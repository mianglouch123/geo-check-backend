// RegistroController.js
import mongoose from "mongoose";
import { request, response } from "express";
import { RegistroModel } from "../../models/Registro.model.js";
import { sheetsDb, factorySheetDb } from "../../database/sheets.db.js";
import { TokenModel } from "../../models/Token.schema.model.js";

export class RegistroController {
  run = async (req = request, res = response) => {
    const session = await mongoose.startSession();
    
    try {
      const { token, tipo, broker } = req.body;
      
      // 1. Validaciones iniciales
      if (!token || !tipo || !broker) {
        return res.status(400).json({
          ok: false,
          message: "Faltan campos requeridos: token, tipo, broker"
        });
      }

      if (!["ENTRADA", "SALIDA"].includes(tipo)) {
        return res.status(400).json({
          ok: false,
          message: "Tipo debe ser ENTRADA o SALIDA"
        });
      }

      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      // 2. Iniciar transacción
      session.startTransaction();

      // 3. Validar token
      const findToken = await TokenModel.findOne({ 
        token, 
        used: false, 
        expiresAt: { $gt: new Date() } 
      }).session(session);

      if (!findToken) {
        await session.abortTransaction();
        return res.status(404).json({
          ok: false,
          message: "Token inválido o expirado"
        });
      }

      // 4. Marcar token como usado
      findToken.used = true;
      await findToken.save({ session });

      // 5. Validaciones de negocio
      const sheetHandler = factorySheetDb[tipo];
      
      if (sheetHandler) {
        // Validar duplicado hoy
        const yaRegistroHoy = await sheetHandler.tieneRegistroHoy(broker);
        if (yaRegistroHoy) {
          await session.abortTransaction();
          return res.status(400).json({
            ok: false,
            message: `Ya registró ${tipo === 'ENTRADA' ? 'ingreso' : 'egreso'} hoy`
          });
        }
        
        // ✅ VALIDACIÓN CRÍTICA: SALIDA requiere ENTRADA previa
        if (tipo === 'SALIDA') {
          const inicioDelDia = new Date();
          inicioDelDia.setHours(0, 0, 0, 0);
          
          const finDelDia = new Date();
          finDelDia.setHours(23, 59, 59, 999);
          
          const tieneEntradaHoy = await RegistroModel.findOne({
            tipo: 'ENTRADA',
            broker: broker,
            fechaRegistro: { $gte: inicioDelDia, $lte: finDelDia }
          }).session(session);
          
          if (!tieneEntradaHoy) {
            await session.abortTransaction();
            return res.status(400).json({
              ok: false,
              message: `No se puede registrar SALIDA sin una ENTRADA previa hoy para el broker: ${broker}`
            });
          }
        }
      }

      // 6. Guardar en MongoDB
      const [registroDoc] = await RegistroModel.create([{
        tipo,
        broker,
        token: findToken._id,
        ip,
        userAgent,
        fechaRegistro: new Date()
      }], { session });

      await session.commitTransaction();

      // 7. Guardar en Google Sheets (sin esperar, solo insercción)
      if (sheetHandler) {
        sheetHandler.registrar({
          timestamp: new Date().toISOString(),
          broker,
          ip,
          token: token,
          userAgent
        }).catch(err => {
          console.error("❌ Error insertando en Google Sheets:", err.message);
        });
      }      

      // 8. Respuesta exitosa
      return res.status(200).json({
        ok: true,
        message: tipo === 'ENTRADA' ? 'Ingreso registrado exitosamente' : 'Egreso registrado exitosamente',
        data: {
          tipo: registroDoc.tipo,
          broker: registroDoc.broker,
          fecha: registroDoc.fechaRegistro.toLocaleDateString('es-CL'),
          hora: registroDoc.fechaRegistro.toLocaleTimeString('es-CL'),
          ip: registroDoc.ip
        }
      });

    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error("Error en registro controller:", err);
      return res.status(500).json({
        ok: false,
        message: "Error al procesar el registro",
        error: err.message
      });
    } finally {
      session.endSession();
    }
  };
}