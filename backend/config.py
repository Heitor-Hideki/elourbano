import os
from dataclasses import dataclass
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


def _required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Variável de ambiente obrigatória ausente: {name}")
    return value


def _optional(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


@dataclass(frozen=True)
class Settings:
    mongo_uri: str
    mongo_db_name: str
    admin_token: str
    gemini_api_key: str
    gemini_model: str
    cors_origin: str
    api_port: int


def load_settings() -> Settings:
    user = quote_plus(_required("MONGO_ROOT_USER"))
    password = quote_plus(_required("MONGO_ROOT_PASSWORD"))
    host = _optional("MONGO_HOST", "127.0.0.1")
    port = _optional("MONGO_PORT", "27017")
    admin_token = _required("ADMIN_TOKEN")
    if len(admin_token) < 24:
        raise RuntimeError("ADMIN_TOKEN deve ter pelo menos 24 caracteres")

    return Settings(
        mongo_uri=f"mongodb://{user}:{password}@{host}:{port}/?authSource=admin",
        mongo_db_name=_optional("MONGO_DB_NAME", "elourbano"),
        admin_token=admin_token,
        gemini_api_key=_optional("GEMINI_API_KEY"),
        gemini_model=_optional("GEMINI_MODEL", "gemini-3.8-flash"),
        cors_origin=_optional("CORS_ORIGIN", "http://localhost:3000"),
        api_port=int(_optional("API_PORT", "5000")),
    )
