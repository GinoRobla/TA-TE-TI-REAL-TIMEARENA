import jwt
from app.config import Config
from app.repositories import user_repository, match_repository
from app.services.game_service import make_move

waiting_player = {"sid": None, "user_id": None}  # cola de espera (1 jugador máximo)


def register_socket_events(sio):

    @sio.event
    def connect(sid, environ, auth):                        # se ejecuta cuando alguien se conecta
        token = auth.get("token") if auth else None         # leer el JWT que mandó el frontend
        if not token:
            return False                                    # sin token → rechazar conexión

        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        except jwt.InvalidTokenError:
            return False                                    # token inválido → rechazar conexión

        sio.save_session(sid, {"user_id": payload["sub"]})   # guardar quién es este sid

    @sio.event
    def find_match(sid):                                     # el usuario quiere jugar
        session = sio.get_session(sid)
        user_id = session["user_id"]
        user = user_repository.find_by_id(user_id)

        if waiting_player["sid"] and waiting_player["sid"] != sid:
            # hay alguien esperando → emparejar
            opponent_sid = waiting_player["sid"]
            opponent = user_repository.find_by_id(waiting_player["user_id"])

            waiting_player["sid"] = None                     # limpiar la cola
            waiting_player["user_id"] = None

            match = match_repository.create(                 # crear partida en la DB
                player_x=user,
                player_o=opponent,
                current_turn=user,
            )

            room = str(match.id)                             # crear sala con el id de la partida
            sio.enter_room(sid, room)
            sio.enter_room(opponent_sid, room)

            # avisar a cada jugador con SU info
            sio.emit("match_found", {
                "match_id": room,
                "board": match.board,
                "your_symbol": "X",
                "opponent": opponent.name,
                "is_your_turn": True,
            }, to=sid)

            sio.emit("match_found", {
                "match_id": room,
                "board": match.board,
                "your_symbol": "O",
                "opponent": user.name,
                "is_your_turn": False,
            }, to=opponent_sid)

        else:
            # no hay nadie → esperar
            waiting_player["sid"] = sid
            waiting_player["user_id"] = user_id
            sio.emit("waiting", {"message": "Esperando oponente..."}, to=sid)

    @sio.event
    def play_move(sid, data):                                # el usuario hace una jugada
        session = sio.get_session(sid)
        user_id = session["user_id"]

        match = match_repository.find_by_id(data["match_id"])
        if not match:
            return

        success, result = make_move(match, user_id, data["position"])

        if not success:
            sio.emit("error", {"message": result}, to=sid)   # jugada inválida
            return

        room = str(match.id)

        if result == "continue":
            sio.emit("move_made", {
                "board": match.board,
                "current_turn": str(match.current_turn.id),
            }, room=room)

        elif result == "win":
            sio.emit("game_over", {
                "board": match.board,
                "result": "win",
                "winner_id": str(match.winner.id),
                "winner_name": match.winner.name,
            }, room=room)

        elif result == "draw":
            sio.emit("game_over", {
                "board": match.board,
                "result": "draw",
            }, room=room)

    @sio.event
    def disconnect(sid):                                     # el usuario se desconectó
        if waiting_player["sid"] == sid:                     # si estaba en cola, sacarlo
            waiting_player["sid"] = None
            waiting_player["user_id"] = None