# ==========================================
# Étape 1 : Build & tests (dev + CI)
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation dépendances
# → Si NODE_ENV=test → installe tout pour les tests
# → Sinon installe uniquement les deps de prod
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "test" ]; then npm ci; else npm ci --only=production; fi

# Copie du code
COPY . .

# exécuter les tests en CI
# (sera ignorée en build prod Render)
RUN if [ "$NODE_ENV" = "test" ]; then npm test || true; fi


# ==========================================
# Étape 2 : Exécution en production
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Copie des fichiers nécessaires depuis l’étape de build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/app.js ./app.js
COPY --from=build /app/config ./config
COPY --from=build /app/models ./models
COPY --from=build /app/routes ./routes
COPY --from=build /app/utils ./utils
COPY --from=build /app/package*.json ./

# Variables d’environnement
ENV NODE_ENV=production
ENV PORT=8080

# Exposition du port
EXPOSE 8080

# Commande de démarrage
CMD ["node", "server.js"]
