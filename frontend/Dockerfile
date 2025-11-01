# ==============================
# FRONTEND – Mode développement
# ==============================

FROM node:20

# Dossier de travail
WORKDIR /app

# Copie uniquement les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances (avec compatibilité React 19)
RUN npm install --legacy-peer-deps

# Copie le reste du code source
COPY . .

# Expose le port Vite
EXPOSE 5173

# Démarre le serveur Vite en mode dev
CMD ["npm", "run", "dev", "--", "--host"]
