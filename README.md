# BeautyConnect

BeautyConnect is a full-stack marketplace that connects beauty clients with independent professionals. It supports accounts, professional profiles and services, availability, bookings, a social feed, likes, favourites and follows.

## Stack

- Frontend: React 19, Vite and Tailwind CSS
- API: Node.js, Express and JWT
- Data: MongoDB with Mongoose (the only supported database)
- Media: Cloudinary for optional image uploads
- Quality: Jest/Supertest and Vitest
- Containers: Docker Compose

## Repository layout

```text
backend/       Express API, Mongoose models, tests and local demo seed
frontend/      React/Vite application
docs/screenshots/  Reserved for real portfolio screenshots
docker-compose.yml Development environment
docker-compose.prod.yml Production-oriented configuration
```

## Development with Docker

Docker Desktop must be running. From the repository root:

```bash
docker compose up -d --build
docker compose ps
```

- Application: http://localhost:5173
- API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health
- MongoDB: `mongodb://localhost:27017/beautyconnect`

The frontend and backend source directories are mounted for hot reload. Their dependencies live in named Docker volumes, so the bind mounts do not hide `node_modules`. Stop services without deleting data with:

```bash
docker compose down
```

`mongo_data` is persistent and is intentionally never removed by project commands.

## Development without Docker

1. Copy `backend/.env.example` to `backend/.env` and adapt it for a local MongoDB instance.
2. Copy `frontend/.env.example` to `frontend/.env` if the default API URL must change.
3. Install and start each application:

```bash
cd backend
npm ci
npm run dev

cd ../frontend
npm ci
npm run dev
```

Cloudinary credentials are optional for browsing the app and using seeded content. Upload endpoints require `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`; no production credentials are committed.

## Demo data

With Docker services running, seed only the local database:

```bash
docker compose exec backend npm run seed
```

The seed rejects production mode, Atlas and every non-local MongoDB hostname. It replaces only `@demo.local` data, which makes it safe to run repeatedly on the local demo database; it never drops a database.

Demo credentials:

- Professional: `camille.bernard@demo.local` / `Password123!`
- Client: `lucas.petit@demo.local` / `Password123!`

The seed creates additional clients and professionals, services, weekly availability, posts and bookings.
Its original demo images are versioned under `backend/seed/assets/` and served locally in development at `http://localhost:5000/demo-assets/`; no third-party image URL is required.

## Tests and build

```bash
cd backend
npm test

cd ../frontend
npm run test
npm run build
```

Backend tests use `mongodb-memory-server` where required. If its MongoDB binary cannot be downloaded in a restricted network, run the test suite in an environment that permits it.

## Production configuration

`docker-compose.prod.yml` deliberately requires these values from the shell or a deployment secret store: `MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`, `JWT_SECRET` and `CORS_ORIGINS`.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

It contains no default production password and does not expose MongoDB to the host. Do not use the demo seed in production.

## API overview

| Area | Base route |
| --- | --- |
| Authentication | `/api/auth` |
| Accounts | `/api/account` |
| Professionals | `/api/pro` |
| Bookings | `/api/reservations` |
| Posts | `/api/posts` |
| Users and social actions | `/api/users` |
| Health | `/api/health` |
