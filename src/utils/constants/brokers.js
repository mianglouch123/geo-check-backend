// domain/constants/brokers.js
export const BROKERS = [
  { value: 'MMC', label: 'MMC', name: 'Marcela Andrea Miranda Cantillana', email: 'marcela.miranda@geoinsure.cl', rut: '10974586-3' },
  { value: 'ERS', label: 'ERS', name: 'Elsy Carolina Rivera Sumoza', email: 'elsy.rivera@geoinsure.cl', rut: '27185902-3' },
  { value: 'JSM', label: 'JSM', name: 'Jessenia Suarez Mora', email: 'jessenia.suarez@geoinsure.cl', rut: '26294794-7' },
  { value: 'EFP', label: 'EFP', name: 'Edriana Evadey Flores Portillo', email: 'edriana.flores@geoinsure.cl', rut: '26918446-9' },
  { value: 'AMV', label: 'AMV', name: 'Alonso Mori', email: 'alonso.mori@geoinsure.cl', rut: '' },
  { value: 'KCC', label: 'KCC', name: 'Karina Cespédes', email: 'karina.cespedes@geoinsure.cl', rut: '20882793-6' },
  { value: 'GHR', label: 'GHR', name: 'Gilberto Javier Hervilla Ramos', email: 'gilberto.hervilla@geoinsure.cl', rut: '27325509-5' },
  { value: 'RFO', label: 'RFO', name: 'Roberto Francisco Fairlie Olguín', email: 'roberto.fairlie@gmail.com', rut: '13076566-1' },
  { value: 'YMC', label: 'YMC', name: 'Yusmely Coromoto Manchego Corredor', email: 'segurosmanchego@gmail.com', rut: '27980096-6' },
  { value: 'JESC', label: 'JESC', name: 'Jorge Enrique Silva Caceres', email: 'jorge.silva@geoinsure.cl', rut: '10354570-6' },
  { value: 'ITAP', label: 'ITAP', name: 'Ingrid Tatiana Antero Pinillo', email: 'ingrid.antero@geoinsure.cl', rut: '26156814-4' },
  { value: 'DHA', label: 'DHA', name: 'Deisy Hurtado Arias', email: 'deisy.hurtado@geoinsure.cl', rut: '28231771-0' },
  { value: 'PMR', label: 'PMR', name: 'Patricio Madariaga Romero', email: 'pmadariaga@hearconsultores.cl', rut: '9979522-0' },
  { value: 'MAPM', label: 'MAPM', name: 'Miguel Angel Perez', email: 'miguel.perez@geoinsure.cl', rut: '4176532-0' }, 
];

// Para compatibilidad con el código existente
export const BROKERS_SIMPLE = BROKERS.map(b => ({ value: b.value, label: b.label }));