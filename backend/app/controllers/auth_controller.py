from flask import Blueprint, request, jsonify
from app.services.auth_service import verify_google_token, find_or_create_user, generate_jwt

auth_bp = Blueprint("auth", __name__)


# POST /auth/google
@auth_bp.route("/google", methods=["POST"])
def google_login():
    # 1. Obtener el token que mandó el frontend
    body = request.get_json()
    google_token = body.get("token")

    if not google_token:
        return jsonify({"error": "Token requerido"}), 400

    # 2. Validar el token con Google
    google_data = verify_google_token(google_token)

    if not google_data:
        return jsonify({"error": "Token de Google inválido"}), 401

    # 3. Buscar o crear el usuario en nuestra DB
    user = find_or_create_user(google_data)

    # 4. Generar nuestro JWT y devolverlo
    token = generate_jwt(user)

    return jsonify({
        "token": token,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar,
        }
    }), 200
