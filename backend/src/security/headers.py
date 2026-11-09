from flask import Flask, Response

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Cache-Control": "no-store",
}


def register_security_headers(app: Flask) -> None:
    @app.after_request
    def aplicar_headers(response: Response) -> Response:
        for header, valor in SECURITY_HEADERS.items():
            response.headers.setdefault(header, valor)
        response.headers.pop("Server", None)
        return response
