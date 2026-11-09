"""Diagnóstico da integração com o Gemini, em etapas, para isolar onde está o problema.

Uso (em backend/, com o venv ativo):
  python diagnostico_gemini.py                    # roda as 3 etapas com o modelo do .env
  python diagnostico_gemini.py gemini-3.5-flash   # testa outro modelo
"""
import os
import sys
import time

import requests
from dotenv import load_dotenv

from src.integrations.gemini_client import GEMINI_URL, GeminiClient

LISTAR_URL = "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200"
TIMEOUT_RAPIDO = (10, 30)
TIMEOUT_COMPLETO = (10, 90)


def chamar(descricao: str, metodo: str, url: str, chave: str, timeout, corpo: dict | None = None):
    print(f"\n== {descricao}")
    inicio = time.monotonic()
    try:
        resposta = requests.request(metodo, url, json=corpo, timeout=timeout,
                                    headers={"x-goog-api-key": chave, "Content-Type": "application/json"})
    except requests.RequestException as erro:
        print(f"   FALHOU após {time.monotonic() - inicio:.1f} s: {type(erro).__name__}")
        return None
    print(f"   HTTP {resposta.status_code} em {time.monotonic() - inicio:.1f} s")
    try:
        dados = resposta.json()
    except ValueError:
        print("   Corpo não é JSON:", resposta.text[:300])
        return None
    if not resposta.ok:
        print("   Erro:", dados.get("error"))
        return None
    return dados


def main() -> None:
    load_dotenv()
    chave = os.getenv("GEMINI_API_KEY", "").strip()
    modelo = sys.argv[1] if len(sys.argv) > 1 else os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
    if not chave:
        raise SystemExit("GEMINI_API_KEY não definida no .env.")
    print(f"Modelo em teste: {modelo}")

    modelos = chamar("1. Listar modelos (rede + chave)", "GET", LISTAR_URL, chave, TIMEOUT_RAPIDO)
    if modelos:
        nomes = [m["name"].removeprefix("models/") for m in modelos.get("models", [])
                 if "generateContent" in m.get("supportedGenerationMethods", []) and "flash" in m["name"]]
        print("   Modelos *flash* com generateContent:", ", ".join(nomes) or "nenhum")
        if modelo not in nomes:
            print(f"   ATENÇÃO: '{modelo}' não aparece na lista desta chave.")

    url = GEMINI_URL.format(model=modelo)
    simples = {"contents": [{"role": "user", "parts": [{"text": "Responda apenas: ok"}]}]}
    dados = chamar("2. Pedido mínimo (sem thinkingConfig/schema)", "POST", url, chave, TIMEOUT_RAPIDO, simples)
    if dados:
        print("   Resposta:", dados["candidates"][0]["content"]["parts"][0]["text"].strip()[:100])

    completo = GeminiClient._montar_corpo(
        "buraco", "Buraco profundo na faixa", "Buraco com cerca de 1 metro logo depois do semáforo.")
    dados = chamar("3. Pedido completo (igual ao da API)", "POST", url, chave, TIMEOUT_COMPLETO, completo)
    if dados:
        print("   Uso de tokens:", dados.get("usageMetadata"))
        print("   Resposta:", dados["candidates"][0]["content"]["parts"][0]["text"])


if __name__ == "__main__":
    main()
