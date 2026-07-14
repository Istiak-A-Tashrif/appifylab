# Docker setup

The Compose project has separate `prod` and `dev` application profiles. PostgreSQL is shared by both profiles and persists in the `appify_postgres` volume.

## One-command setup

```bash
chmod +x setup.sh
./setup.sh prod
```

The script validates Docker, creates a root `.env` with random database/JWT/CSRF secrets when values are missing, builds the selected profile, and starts the stack.

For hot-reload development containers:

```bash
./setup.sh dev
```

## Direct Compose commands

```bash
# Production multi-stage images
docker compose --profile prod up --build -d

# Development targets with source mounts and hot reload
docker compose --profile dev up --build -d

# Stop a profile
docker compose --profile prod down
```

Production uses non-root runtime users, a standalone Next.js image, backend migration deployment on startup, health-gated dependencies, and restart policies. Development mounts source directories while keeping container-managed `node_modules` volumes.

Before public deployment, replace the Cloudinary defaults in `.env`, restrict the unsigned preset to images of at most 5 MB and the `appify-feed` folder, and set public HTTPS frontend/API origins.
