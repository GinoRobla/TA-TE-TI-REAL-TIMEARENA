import jwt
import requests
from app.config import Config
from app.models.user import User


def verify_google_token(token):
    """
    Envía el token a Google y Google responde con los datos del usuario.
    Es como hacer un fetch a la API de Google para verificar que el token es real.
    Si el token es trucho, Google devuelve un error.
    """
    response = requests.get("https://oauth2.googleapis.com/tokeninfo",params={"id_token": token})

    if response.status_code != 200:
        return None

    data = response.json()

    return data  # contiene: email, name, picture, etc.


def find_or_create_user(google_data):
    """
    Busca el usuario por email. Si no existe, lo crea.
    Así el primer login = registro automático.
    """
    user = User.objects(email=google_data["email"]).first()  # busca el usuario por email en la DB usando MongoEngine

    if not user:
        user = User(
            email=google_data["email"],
            name=google_data.get("name", ""),
            avatar=google_data.get("picture", ""),
        )
        user.save()  # como user.save() en Mongoose

    return user


def generate_jwt(user):
    """
    Genera un token JWT propio de nuestra app.
    Adentro guarda el id y email del usuario.
    El frontend lo va a mandar en cada request para identificarse.
    """
    payload = {
        "id": str(user.id),
        "email": user.email,
    }

    # jwt.encode firma el payload con nuestro secreto
    # Es como en Node: jwt.sign(payload, process.env.JWT_SECRET)
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

    return token
