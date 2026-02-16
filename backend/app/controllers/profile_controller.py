from flask import Blueprint, jsonify, g
from app.middlewares.auth_middleware import token_required
from app.services.profile_service import get_user_stats

profile_bp = Blueprint("profile", __name__)


# GET /profile/stats
@profile_bp.route("/stats")
@token_required                          # ← protege la ruta: solo usuarios con JWT válido
def get_stats():
    user_id = g.user_id                  # ← viene del middleware (lo guardó en g)
    stats = get_user_stats(user_id)      # ← llama al service

    if not stats:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(stats), 200
