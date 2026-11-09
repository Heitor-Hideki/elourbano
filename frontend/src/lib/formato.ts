const DIA_MS = 24 * 60 * 60 * 1000;

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const diaMes = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const formatarData = (iso: string) => data.format(new Date(iso));
export const formatarDiaMes = (iso: string) => diaMes.format(new Date(iso));
export const formatarHora = (iso: string) => hora.format(new Date(iso));

export function diasDesde(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DIA_MS));
}

export function idadeRelativa(iso: string) {
  const dias = diasDesde(iso);
  if (dias === 0) return "hoje";
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

export function duracaoEmDias(iso: string) {
  const dias = diasDesde(iso);
  return dias === 1 ? "1 dia" : `${dias} dias`;
}

export function mascararCep(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

export const apenasDigitos = (valor: string) => valor.replace(/\D/g, "");

export function normalizarProtocolo(valor: string) {
  return valor.trim().toUpperCase();
}
