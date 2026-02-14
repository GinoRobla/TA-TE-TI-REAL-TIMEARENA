from flask import Flask
from flask_cors import CORS
import socketio
from mongoengine import connect
from app.config import Config

# =============================================
# Crear instancia de Socket.IO
# En Node sería: const io = require('socket.io')(server)
# async_mode='eventlet' es porque Python no es async por defecto
# como Node, necesita una librería extra (eventlet) para manejar
# muchas conexiones simultáneas.
# cors_allowed_origins="*" permite conexiones desde cualquier origen
# (igual que en Node: io = new Server(server, { cors: { origin: "*" } }))
# =============================================
sio = socketio.Server(
    async_mode="eventlet",
    cors_allowed_origins="*"
)


def create_app():
    """
    Factory function que crea y configura la app Flask.

    En Node sería algo como:

    function createApp() {
        const app = express();
        app.use(cors());
        app.use(express.json());
        // registrar rutas...
        return app;
    }
    """
    # Crear la app Flask (como const app = express())
    app = Flask(__name__)

    # Habilitar CORS (como app.use(cors()))
    CORS(app)

    # Conectar a MongoDB
    # En Node con mongoose sería: mongoose.connect(process.env.MONGO_URI)
    connect(host=Config.MONGO_URI)

    # Registrar los blueprints (rutas)
    # En Node sería: app.use('/auth', authRouter)
    from app.controllers.auth_controller import auth_bp
    from app.controllers.profile_controller import profile_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profile_bp, url_prefix="/profile")

    # Registrar los eventos de Socket.IO
    from app.sockets.game_socket import register_socket_events
    register_socket_events(sio)

    # Envolver la app Flask con Socket.IO
    # Esto es como en Node cuando hacés:
    # const server = http.createServer(app)
    # const io = new Server(server)
    app = socketio.WSGIApp(sio, app)

    return app
