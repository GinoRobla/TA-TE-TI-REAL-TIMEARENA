# Ta-Te-Ti Real-Time Arena

Juego de Ta-Te-Ti (Tic-Tac-Toe) multijugador en tiempo real con autenticacion Google, chat en partida y estadisticas de jugador.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19, Vite, Material UI, Zustand, Axios, Socket.IO Client |
| Backend | Python 3.11, Flask, Flask-JWT-Extended, Python-SocketIO, Eventlet |
| Base de datos | MongoDB 7 con MongoEngine (ODM) |
| Infraestructura | Docker, docker-compose, nginx |

## Estructura del Proyecto

```
ta-te-ti-arena/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py
│   └── app/
│       ├── __init__.py          # App factory + Socket.IO server
│       ├── config.py
│       ├── controllers/         # Rutas HTTP (auth, profile)
│       ├── services/            # Logica de negocio
│       ├── repositories/        # Acceso a datos (MongoDB)
│       ├── models/              # Modelos MongoEngine (User, Match)
│       ├── sockets/             # Eventos Socket.IO (juego en tiempo real)
│       └── utils/
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf               # Configuracion SPA para React Router
    └── src/
        ├── api/axios.js         # Interceptor JWT
        ├── stores/              # Zustand (authStore, gameStore)
        ├── pages/               # LoginPage, DashboardPage, GamePage
        └── components/          # ErrorModal reutilizable
```

## Arquitectura Backend

Se aplica separacion de responsabilidades en 3 capas:

- **Controllers**: reciben las requests HTTP, delegan al service y devuelven la response.
- **Services**: contienen la logica de negocio (validar token Google, calcular stats, logica del juego).
- **Repositories**: acceden a MongoDB a traves de MongoEngine. Son la unica capa que habla con la DB.

## Como Levantar el Proyecto

### Opcion 1: Con Docker (recomendado)

1. Crear un archivo `.env` en la raiz del proyecto:

```env
JWT_SECRET=tu_clave_secreta
GOOGLE_CLIENT_ID=tu_google_client_id
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
```

2. Levantar todo:

```bash
docker compose up --build
```

3. Abrir `http://localhost` en el navegador.

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |
| MongoDB | localhost:27017 |

### Opcion 2: Sin Docker (desarrollo local)

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # en Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Requiere MongoDB corriendo localmente en `localhost:27017`.

## API Endpoints

### `POST /auth/google`

Recibe el token de Google, valida con Google, crea o busca el usuario, y devuelve un JWT propio.

**Request:**
```json
{
  "token": "google_id_token"
}
```

**Response (200):**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "mongodb_object_id",
    "name": "Nombre",
    "email": "email@gmail.com",
    "avatar": "https://..."
  }
}
```

### `GET /profile/stats`

Devuelve las estadisticas e historial del usuario autenticado.

**Headers:** `Authorization: Bearer <jwt_token>`

**Response (200):**
```json
{
  "id": "mongodb_object_id",
  "username": "Nombre",
  "email": "email@gmail.com",
  "avatar": "https://...",
  "wins": 12,
  "losses": 5,
  "draws": 2,
  "match_history": [
    {
      "opponent": "Jugador2",
      "result": "WIN"
    },
    {
      "opponent": "Jugador3",
      "result": "LOSS"
    }
  ]
}
```

## Eventos Socket.IO

La conexion WebSocket se autentica enviando el JWT en `auth.token`. El backend valida el token antes de aceptar la conexion.

### Cliente -> Servidor

| Evento | Data | Descripcion |
|--------|------|-------------|
| `find_match` | - | Buscar partida |
| `play_move` | `{ match_id, position }` | Hacer una jugada (posicion 0-8) |
| `chat_message` | `{ match_id, text }` | Enviar mensaje en el chat |
| `leave_game` | - | Salir de la partida voluntariamente |

### Servidor -> Cliente

| Evento | Data | Descripcion |
|--------|------|-------------|
| `waiting` | - | Esperando oponente |
| `match_found` | `{ match_id, board, your_symbol, opponent, is_your_turn }` | Partida encontrada |
| `move_made` | `{ board, current_turn }` | Se realizo una jugada |
| `game_over` | `{ board, result, winner_id, winner_name }` | Partida finalizada |
| `chat_message` | `{ sender, text }` | Mensaje de chat recibido |
| `opponent_left` | - | El oponente abandono la partida |
| `error` | `{ message }` | Error |

## Modelos de Datos (MongoDB)

### User

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| email | String (unico) | Email de Google |
| name | String | Nombre de Google |
| avatar | String | URL del avatar de Google |
| wins | Int | Partidas ganadas |
| losses | Int | Partidas perdidas |
| draws | Int | Partidas empatadas |

### Match

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| player_x | Ref(User) | Jugador X |
| player_o | Ref(User) | Jugador O |
| board | List[String] | Estado del tablero (9 posiciones) |
| current_turn | Ref(User) | De quien es el turno |
| status | String | `waiting` / `in_progress` / `finished` |
| winner | Ref(User) | Ganador (null si empate) |
| result | String | `win` / `draw` / `""` |

## Puntos Bonus Implementados

- **Chat en partida**: los jugadores pueden chatear en tiempo real durante la partida usando Socket.IO.
- **Docker**: docker-compose listo para levantar frontend (nginx), backend (Flask) y base de datos (MongoDB) con un solo comando.

## Decisiones Tecnicas

- **Flask sobre FastAPI**: elegido por su simplicidad y buena integracion con python-socketio usando eventlet como servidor WSGI.
- **MongoEngine (ODM)**: permite definir modelos con validaciones y trabajar con objetos Python en vez de diccionarios crudos.
- **Zustand**: maneja la sesion del usuario (authStore) y todo el estado del juego incluyendo la conexion Socket.IO (gameStore), evitando prop drilling.
- **Axios interceptors**: inyecta automaticamente el JWT en cada request HTTP al backend.
- **nginx multi-stage build**: el frontend se compila con Node y se sirve con nginx (~23MB de imagen final). La configuracion `try_files` permite que React Router maneje las rutas.
