from mongoengine import Document, ReferenceField, StringField, ListField
from app.models.user import User


class Match(Document):
    player_x = ReferenceField(User, required=True)          # quién juega con X (guarda su ID)
    player_o = ReferenceField(User)                          # quién juega con O (null hasta que aparezca)
    status = StringField(default="waiting")                  # "waiting" → "in_progress" → "finished"
    board = ListField(StringField(), default=lambda: [""] * 9)  # 9 casillas, vacías al inicio
    current_turn = ReferenceField(User)                      # de quién es el turno (ID del User)
    winner = ReferenceField(User)                            # quién ganó (null si empate o no terminó)
    result = StringField(default="")                         # "win", "draw", o "" (no terminó)

    meta = {"collection": "matches"}                         # nombre de la colección en MongoDB
