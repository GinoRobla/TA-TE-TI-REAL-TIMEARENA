import jwt
from functools import wraps
from flask import request, jsonify, g
from app.config import Config


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # 1. Leer el header "Authorization: Bearer eyJhbG..."
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token requerido"}), 401

        token = auth_header.split(" ")[1]

        # 2. Decodificar el JWT
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401

        # 3. Guardar el id del usuario para que la ruta lo use
        g.user_id = payload["id"]
        g.user_email = payload["email"]

        # 4. Continuar a la ruta
        return f(*args, **kwargs)

    return decorated