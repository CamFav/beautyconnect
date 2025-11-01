# ==========================================
# Étape 1 : Build des dépendances
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copie uniquement les fichiers de dépendances
COPY package*.json ./

# Définition du contexte d’environnement
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Installation :
# - En mode test : toutes les dépendances (incl. Jest)
# - En prod : uniquement les dépendances nécessaires à l’exécution
RUN if [ "$NODE_ENV" = "test" ]; then \
      echo "Installing all dependencies for tests..." && npm ci; \
    else \
      echo "Installing production dependencies only..." && npm ci --only=production; \
    fi

# Copie du code source
COPY . .

# ==========================================
# Étape 2 : Image de production
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Copie uniquement les éléments nécessaires depuis l’étape build
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

# Expose le port d’écoute
EXPOSE 8080

# Commande de démarrage
CMD ["node", "server.js"]
