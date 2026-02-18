from mongoengine import Document, StringField, IntField


# Document = "esta clase es una colección de MongoDB"
# Es como en Mongoose: const User = mongoose.model('User', schema)
class User(Document):
    email = StringField(required=True, unique=True)  # obligatorio + no se puede repetir
    name = StringField(required=True)                 # obligatorio
    avatar = StringField(default="")                  # opcional, por defecto string vacío
    wins = IntField(default=0)                        # partidas ganadas, arranca en 0
    losses = IntField(default=0)                      # partidas perdidas, arranca en 0
    draws = IntField(default=0)                       # empates, arranca en 0

    meta = {"collection": "users"}                    # nombre de la colección en MongoDB
