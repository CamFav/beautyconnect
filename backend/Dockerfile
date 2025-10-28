FROM node:20-alpine

WORKDIR /app

# Copie et installation des dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copie du code
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
