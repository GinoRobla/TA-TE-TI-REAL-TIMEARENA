# ── Build multi-etapa del frontend ───────────────────────────────────────────
#
# "Multi-stage build": usamos DOS imágenes en un solo Dockerfile.
# Etapa 1 (build): Node.js para compilar el proyecto con Vite → genera /dist
# Etapa 2 (serve): nginx liviano para servir los archivos estáticos
#
# Ventaja: la imagen final NO contiene Node.js ni node_modules.
# Solo tiene nginx + los archivos HTML/CSS/JS compilados → imagen mucho más chica.

# ── Etapa 1: build ───────────────────────────────────────────────────────────

# "AS build" le da un nombre a esta etapa para referenciarla después.
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos package.json y lock file PRIMERO (mismo truco de cache que en backend).
# Si el código cambia pero las dependencias no, Docker reutiliza esta capa.
COPY package.json package-lock.json ./

# npm ci: instala exactamente las versiones del lock file.
# Es más estricto y reproducible que npm install (ideal para CI/CD y Docker).
RUN npm ci

# Copiamos el resto del código fuente.
COPY . .

# ARG: variables disponibles SOLO durante el build de la imagen (no en runtime).
# Vite embebe las variables VITE_* en el código JavaScript al compilar.
# Por eso deben estar presentes en el momento del `npm run build`, no después.
ARG VITE_API_URL=http://localhost:5000
ARG VITE_GOOGLE_CLIENT_ID

# ENV: hace que las ARG estén disponibles como variables de entorno para Vite.
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Compilamos el proyecto. Vite genera la carpeta /app/dist con HTML, CSS y JS.
RUN npm run build

# ── Etapa 2: serve ───────────────────────────────────────────────────────────

# nginx:alpine: servidor web ultra liviano (imagen de ~23MB).
FROM nginx:alpine

# Copiamos los archivos compilados desde la etapa "build" a la carpeta de nginx.
# "--from=build" hace referencia al nombre que le pusimos a la etapa anterior.
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración personalizada de nginx (soporte para React Router).
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# nginx arranca automáticamente (está definido como CMD en la imagen base).
