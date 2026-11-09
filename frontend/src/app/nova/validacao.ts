import { LIMITES } from "@/lib/dominio";
import { apenasDigitos } from "@/lib/formato";
import type { Categoria } from "@/types/ocorrencia";

export type CamposFormulario = {
  categoria: Categoria | null;
  titulo: string;
  descricao: string;
  cep: string;
  referencia: string;
};

export type ErrosFormulario = Partial<Record<keyof CamposFormulario, string>>;

export const ROTULOS: Record<keyof CamposFormulario, string> = {
  categoria: "Categoria",
  titulo: "Título",
  descricao: "Descrição",
  cep: "CEP",
  referencia: "Ponto de referência",
};

export function validarFormulario(campos: CamposFormulario): ErrosFormulario {
  const erros: ErrosFormulario = {};
  const titulo = campos.titulo.trim();
  const descricao = campos.descricao.trim();

  if (!campos.categoria) erros.categoria = "Escolha uma categoria.";
  if (titulo.length < LIMITES.tituloMin) erros.titulo = `Use pelo menos ${LIMITES.tituloMin} caracteres.`;
  if (titulo.length > LIMITES.tituloMax) erros.titulo = `Use no máximo ${LIMITES.tituloMax} caracteres.`;
  if (descricao.length < LIMITES.descricaoMin) erros.descricao = `Use pelo menos ${LIMITES.descricaoMin} caracteres.`;
  if (descricao.length > LIMITES.descricaoMax) erros.descricao = `Use no máximo ${LIMITES.descricaoMax} caracteres.`;
  if (apenasDigitos(campos.cep).length !== 8) erros.cep = "Informe os 8 números do CEP.";
  if (campos.referencia.length > LIMITES.referenciaMax) erros.referencia = `Use no máximo ${LIMITES.referenciaMax} caracteres.`;

  return erros;
}
