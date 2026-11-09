def _criar(client, payload):
    resposta = client.post("/api/ocorrencias", json=payload)
    assert resposta.status_code == 201
    return resposta.get_json()["protocolo"]


def test_criar_retorna_201_location_e_prioridade(client, payload_valido):
    resposta = client.post("/api/ocorrencias", json=payload_valido)
    corpo = resposta.get_json()
    assert resposta.status_code == 201
    assert resposta.headers["Location"].endswith(corpo["protocolo"])
    assert corpo["endereco"]["bairro"] == "Pinheiros"
    assert corpo["prioridade"]["nivel"] in {"baixa", "media", "alta", "critica"}
    assert "_id" not in corpo


def test_criar_sem_json_retorna_415(client):
    assert client.post("/api/ocorrencias", data="x", content_type="text/plain").status_code == 415


def test_criar_com_injecao_nosql_retorna_400(client, payload_valido):
    payload_valido["categoria"] = {"$ne": None}
    resposta = client.post("/api/ocorrencias", json=payload_valido)
    assert resposta.status_code == 400
    assert "categoria" in resposta.get_json()["campos"]


def test_criar_com_cep_inexistente_retorna_422(client, payload_valido):
    payload_valido["cep"] = "00000000"
    assert client.post("/api/ocorrencias", json=payload_valido).status_code == 422


def test_criar_com_viacep_fora_retorna_503(client, payload_valido):
    payload_valido["cep"] = "99999999"
    assert client.post("/api/ocorrencias", json=payload_valido).status_code == 503


def test_listar_e_obter(client, payload_valido):
    protocolo = _criar(client, payload_valido)
    lista = client.get("/api/ocorrencias?categoria=buraco,lixo&status=aberta,em_analise").get_json()
    assert lista["total"] == 1
    assert client.get("/api/ocorrencias?status=resolvida").get_json()["total"] == 0
    assert client.get(f"/api/ocorrencias/{protocolo}").status_code == 200
    assert client.get("/api/ocorrencias/ZEL-2026-999999").status_code == 404
    assert client.get("/api/ocorrencias/abc").status_code == 400


def test_apoio_incrementa_e_bloqueia_em_status_final(client, payload_valido, admin_headers):
    protocolo = _criar(client, payload_valido)
    assert client.post(f"/api/ocorrencias/{protocolo}/apoios").get_json()["apoios"] == 1

    client.put(f"/api/ocorrencias/{protocolo}", json={"status": "cancelada"}, headers=admin_headers)
    assert client.post(f"/api/ocorrencias/{protocolo}/apoios").status_code == 409


def test_put_exige_token(client, payload_valido):
    protocolo = _criar(client, payload_valido)
    url = f"/api/ocorrencias/{protocolo}"
    assert client.put(url, json={"status": "em_analise"}).status_code == 401
    assert client.put(url, json={"status": "em_analise"}, headers={"X-Admin-Token": "errado"}).status_code == 401


def test_put_aplica_transicao_e_registra_historico(client, payload_valido, admin_headers):
    protocolo = _criar(client, payload_valido)
    resposta = client.put(f"/api/ocorrencias/{protocolo}", headers=admin_headers,
                          json={"status": "em_analise", "observacao": "Vistoria agendada."})
    corpo = resposta.get_json()
    assert resposta.status_code == 200
    assert corpo["status"] == "em_analise"
    assert corpo["historico"][-1]["observacao"] == "Vistoria agendada."


def test_put_transicao_invalida_retorna_409(client, payload_valido, admin_headers):
    protocolo = _criar(client, payload_valido)
    resposta = client.put(f"/api/ocorrencias/{protocolo}", json={"status": "resolvida"}, headers=admin_headers)
    assert resposta.status_code == 409


def test_delete_remove_e_depois_404(client, payload_valido, admin_headers):
    protocolo = _criar(client, payload_valido)
    assert client.delete(f"/api/ocorrencias/{protocolo}").status_code == 401
    assert client.delete(f"/api/ocorrencias/{protocolo}", headers=admin_headers).status_code == 204
    assert client.get(f"/api/ocorrencias/{protocolo}").status_code == 404
    assert client.delete(f"/api/ocorrencias/{protocolo}", headers=admin_headers).status_code == 404


def test_consulta_cep(client):
    assert client.get("/api/cep/05422010").status_code == 200
    assert client.get("/api/cep/123").status_code == 400
    assert client.get("/api/cep/00000000").status_code == 404


def test_sessao_admin(client, admin_headers):
    assert client.get("/api/admin/sessao").status_code == 401
    assert client.get("/api/admin/sessao", headers=admin_headers).status_code == 200


def test_rota_inexistente_tem_erro_generico_e_headers_de_seguranca(client):
    resposta = client.get("/api/nao-existe")
    assert resposta.status_code == 404
    assert resposta.get_json() == {"erro": "Recurso não encontrado."}
    assert resposta.headers["X-Content-Type-Options"] == "nosniff"
