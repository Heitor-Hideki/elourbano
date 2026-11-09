from flask import Flask
from flask_cors import CORS

from config import Settings, load_settings
from src.db.connection import init_db
from src.error_handlers import register_error_handlers
from src.extensions import limiter
from src.integrations.gemini_client import GeminiClient
from src.routes.admin import admin_bp
from src.routes.cep import cep_bp
from src.routes.health import health_bp
from src.routes.ocorrencias import ocorrencias_bp
from src.security.headers import register_security_headers
from src.services.ocorrencia_service import OcorrenciaService
from src.utils.errors import DatabaseUnavailableError
from src.utils.logger import configure_logging, log_action

MAX_CORPO_BYTES = 16 * 1024


def create_app(settings: Settings | None = None, conectar_banco: bool = True) -> Flask:
    settings = settings or load_settings()
    configure_logging()

    app = Flask(__name__)
    app.config.update(
        ADMIN_TOKEN=settings.admin_token,
        MAX_CONTENT_LENGTH=MAX_CORPO_BYTES,
    )
    app.json.sort_keys = False

    CORS(app, resources={r"/api/*": {"origins": [settings.cors_origin]}},
         allow_headers=["Content-Type", "X-Admin-Token"], methods=["GET", "POST", "PUT", "DELETE"])
    limiter.init_app(app)
    register_security_headers(app)
    register_error_handlers(app)

    gemini = GeminiClient(settings.gemini_api_key, settings.gemini_model)
    app.extensions["ocorrencia_service"] = OcorrenciaService(gemini)

    for blueprint in (health_bp, ocorrencias_bp, cep_bp, admin_bp):
        app.register_blueprint(blueprint)

    if conectar_banco:
        _conectar_banco(settings)
    log_action("INICIAR_API", "SUCESSO", ia="habilitada" if gemini.habilitado else "desabilitada")
    return app


def _conectar_banco(settings: Settings) -> None:
    try:
        init_db(settings.mongo_uri, settings.mongo_db_name)
        log_action("CONECTAR_BANCO", "SUCESSO")
    except DatabaseUnavailableError:
        # A API sobe mesmo assim: /api/health responde 503 e as rotas retornam erro genérico até o banco voltar.
        log_action("CONECTAR_BANCO", "FALHA")


if __name__ == "__main__":
    configuracao = load_settings()
    create_app(configuracao).run(host="127.0.0.1", port=configuracao.api_port, debug=False)
