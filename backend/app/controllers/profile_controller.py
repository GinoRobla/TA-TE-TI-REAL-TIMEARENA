from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.profile_service import get_user_stats

profile_bp = Blueprint("profile", __name__)


# GET /profile/stats
@profile_bp.route("/stats")
@jwt_required()                              # ← protege la ruta: solo usuarios con JWT válido
def get_stats():
    user_id = get_jwt_identity()             # ← lee el "sub" del JWT (el id del usuario)
    stats = get_user_stats(user_id)          # ← llama al service

    if not stats:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(stats), 200
