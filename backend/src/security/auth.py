import hmac
from functools import wraps

from flask import current_app, request

from src.utils.errors import UnauthorizedError
from src.utils.logger import log_action

ADMIN_HEADER = "X-Admin-Token"


def require_admin(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        recebido = request.headers.get(ADMIN_HEADER, "")
        esperado = current_app.config["ADMIN_TOKEN"]
        # compare_digest evita que o tempo de resposta revele quantos caracteres do token estão corretos.
        if not recebido or not hmac.compare_digest(recebido.encode(), esperado.encode()):
            log_action("AUTENTICAR_ADMIN", "NEGADO", rota=request.endpoint)
            raise UnauthorizedError()
        return view(*args, **kwargs)

    return wrapper
