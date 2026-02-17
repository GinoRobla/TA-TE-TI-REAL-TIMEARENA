from app.repositories import user_repository, match_repository


# Las 8 combinaciones ganadoras del ta-te-ti
# Cada una es una lista de 3 posiciones del tablero que forman línea
WINNING_COMBOS = [
    [0, 1, 2],  # fila arriba
    [3, 4, 5],  # fila medio
    [6, 7, 8],  # fila abajo
    [0, 3, 6],  # columna izquierda
    [1, 4, 7],  # columna centro
    [2, 5, 8],  # columna derecha
    [0, 4, 8],  # diagonal \
    [2, 4, 6],  # diagonal /
]


def check_winner(board):
    """
    Revisa el tablero y devuelve:
    - "X" si ganó X
    - "O" si ganó O
    - "draw" si el tablero está lleno y nadie ganó
    - None si la partida sigue
    """
    for combo in WINNING_COMBOS:
        a, b, c = combo
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]  # "X" o "O"

    # Si no hay casillas vacías, es empate
    if "" not in board:
        return "draw"

    return None


def make_move(match, user_id, position):
    """
    Intenta hacer una jugada. Devuelve (exito, mensaje).
    Valida que sea tu turno y que la casilla esté libre.
    """
    # Validar que sea el turno del usuario
    if str(match.current_turn.id) != str(user_id):
        return False, "No es tu turno"

    # Validar que la posición sea válida (0-8)
    if position < 0 or position > 8:
        return False, "Posición inválida"

    # Validar que la casilla esté libre
    if match.board[position] != "":
        return False, "Casilla ocupada"

    # Determinar si el usuario juega con X o O
    symbol = "X" if str(match.player_x.id) == str(user_id) else "O"

    # Hacer la jugada
    match.board[position] = symbol

    # Verificar si hay ganador
    result = check_winner(match.board)

    if result == "X" or result == "O":
        # Alguien ganó
        winner = match.player_x if result == "X" else match.player_o
        loser = match.player_o if result == "X" else match.player_x

        match.winner = winner
        match.result = "win"
        match.status = "finished"
        match_repository.save(match)

        # Actualizar stats
        winner.wins += 1
        user_repository.save(winner)
        loser.losses += 1
        user_repository.save(loser)

        return True, "win"

    elif result == "draw":
        # Empate
        match.result = "draw"
        match.status = "finished"
        match_repository.save(match)

        # Actualizar stats de ambos
        match.player_x.draws += 1
        user_repository.save(match.player_x)
        match.player_o.draws += 1
        user_repository.save(match.player_o)

        return True, "draw"

    else:
        # La partida sigue - cambiar turno
        if str(match.current_turn.id) == str(match.player_x.id):
            match.current_turn = match.player_o
        else:
            match.current_turn = match.player_x
        match_repository.save(match)

        return True, "continue"
