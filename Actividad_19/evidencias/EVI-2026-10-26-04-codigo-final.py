
from flask import Flask, request, make_response
import html

app = Flask(__name__)

@app.route("/")
def inicio():
    nombre = request.args.get("nombre", "Invitado")

    # Escapar el contenido recibido del usuario
    nombre_seguro = html.escape(nombre)

    contenido = f"""
    <html>
        <head>
            <title>Actividad 19 - XSS Corregido</title>
        </head>
        <body>
            <h1>Bienvenido</h1>
            <p>Hola, {nombre_seguro}</p>
        </body>
    </html>
    """

    respuesta = make_response(contenido)

    # Cabeceras de seguridad
    respuesta.headers["Content-Security-Policy"] = "default-src 'self'"
    respuesta.headers["X-Content-Type-Options"] = "nosniff"

    return respuesta


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)

