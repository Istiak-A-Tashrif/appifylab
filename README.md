# Appify Community Feed

This project is a full-stack implementation of the Appifylab selection task. I converted the supplied Login, Registration, and Feed templates into a responsive Next.js application and connected them to a NestJS API backed by PostgreSQL.

## What I built

- Registration, login, logout, automatic session refresh, and protected feed routes
- A newest-first feed with cursor-based infinite scrolling
- Text and image posts with public or author-only visibility
- Like/unlike for posts, comments, and replies, including paginated lists of who liked each item
- Comments and one-level threaded replies
- Responsive and dark-mode-compatible screens based on the provided HTML/CSS design
- Unit tests for authentication and feed rules, plus a Playwright end-to-end user journey
- Docker development and production environments with health checks and persistent PostgreSQL storage

## Technology

- **Frontend:** Next.js 16, React 19, and TypeScript
- **Backend:** NestJS 11, Prisma, and TypeScript
- **Database:** PostgreSQL 17
- **Images:** Direct browser uploads to Cloudinary; the API stores the resulting secure URL
- **Testing:** Vitest and Playwright

## Key decisions

I used Next.js components while retaining the supplied styles and assets so the implementation stays close to the requested design. NestJS keeps authentication and feed behavior in separate modules, while Prisma provides an explicit relational model and migrations.

Authentication uses short-lived JWT access tokens and rotating refresh tokens in `HttpOnly` cookies. Passwords are hashed with bcrypt, only a SHA-256 hash of the active refresh token is stored, and state-changing requests require a signed CSRF token. The API also applies validation, rate limiting, restricted CORS, Helmet headers, and authorization checks. Private-post access is enforced by the backend for both reads and interactions, rather than relying on the UI.

Posts, comments, replies, and liker lists use cursor pagination instead of offset pagination. The main feed includes only bounded previews (three comments, two replies per comment, and three likers), keeping response sizes predictable as activity grows. Compound primary keys prevent duplicate likes, and database indexes support visibility, author, and newest-first queries.

Replies are intentionally limited to one level. This meets the task requirement while avoiding unbounded recursive queries and keeping the conversation UI simple. Images upload directly to Cloudinary to avoid sending large files through the API; the backend accepts URLs only from the configured Cloudinary account and folder.

## Run locally

Requirements: Docker, Docker Compose v2, and OpenSSL.

```bash
chmod +x setup.sh
./setup.sh prod
```

Open `http://localhost:5173`. The API is available at `http://localhost:3000/api/v1`.

For hot-reload development containers, run `./setup.sh dev`; the frontend and API will use ports `5174` and `3001`. See [DOCKER.md](./DOCKER.md) for direct Compose commands and deployment notes.

## Verification

```bash
cd backend && npm test
cd frontend && npm run test:e2e
```

Before a public deployment, configure production frontend/API origins and a restricted Cloudinary unsigned preset (images only, maximum 5 MB, and the `appify-feed` folder). The setup script generates local database, JWT, and CSRF secrets automatically.

## Submission links

- GitHub repository: _add repository URL_
- Video walkthrough: _add YouTube URL_
- Live application: _add deployment URL, if available_
