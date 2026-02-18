# ── Etapa única: construir y correr el backend ──────────────────────────────

# FROM: define la imagen base que vamos a usar.
# python:3.11-slim es Python 3.11 en una imagen "slim" (liviana, sin extras).
# Es como decir "partí desde una computadora que ya tiene Python instalado".
FROM python:3.11-slim

# WORKDIR: define el directorio de trabajo dentro del contenedor.
# Todos los comandos siguientes se ejecutan desde /app.
# Equivale a hacer `mkdir /app && cd /app`.
WORKDIR /app

# COPY: copia archivos del host (tu PC) al contenedor.
# Copiamos SOLO requirements.txt primero, antes del código.
# Motivo: Docker cachea cada paso. Si el código cambia pero requirements.txt no,
# Docker reutiliza la capa de instalación de dependencias → builds mucho más rápidos.
COPY requirements.txt .

# RUN: ejecuta un comando durante la construcción de la imagen.
# pip install --no-cache-dir: instala las dependencias sin guardar cache de pip
# (ahorra espacio en la imagen final).
RUN pip install --no-cache-dir -r requirements.txt

# Ahora sí copiamos todo el código fuente.
# El "." de la izquierda es el contexto de build (carpeta backend/).
# El "." de la derecha es el WORKDIR actual (/app).
COPY . .

# EXPOSE: documenta en qué puerto escucha la app.
# NO abre el puerto por sí solo, eso lo hace docker-compose con "ports:".
# Es solo una convención para que otros desarrolladores sepan qué puerto usar.
EXPOSE 5000

# CMD: comando que se ejecuta cuando el contenedor arranca.
# Solo puede haber un CMD por Dockerfile (el último pisa los anteriores).
# Aquí levantamos el servidor Flask con eventlet.
CMD ["python", "run.py"]