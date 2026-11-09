"use client";

import { useState } from "react";
import { useTokenAdmin } from "@/lib/sessaoAdmin";
import { FilaGestao } from "./FilaGestao";
import { LoginGestao } from "./LoginGestao";

export default function GestaoPage() {
  const token = useTokenAdmin();
  const [motivoSaida, setMotivoSaida] = useState<string | null>(null);

  if (!token) return <LoginGestao aviso={motivoSaida} />;
  return <FilaGestao token={token} onSessaoExpirada={() => setMotivoSaida("Sessão expirada (401). Informe o token de novo.")} />;
}
