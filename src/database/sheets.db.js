import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { RegistroModel } from '../models/Registro.model.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..', '..', '..'); // Ajusta según tu estructura

class SheetsDatabase {

  doc = null;
  isConnected = false;
  sheets = {
    ingreso: null,
    egreso: null
    };

  async initialize() {
  try {
    let auth;
    
    // SIEMPRE usar credentials.json en LOCAL (no confiar en NODE_ENV)
    // Verifica si existe el archivo o simplemente fuerza su uso en desarrollo
    const usarArchivo = true; // Forzamos usar archivo en local
    
    if (usarArchivo) {
      console.log('🔧 Usando credentials.json');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = join(__filename, '..', '..', '..');
      const credentialsPath = join(__dirname, 'credentials.json');
      
      console.log('Ruta:', credentialsPath);
      
      const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));
      
      auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    } else {
      // Producción: usar variables de entorno
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;
      
      if (privateKey && privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      
      if (privateKey && privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }
      
      auth = new JWT({
        email: process.env.ID_GOOGLE_SERVICE,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }

    this.doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
    await this.doc.loadInfo();
    
    this.isConnected = true;
    console.log(`✅ Google Sheets conectado: ${this.doc.title}`);
    
    await this.ensureSheetsExist();
    
    return this;
  } catch (error) {
    console.error('❌ Error conectando a Google Sheets:', error.message);
    throw error;
  }
}

  async ensureSheetsExist() {
    // Columnas comunes para ambas hojas
    const headers = [
      'timestamp',
      'broker',
      'ip',
      'token',
      'userAgent'
    ];

    // Hoja de INGRESO
    let ingresoSheet = this.doc.sheetsByTitle['INGRESO'];
    if (!ingresoSheet) {
      ingresoSheet = await this.doc.addSheet({ 
        title: 'INGRESO', 
        headerValues: headers
      });
      console.log('📄 Hoja "INGRESO" creada automáticamente');
    }
    this.sheets.ingreso = ingresoSheet;

    // Hoja de EGRESO
    let egresoSheet = this.doc.sheetsByTitle['EGRESO'];
    if (!egresoSheet) {
      egresoSheet = await this.doc.addSheet({ 
        title: 'EGRESO', 
        headerValues: headers
      });
      console.log('📄 Hoja "EGRESO" creada automáticamente');
    }
    this.sheets.egreso = egresoSheet;

    console.log(`✅ Hojas listas: INGRESO, EGRESO`);
  }

  // Registrar una ENTRADA
  async registrarIngreso(data) {
    if (!this.sheets.ingreso) {
      throw new Error('Hoja INGRESO no disponible');
    }
    
    const row = await this.sheets.ingreso.addRow({
      timestamp: data.timestamp || new Date().toISOString(),
      broker: data.broker,
      ip: data.ip,
      token: data.token,
      userAgent: data.userAgent
    });
    
    console.log(`✅ INGRESO registrado: ${data.broker} - ${data.ip}`);
    return row;
  }

  // Registrar una SALIDA (EGRESO) - SIN VALIDACIÓN
async registrarEgreso(data) {
  if (!this.sheets.egreso) {
    throw new Error('Hoja EGRESO no disponible');
  }
  
  const row = await this.sheets.egreso.addRow({
    timestamp: data.timestamp || new Date().toISOString(),
    broker: data.broker,
    ip: data.ip,
    token: data.token,
    userAgent: data.userAgent
  });
  
  console.log(`✅ EGRESO registrado: ${data.broker} - ${data.ip}`);
  return row;
}

// Eliminar tieneIngresoHoy y tieneEgresoHoy de aquí (o dejarlos pero no usarlos)

  // Método genérico según el tipo
  async registrar(tipo, data) {
    if (tipo === 'ENTRADA') {
      return this.registrarIngreso(data);
    } else if (tipo === 'SALIDA') {
      return this.registrarEgreso(data);
    } else {
      throw new Error(`Tipo inválido: ${tipo}. Debe ser ENTRADA o SALIDA`);
    }
  }

  // Métodos de consulta (opcionales, útiles para validaciones)
  async getUltimosIngresos(broker, limite = 5) {
    const rows = await this.sheets.ingreso.getRows();
    const filtrados = rows
      .filter(row => row.get('broker') === broker)
      .slice(-limite)
      .map(row => ({
        timestamp: row.get('timestamp'),
        broker: row.get('broker'),
        ip: row.get('ip')
      }));
    return filtrados;
  }

  async getUltimosEgresos(broker, limite = 5) {
    const rows = await this.sheets.egreso.getRows();
    const filtrados = rows
      .filter(row => row.get('broker') === broker)
      .slice(-limite)
      .map(row => ({
        timestamp: row.get('timestamp'),
        broker: row.get('broker'),
        ip: row.get('ip')
      }));
    return filtrados;
  }

  // Verificar si un broker ya registró INGRESO hoy (sin haber EGRESO)
  // Verificar si un broker ya registró INGRESO hoy
async tieneIngresoHoy(broker) {
  const ahora = new Date();
  const inicioDelDia = new Date(ahora);
  inicioDelDia.setHours(0, 0, 0, 0);
  
  const finDelDia = new Date(ahora);
  finDelDia.setHours(23, 59, 59, 999);
  
  const query = await RegistroModel.findOne({
    tipo: 'ENTRADA',
    broker: broker,
    fechaRegistro: { 
      $gte: inicioDelDia, 
      $lte: finDelDia 
    }
  });
  
  return !!query;
}

async tieneEgresoHoy(broker) {
  const ahora = new Date();
  const inicioDelDia = new Date(ahora);
  inicioDelDia.setHours(0, 0, 0, 0);
  
  const finDelDia = new Date(ahora);
  finDelDia.setHours(23, 59, 59, 999);
  
  const query = await RegistroModel.findOne({
    tipo: 'SALIDA',
    broker: broker,
    fechaRegistro: { 
      $gte: inicioDelDia, 
      $lte: finDelDia 
    }
  });
  
  return !!query;
}

  async getSheetInfo() {
    return {
      ingreso: {
        title: this.sheets.ingreso?.title,
        rowCount: await this.sheets.ingreso?.getRows().then(r => r.length) || 0
      },
      egreso: {
        title: this.sheets.egreso?.title,
        rowCount: await this.sheets.egreso?.getRows().then(r => r.length) || 0
      }
    };
  }
}


export const sheetsDb = new SheetsDatabase();
// sheets.db.js - parte del factory
export const factorySheetDb = {
  "ENTRADA": {
    tieneRegistroHoy: (broker) => sheetsDb.tieneIngresoHoy(broker),
    registrar: (data) => sheetsDb.registrarIngreso(data),
    nombre: "INGRESO"
  },
  "SALIDA": {
    tieneRegistroHoy: (broker) => sheetsDb.tieneEgresoHoy(broker),
    registrar: (data) => sheetsDb.registrarEgreso(data),
    nombre: "EGRESO"
  }
}