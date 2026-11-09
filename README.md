# EloUrbano: zeladoria colaborativa

Protótipo CitizenTech (Global Solution, Coding for Security, FIAP). Qualquer cidadão relata um problema em espaço público, de forma **anônima**, sem cadastro. A comunidade **apoia** os relatos para subir a prioridade e acompanha a resposta da prefeitura pelo **protocolo**. A prefeitura tria a fila ordenada por score.

ODS: **3** (saúde e bem-estar), **4** (educação de qualidade, com calçadas e iluminação no entorno de escolas) e **9** (infraestrutura e inovação).

| Camada | Tecnologia |
|---|---|
| API | Python 3.10+, Flask 3, pymongo (sem ORM), requests |
| Banco | MongoDB 7 (Docker Compose) |
| Fonte externa | [ViaCEP](https://viacep.com.br) (endereço oficial a partir do CEP) |
| Módulo LLM | Google Gemini (free tier) via REST: sugere a urgência (1–5) |
| Front-end | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 (tokens do design em `src/app/globals.css`, classes compartilhadas em `src/lib/estilos.ts`) |

## Estrutura

```
backend/   API Flask (app.py, config.py, src/, tests/, seed.py)
frontend/  Next.js (src/app = telas, src/components, src/lib)
docker-compose.yml   MongoDB
TODO.md    funcionalidades do design deixadas para depois
```

## Como executar do zero

Pré-requisitos: Docker + Docker Compose, Python 3.10+, Node.js 20+.

### 1. Variáveis de ambiente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local   # opcional: o padrão já aponta para http://localhost:5000
```

Edite `backend/.env`:
- `MONGO_ROOT_PASSWORD`: uma senha forte.
- `ADMIN_TOKEN`: gere com `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`. É ele que a prefeitura digita na tela Gestão.
- `GEMINI_API_KEY` (opcional): chave gratuita em https://aistudio.google.com/apikey. Sem ela, a prioridade usa só as regras locais.

### Atalho: tudo com um comando

Depois de seguir os passos abaixo uma vez (venv e `npm install` feitos), basta:

```bash
./start.sh   # sobe banco, API e front; Ctrl+C encerra
```

### 2. Banco de dados

```bash
docker compose --env-file backend/.env up -d
```

O MongoDB fica acessível apenas em `127.0.0.1:27017`.

### 3. API

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py        # opcional: 8 ocorrências fictícias para demonstração
python app.py         # http://127.0.0.1:5000
```

Testes: `pytest` (43 testes; não precisam do Mongo nem da internet, pois usam repositório em memória e respostas simuladas do ViaCEP/Gemini).

### 4. Front-end

```bash
cd frontend
npm install
npm run dev           # http://localhost:3000
```

## Endpoints

| Método | Rota | Acesso | Sucesso | Erros principais |
|---|---|---|---|---|
| GET | `/api/health` | público | 200 | 503 (banco fora) |
| GET | `/api/ocorrencias?status=a,b&categoria=x&bairro=&page=&limit=` | público | 200 | 400 |
| GET | `/api/ocorrencias/<protocolo>` | público | 200 | 400, 404 |
| POST | `/api/ocorrencias` | público, 5/min | 201 + `Location` | 400, 415, 422 (CEP inexistente), 429, 503 (ViaCEP fora) |
| POST | `/api/ocorrencias/<protocolo>/apoios` | público, 20/min | 200 | 404, 409 (resolvida/cancelada), 429 |
| PUT | `/api/ocorrencias/<protocolo>` | `X-Admin-Token` | 200 | 400, 401, 404, 409 (transição inválida) |
| DELETE | `/api/ocorrencias/<protocolo>` | `X-Admin-Token` | 204 | 401, 404 |
| GET | `/api/cep/<cep>` | público | 200 | 400, 404, 503 |
| GET | `/api/admin/sessao` | `X-Admin-Token` | 200 | 401 |

Exemplos:

```bash
curl -i -X POST http://127.0.0.1:5000/api/ocorrencias -H 'Content-Type: application/json' \
  -d '{"categoria":"buraco","titulo":"Buraco na faixa","descricao":"Buraco grande depois do semáforo","cep":"01310-100"}'

curl -i -X PUT http://127.0.0.1:5000/api/ocorrencias/ZEL-2026-000001 \
  -H "X-Admin-Token: $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"em_analise","observacao":"Vistoria agendada"}'
```

Fluxo de status: `aberta → em_analise → em_andamento → resolvida`; qualquer status não final pode ir para `cancelada`.

## Priorização

`score = peso da categoria (10–40) + apoios × 3 (até 30) + dias em aberto (até 15) + urgência da IA × 3 (até 15)`, limitado a 100. Faixas: baixa 0–34, média 35–59, alta 60–79, crítica 80–100. A prefeitura pode fixar o nível manualmente, e o ajuste fica registrado no histórico.

## Segurança e privacidade (resumo)

- **Credenciais** só em `.env` (fora do git); o `config.py` falha ao subir se faltar alguma variável obrigatória ou se o token for curto.
- **Consultas parametrizadas no Mongo**: filtros montados apenas com valores validados por whitelist. Payloads como `{"$ne": null}` são rejeitados com 400. Defesa em profundidade com validador `$jsonSchema` na coleção.
- **Validação de toda entrada**: tipos, tamanhos, enums, regex de CEP e protocolo, campos extras proibidos, corpo limitado a 16 KB.
- **Erros genéricos**: o cliente nunca recebe stack trace; detalhes só em `backend/logs/app.log`.
- **Log em arquivo**: `data hora | AÇÃO | RESULTADO | contexto`, sem dados pessoais nem tokens (rotação a cada 1 MB).
- **LGPD / coleta mínima**: não há nome, e-mail, CPF, telefone, GPS ou IP armazenados. O `_id` interno não é exposto.
- **Admin**: token comparado em tempo constante (`hmac.compare_digest`); no navegador fica só em `sessionStorage`.
- **Abuso**: rate limit (Flask-Limiter), CORS restrito à origem do front, headers de segurança na API e CSP no Next.
- **LLM**: o relato vai delimitado como dado, com instrução de sistema fixa e saída JSON validada (1–5, máx. 200 caracteres). Se falhar, a ocorrência é registrada mesmo assim.

## Créditos

- O uso de ferramentas de IA generativa no desenvolvimento está declarado no relatório da entrega.
- Dados de exemplo (`seed.py`) são fictícios; os CEPs são logradouros públicos de São Paulo.
