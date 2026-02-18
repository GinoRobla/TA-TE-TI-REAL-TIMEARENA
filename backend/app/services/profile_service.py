from app.repositories import user_repository, match_repository


def get_user_stats(user_id):
    """
    Busca al usuario por ID y arma el JSON con sus stats e historial.
    Este es el formato que pide la prueba para GET /profile/stats
    """
    user = user_repository.find_by_id(user_id)

    if not user:
        return None

    matches = match_repository.find_finished_by_player(user)

    match_history = []
    for match in matches:
        if match.player_x and str(match.player_x.id) == str(user_id):
            opponent = match.player_o.name if match.player_o else "Desconocido"
        else:
            opponent = match.player_x.name if match.player_x else "Desconocido"

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
