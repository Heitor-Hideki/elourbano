import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

LOG_DIR = Path(__file__).resolve().parents[2] / "logs"
LOG_FILE = LOG_DIR / "app.log"

_logger = logging.getLogger("elourbano")


def configure_logging() -> None:
    if _logger.handlers:
        return
    LOG_DIR.mkdir(exist_ok=True)
    handler = RotatingFileHandler(LOG_FILE, maxBytes=1_000_000, backupCount=5, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S"))
    _logger.addHandler(handler)
    _logger.setLevel(logging.INFO)


def log_action(action: str, result: str, **context) -> None:
    """Registra `data hora | AÇÃO | RESULTADO | k=v`. Nunca passe dados pessoais ou segredos em context."""
    extras = " ".join(f"{key}={value}" for key, value in context.items())
    line = f"{action} | {result}" + (f" | {extras}" if extras else "")
    _logger.info(line)


def log_exception(action: str, error: Exception) -> None:
    _logger.error(f"{action} | ERRO | tipo={type(error).__name__}", exc_info=error)
