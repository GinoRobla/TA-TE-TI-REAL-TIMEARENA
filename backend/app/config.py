import os
from dotenv import load_dotenv

# Carga las variables del archivo .env al entorno
# En Node sería: require('dotenv').config()
load_dotenv()


class Config:
    """
    Clase de configuración que lee las variables de entorno.
    En Node esto sería un objeto exportado desde config.js:
    module.exports = { MONGO_URI: process.env.MONGO_URI, ... }
    """
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET = os.getenv("JWT_SECRET", "default_secret_cambiar_en_produccion")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
