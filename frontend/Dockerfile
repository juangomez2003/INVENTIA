# ── Etapa 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copia todo (incluye el .env con las credenciales)
COPY . .

# Forzar URL relativa para que nginx haga el proxy al backend
ENV VITE_API_URL=/api/v1

RUN npm run build

# ── Etapa 2: Servir con nginx ──────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
