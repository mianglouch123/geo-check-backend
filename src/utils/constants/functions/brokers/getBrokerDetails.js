import { BROKERS } from "../../brokers.js";

export function getBrokerDetails(email) {
  const findBrk = BROKERS.find(b => b.email.toLowerCase() === email.toLowerCase());
  if (!findBrk) {
    return null;
  }
  return {
    name: findBrk.name,
    brk: findBrk.label,
    email: findBrk.email,
    rut: findBrk.rut || ''
  };
}