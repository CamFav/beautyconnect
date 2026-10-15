# ==========================================
# ÉTAPE 1 : Build des dépendances
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copie uniquement les fichiers de dépendances
COPY package*.json ./

# Définition du contexte d’environnement
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Installation :
# - En mode test : toutes les dépendances (incl. Jest)
# - En prod : uniquement les dépendances nécessaires à l’exécution
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev; \
    else \
      npm ci --include=dev; \
    fi

# Copie du code source complet (pour disposer de tous les dossiers dans le build)
COPY . .

# ==========================================
# ÉTAPE 2 : Image de production
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
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/controllers ./controllers
COPY --from=build /app/package*.json ./

# Variables d’environnement
ENV NODE_ENV=development
ENV PORT=5000

# Expose le port d’écoute
EXPOSE 5000

# Commande de démarrage
CMD ["node", "server.js"]
