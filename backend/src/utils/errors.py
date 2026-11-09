class AppError(Exception):
    status_code = 500
    public_message = "Erro interno. Tente novamente mais tarde."

    def __init__(self, public_message: str | None = None, details: dict | None = None):
        super().__init__(public_message or self.public_message)
        if public_message:
            self.public_message = public_message
        self.details = details or {}


class ValidationError(AppError):
    status_code = 400
    public_message = "Dados inválidos."


class UnauthorizedError(AppError):
    status_code = 401
    public_message = "Credencial ausente ou inválida."


class UnsupportedMediaTypeError(AppError):
    status_code = 415
    public_message = "Envie o corpo como application/json."


class NotFoundError(AppError):
    status_code = 404
    public_message = "Recurso não encontrado."


class ConflictError(AppError):
    status_code = 409
    public_message = "A operação conflita com o estado atual do recurso."


class UnprocessableError(AppError):
    status_code = 422
    public_message = "Não foi possível processar os dados enviados."


class ExternalServiceError(AppError):
    status_code = 503
    public_message = "Serviço externo indisponível. Tente novamente em instantes."


class DatabaseUnavailableError(AppError):
    status_code = 503
    public_message = "Banco de dados indisponível."
