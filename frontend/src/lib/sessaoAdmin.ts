"use client";

import { useSyncExternalStore } from "react";

// sessionStorage: o token some ao fechar a aba (requisito do design). Nunca usar localStorage aqui.
const CHAVE = "elourbano.adminToken";
const ouvintes = new Set<() => void>();

function lerToken(): string | null {
  try {
    return window.sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function notificar() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function salvarToken(token: string) {
  try {
    window.sessionStorage.setItem(CHAVE, token);
  } finally {
    notificar();
  }
}

export function encerrarSessao() {
  try {
    window.sessionStorage.removeItem(CHAVE);
  } finally {
    notificar();
  }
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function useTokenAdmin() {
  return useSyncExternalStore(assinar, lerToken, () => null);
}
