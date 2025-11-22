# 💅 **BeautyConnect**

[![CI Tests (Docker)](https://github.com/CamFav/beautyconnect/actions/workflows/ci-docker.yml/badge.svg?branch=dev)](https://github.com/CamFav/beautyconnect/actions/workflows/ci-docker.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Uploads-blue?logo=cloudinary)](https://cloudinary.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **BeautyConnect** est une plateforme complète de mise en relation entre **clients** et **professionnels de la beauté**.  
> Elle permet la découverte de prestataires, la gestion de services, la réservation de créneaux, la publication de posts illustrés, et les interactions sociales (likes, favoris, abonnements).

---

## 🎯 Objectif

L’objectif de BeautyConnect est de fournir une solution clé en main pour les acteurs du secteur beauté :

- Simplifier la mise en relation entre clients et pros.
- Offrir une vitrine visuelle (posts, galeries).
- Gérer les rendez-vous et disponibilités.
- Centraliser le suivi des interactions clients-pros.

---

## 🚀 Stack Technique

### **Backend**

- Node.js · Express
- Mongoose (ODM MongoDB)
- JWT · Helmet · CORS · xss-clean · express-rate-limit
- Multer · Cloudinary (upload images)

### **Frontend**

- React 19 · Vite 7
- Tailwind CSS
- react-router-dom
- react-hot-toast
- PWA (vite-plugin-pwa)

### **Tests**

- Backend : Jest + Supertest
- Frontend : Vitest + Testing Library

### **Base de Données**

- MongoDB (local, Docker ou Atlas)

### **Conteneurs**

- Docker & docker-compose
- Nginx pour le front en production

---

## ✨ Fonctionnalités

| Domaine                        | Description                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| **Authentification / Comptes** | JWT (inscription, connexion, profil, avatars, RGPD, suppression, upgrade client → pro)  |
| **Professionnels**             | CRUD services, disponibilité hebdo, affichage créneaux, dashboard pro                   |
| **Réservations**               | Création, listing, mise à jour du statut (client/pro)                                   |
| **Social**                     | Posts avec images (Cloudinary), description, catégories, likes/favoris, follow/unfollow |
| **Sécurité**                   | CORS, Helmet + CSP, XSS-clean, validation input, rate limiting, upload filtré           |
| **Observabilité**              | Logs HTTP (morgan), health check `/api/health`                                          |
| **Performances**               | Cache, compression, limites d’upload                                                    |
| **PWA**                        | Frontend installable (manifest + service worker)                                        |

---

## 🧱 Structure du Projet

```bash
beautyconnect/
├── backend/
│   ├── app.js                # App Express (middlewares, sécurité, routes)
│   ├── server.js             # Boot serveur
│   ├── routes/
│   ├── models/               # User, Post, Reservation, ProDetails
│   ├── seed/
│   │   ├── seed.js           # Script de peuplement (pros, clients, posts, réservations)
│   │   └── images.json       # Catalogue d’images Cloudinary
│   ├── config/db.js          # Connexion MongoDB
│   ├── middleware/auth.js    # Middleware JWT protect
│   ├── utils/jwt.js          # Génération / validation JWT
│
├── frontend/
│   ├── src/
│   ├── vite.config.js        # Config PWA, build, alias
│   ├── index.html
│
├── docker-compose.yml        # Dev
└── docker-compose.prod.yml   # Prod (Nginx + Node + Mongo)
```

---

## 🛠 Installation Locale

### Prérequis

- **Node.js 18+**
- **MongoDB** (local ou Atlas)
- **Compte Cloudinary** (pour les images)
- **Frontend et Backend** dans un même dossier `beautyconnect/`

### Étapes d’installation

#### Backend

```bash
cd backend
npm install
npm run dev
```

Créer un fichier `.env` dans `backend/` :

```bash
NODE_ENV=development
PORT=5000
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Créer un fichier `.env.development` dans `frontend/` :

```bash
VITE_API_URL=http://localhost:5000/api
```

**Accès par défaut :**

- Frontend → http://localhost:5173
- API → http://localhost:5000/api
- Health Check → http://localhost:5000/api/health

---

## 🐳 Exécution avec Docker

### Mode Développement

```bash
docker compose up --build
```

- Frontend → [http://localhost:5173](http://localhost:5173)
- Backend API → [http://localhost:5000/api](http://localhost:5000/api)
- MongoDB → mongodb://localhost:27017/beautyconnect

Les conteneurs incluent le **hot-reload** pour le front et le back.

### Mode Production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

- Front (Nginx) : port 80
- Backend (Node) : port 8080
- MongoDB : base persistante avec volume et authentification

---

## 🧪 Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm run test
```

Les tests utilisent Jest (backend) et Vitest (frontend).  
L’environnement de test MongoDB est simulé via `mongodb-memory-server` si disponible.

---

## 🔌 API – Aperçu Rapide

| Domaine      | Méthode  | Endpoint                                                    |
| ------------ | -------- | ----------------------------------------------------------- |
| Auth         | POST     | `/api/auth/register`, `/api/auth/login`                     |
| Compte       | GET      | `/api/account/profile`                                      |
| Pros         | GET      | `/api/pro/services`, `/api/pro/availability`                |
| Réservations | GET      | `/api/reservations/client/:id`, `/api/reservations/pro/:id` |
| Posts        | GET/POST | `/api/posts`                                                |
| Santé        | GET      | `/api/health`                                               |

---

## 🛡️ Sécurité

- **Helmet** : CSP, headers de sécurité
- **CORS** : multi-origines configurables via `CORS_ORIGINS`
- **xss-clean** + validation des entrées utilisateur
- **Rate limiting** sur endpoints sensibles
- **Upload sécurisé** : fichiers ≤ 5 Mo, formats jpg/jpeg/png/webp
- **JWT** : durée limitée, vérification stricte
- **Logs** : enregistrés en console (dev) ou fichier (prod)

---

## 🧭 Déploiement

### Render

1. Configurer les variables d’environnement dans le service Render.
2. Déployer automatiquement ou manuellement via “Manual Deploy”.
3. Le backend se connecte à MongoDB Atlas et Cloudinary via `.env`.

### Docker Compose (Production)

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

- Front (Nginx) sur le port 80
- Backend sur le port 8080
- MongoDB persistant avec volume dédié

---

## 📜 Licence & Contribution

**Licence :** MIT  
**Année :** 2025

### Contribution

Les contributions sont les bienvenues :

```bash
git checkout -b feature/ma-feature
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/ma-feature
```

Puis ouvrir une Pull Request sur GitHub.

---

© 2025 — **BeautyConnect** · Camille Favriel
