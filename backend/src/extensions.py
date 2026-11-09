from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Armazenamento em memória basta para o protótipo (um processo). Em produção: Redis via RATELIMIT_STORAGE_URI.
limiter = Limiter(key_func=get_remote_address, default_limits=["120 per minute"], storage_uri="memory://")
