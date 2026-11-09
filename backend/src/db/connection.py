from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import CollectionInvalid, PyMongoError

from src.domain import CATEGORIAS, NIVEIS_PRIORIDADE, STATUS
from src.utils.errors import DatabaseUnavailableError

OCORRENCIAS = "ocorrencias"
CONTADORES = "contadores"

_client: MongoClient | None = None
_database: Database | None = None

OCORRENCIA_SCHEMA = {
    "bsonType": "object",
    "required": ["protocolo", "categoria", "titulo", "descricao", "endereco", "status",
                 "prioridade", "apoios", "historico", "criado_em", "atualizado_em"],
    "properties": {
        "protocolo": {"bsonType": "string", "pattern": "^ZEL-\\d{4}-\\d{6}$"},
        "categoria": {"enum": list(CATEGORIAS)},
        "titulo": {"bsonType": "string", "minLength": 5, "maxLength": 80},
        "descricao": {"bsonType": "string", "minLength": 10, "maxLength": 500},
        "endereco": {
            "bsonType": "object",
            "required": ["cep", "logradouro", "bairro", "cidade", "uf"],
            "properties": {
                "cep": {"bsonType": "string", "pattern": "^\\d{8}$"},
                "uf": {"bsonType": "string", "maxLength": 2},
                "referencia": {"bsonType": ["string", "null"], "maxLength": 120},
            },
        },
        "status": {"enum": list(STATUS)},
        "prioridade": {
            "bsonType": "object",
            "required": ["score", "nivel"],
            "properties": {
                "score": {"bsonType": "int", "minimum": 0, "maximum": 100},
                "nivel": {"enum": list(NIVEIS_PRIORIDADE)},
            },
        },
        "apoios": {"bsonType": "int", "minimum": 0},
        "historico": {"bsonType": "array", "maxItems": 50},
    },
}


def init_db(mongo_uri: str, db_name: str) -> None:
    global _client, _database
    # Timeouts curtos: com o banco fora do ar a API responde 503 rápido em vez de travar a requisição.
    _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000, connectTimeoutMS=3000, appname="elourbano-api", tz_aware=True)
    _database = _client[db_name]
    try:
        _ensure_collection()
        _ensure_indexes()
    except PyMongoError as error:
        raise DatabaseUnavailableError() from error


def _ensure_collection() -> None:
    try:
        _database.create_collection(OCORRENCIAS, validator={"$jsonSchema": OCORRENCIA_SCHEMA})
    except CollectionInvalid:
        _database.command("collMod", OCORRENCIAS, validator={"$jsonSchema": OCORRENCIA_SCHEMA})


def _ensure_indexes() -> None:
    ocorrencias = _database[OCORRENCIAS]
    ocorrencias.create_index("protocolo", unique=True)
    ocorrencias.create_index([("prioridade.score", DESCENDING), ("criado_em", DESCENDING)])
    ocorrencias.create_index([("status", ASCENDING), ("prioridade.score", DESCENDING)])
    ocorrencias.create_index([("categoria", ASCENDING), ("prioridade.score", DESCENDING)])
    ocorrencias.create_index([("endereco.bairro", ASCENDING), ("prioridade.score", DESCENDING)])


def get_collection(name: str) -> Collection:
    if _database is None:
        raise DatabaseUnavailableError()
    return _database[name]


def ping() -> bool:
    try:
        return _client is not None and _client.admin.command("ping").get("ok") == 1
    except PyMongoError:
        return False
