from app.models.match import Match


def find_by_id(match_id):
    return Match.objects(id=match_id).first()


def find_finished_by_player(user):
    return Match.objects(
        status="finished",
        __raw__={"$or": [{"player_x": user.id}, {"player_o": user.id}]}
    )


def create(player_x, player_o, current_turn):
    match = Match(
        player_x=player_x,
        player_o=player_o,
        status="in_progress",
        current_turn=current_turn,
    )
    match.save()
    return match


def save(match):
    match.save()
    return match
