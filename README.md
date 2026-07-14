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

## Architecture

The application is split into three services:

- The **Next.js frontend** renders the supplied Login, Registration, and Feed designs. It communicates with the API through a same-origin Next.js rewrite so authentication cookies are handled consistently.
- The **NestJS API** owns authentication, authorization, validation, and feed business rules. Every feed endpoint requires a valid access token.
- **PostgreSQL** stores users, posts, comments, replies, and likes. Prisma manages the schema and migrations.

Cloudinary stores uploaded images. Images are uploaded directly from the browser, while the API validates the returned URL and stores only its secure URL. This keeps large files away from the application server.

## Implemented functionality

### Authentication and authorization

- Register with first name, last name, email, and password
- Log in, log out, restore an existing session, and automatically rotate expired access sessions
- Redirect unauthenticated visitors away from the feed
- Prevent authenticated visitors from returning to the login and registration pages
- Enforce private-post authorization in the API for feed reads, comments, replies, likes, and liker lists

### Feed and interactions

- Create text posts with an optional image
- Choose public or private visibility when creating a post
- Show public posts to all authenticated users and private posts only to their author
- Display posts newest first with cursor-based infinite scrolling
- Like and unlike posts, comments, and replies
- Display the current user's like state and paginated lists of liker names
- Create comments and one-level replies
- Load additional comments and replies without returning an unbounded interaction tree

## Data model

The main entities are `User`, `Post`, `Comment`, `PostLike`, and `CommentLike`. A reply is represented by a `Comment` with a `parentId`, which allows comments and replies to share validation and like behavior. Replies are restricted to one level by the service layer.

Post and comment likes use compound primary keys such as `(userId, postId)`. This prevents duplicate likes at the database level. Cascading foreign keys remove dependent posts, comments, replies, and likes when their parent record is deleted.

## Key decisions

I used Next.js components while retaining the supplied styles and assets so the implementation stays close to the requested design. NestJS keeps authentication and feed behavior in separate modules, while Prisma provides an explicit relational model and migrations.

Authentication uses short-lived JWT access tokens and rotating refresh tokens in `HttpOnly` cookies. Passwords are hashed with bcrypt, only a SHA-256 hash of the active refresh token is stored, and state-changing requests require a signed CSRF token. The API also applies validation, rate limiting, restricted CORS, Helmet headers, and authorization checks. Private-post access is enforced by the backend for both reads and interactions, rather than relying on the UI.

Posts, comments, replies, and liker lists use cursor pagination instead of offset pagination. The main feed includes only bounded previews (three comments, two replies per comment, and three likers), keeping response sizes predictable as activity grows. Compound primary keys prevent duplicate likes, and database indexes support visibility, author, and newest-first queries.

Replies are intentionally limited to one level. This meets the task requirement while avoiding unbounded recursive queries and keeping the conversation UI simple. Images upload directly to Cloudinary to avoid sending large files through the API; the backend accepts URLs only from the configured Cloudinary account and folder.

## Security and performance

- Passwords are hashed with bcrypt using a cost factor of 12.
- Access and refresh tokens are stored in `HttpOnly`, `SameSite=Lax` cookies; production cookies are also marked `Secure`.
- Refresh tokens are rotated, and only a SHA-256 hash of the active token is stored in the database.
- Signed CSRF tokens protect state-changing cookie-authenticated requests.
- DTO validation rejects unknown fields and limits text, password, and name lengths.
- Helmet security headers, a restrictive Content Security Policy, restricted CORS, and login rate limiting reduce common web risks.
- The backend verifies private-post access for both content and interaction endpoints instead of trusting the frontend.
- Feed, comment, reply, and liker endpoints use cursor pagination. Database indexes support visibility and newest-first access patterns.
- Feed responses contain bounded interaction previews rather than every comment, reply, or liker. This keeps query work and payload sizes predictable as data grows.

The design is suitable as a scalable application baseline, but a real million-user deployment would additionally require load testing, observability, caching, connection pooling, background processing, and horizontally scaled application instances.

## API summary

All endpoints are under `/api/v1`.

| Area | Endpoints |
| --- | --- |
| Authentication | Register, login, logout, refresh, current user, session, and CSRF token |
| Feed | List posts and create a post |
| Comments | List and create comments or replies |
| Likes | Toggle likes and list liker identities for posts, comments, and replies |

The exact route definitions are available in `backend/src/auth/auth.controller.ts` and `backend/src/feed/feed.controller.ts`.

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

The backend unit tests cover registration behavior, duplicate accounts, login privacy, refresh-token rotation and replay protection, private-post authorization, newest-first pagination, bounded feed queries, image URL restrictions, and like state. The Playwright test covers registration, protected navigation, post creation, post likes, comments, replies, reply likes, logout, and invalid-session handling.

## Scope and tradeoffs

- Replies are limited to one level.
- Post editing, deletion, sharing, social login, password recovery, notifications, and profile management are outside the requested scope.
- Decorative feed controls retained from the supplied design may be non-functional when they represent out-of-scope features.
- The live environment requires PostgreSQL and a restricted Cloudinary unsigned upload preset.

## Submission links

- GitHub repository: https://github.com/Istiak-A-Tashrif/appifylab
- Video walkthrough: https://youtu.be/MKWk8bbVYuc
- Live application: https://appifylab-1.onrender.com
