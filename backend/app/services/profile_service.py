from app.models.user import User
from app.models.match import Match


def get_user_stats(user_id):
    """
    Busca al usuario por ID y arma el JSON con sus stats e historial.
    Este es el formato que pide la prueba para GET /profile/stats
    """
    user = User.objects(id=user_id).first()

    if not user:
        return None

    # Buscar partidas terminadas donde el usuario participó
    matches = Match.objects(
        status="finished",
        __raw__={
            "$or": [
                {"player_x": user.id},
                {"player_o": user.id}
            ]
        }
    )

    # Armar el historial
    match_history = []
    for match in matches:
        # Determinar quién es el oponente
        if match.player_x and str(match.player_x.id) == str(user_id):
            opponent = match.player_o.name if match.player_o else "Desconocido"
        else:
            opponent = match.player_x.name if match.player_x else "Desconocido"

        # Determinar el resultado desde la perspectiva del usuario
        if match.result == "draw":
            result = "DRAW"
        elif match.winner and str(match.winner.id) == str(user_id):
            result = "WIN"
        else:
            result = "LOSS"

        match_history.append({
            "opponent": opponent,
            "result": result,
        })

    return {
        "id": str(user.id),
        "username": user.name,
        "email": user.email,
        "avatar": user.avatar,
        "wins": user.wins,
        "losses": user.losses,
        "draws": user.draws,
        "match_history": match_history,
    }