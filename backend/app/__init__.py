from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import socketio
from mongoengine import connect
from app.config import Config


sio = socketio.Server(
    async_mode="eventlet",
    cors_allowed_origins="*"
)


def create_app():
    
    flask_app = Flask(__name__)

    # Habilitar CORS
    CORS(flask_app)

    # Configurar JWT
    flask_app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET
    JWTManager(flask_app)

    # Conectar a MongoDB
    connect(host=Config.MONGO_URI)

    # Registrar los blueprints (rutas)
    from app.controllers.auth_controller import auth_bp
    from app.controllers.profile_controller import profile_bp
    flask_app.register_blueprint(auth_bp, url_prefix="/auth")
    flask_app.register_blueprint(profile_bp, url_prefix="/profile")

    # Registrar los eventos de Socket.IO
    from app.sockets.game_socket import register_socket_events
    register_socket_events(sio)

    # Envolver la app Flask con Socket.IO
    wsgi_app = socketio.WSGIApp(sio, flask_app)

    return wsgi_app