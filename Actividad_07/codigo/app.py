import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# CORS restringido a un origen conocido
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"]
    }
})

TOKEN_VALIDO = os.environ.get("API_TOKEN")

if not TOKEN_VALIDO:
    raise RuntimeError("La variable de entorno API_TOKEN no esta configurada")

USUARIOS = [
    {"id": 1, "nombre": "Juan", "rol": "cliente"},
    {"id": 2, "nombre": "Ana", "rol": "administrador"}
]


@app.after_request
def agregar_headers_seguridad(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "mensaje": "API funcionando correctamente"
    })


@app.route("/usuarios", methods=["GET"])
def usuarios():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({
            "error": "Token requerido"
        }), 401

    if token != f"Bearer {TOKEN_VALIDO}":
        return jsonify({
            "error": "Token invalido"
        }), 401

    return jsonify({
        "usuarios": USUARIOS
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)