import eventlet
# Monkey-patch: hace que las librerías estándar de Python
# funcionen de forma async (como necesita Socket.IO).
# En Node no necesitás esto porque Node ya es async por naturaleza.
eventlet.monkey_patch()

from app import create_app

# Crear la aplicación
# En Node sería: const app = createApp()
app = create_app()

if __name__ == "__main__":
    # Levantar el servidor en el puerto 5000
    # En Node sería: app.listen(5000, () => console.log('Server running on port 5000'))
    print("Servidor corriendo en http://localhost:5000")
    eventlet.wsgi.server(eventlet.listen(("0.0.0.0", 5000)), app)
