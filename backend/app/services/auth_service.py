import requests
from flask_jwt_extended import create_access_token
from app.repositories import user_repository


def verify_google_token(token):
    """
    Envía el token a Google y Google responde con los datos del usuario.
    Si el token es trucho, Google devuelve un error.
    """
    response = requests.get("https://oauth2.googleapis.com/tokeninfo", params={"id_token": token})

    if response.status_code != 200:
        return None

    return response.json()  # contiene: email, name, picture, etc.


def find_or_create_user(google_data):
    """
    Busca el usuario por email. Si no existe, lo crea.
    Así el primer login = registro automático.
    """
    user = user_repository.find_by_email(google_data["email"])

    if not user:
        user = user_repository.create(
            email=google_data["email"],
            name=google_data.get("name", ""),
            avatar=google_data.get("picture", ""),
        )

    return user


def generate_jwt(user):
    """
    Genera un token JWT propio de nuestra app usando Flask-JWT-Extended.
    El identity (str(user.id)) queda guardado en el claim "sub" del token.
    El frontend lo va a mandar en cada request para identificarse.
    """
    return create_access_token(identity=str(user.id))
