# Appify Community Feed

A full-stack implementation of the supplied Appifylab selection task. The frontend uses Next.js App Router while the API uses NestJS, Prisma, and PostgreSQL. The visual assets are from the supplied HTML/CSS package.

## Features

- Registration and login with bcrypt password hashing, 15-minute access tokens, and rotating 7-day refresh tokens in HTTP-only cookies
- Protected feed with newest posts first and cursor-based “Load more” pagination
- Text/image posts with public or author-only visibility
- Comments, one-level replies, and like/unlike on every content type
- Liker names exposed by clicking or hovering over like counts
- Input validation, client-side upload type/size checks, Helmet headers, CORS restrictions, and rate limiting
- Compound database keys prevent duplicate likes; feed and relationship indexes support high read volume

## Run locally

Requirements: Node.js 20+, npm, and Docker.

```bash
docker compose up -d
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cd backend && npm install && npx prisma migrate dev --name init && npm run start:dev
```

In another terminal:

```bash
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173`. The API runs at `http://localhost:3000/api`.

## Architecture decisions

The NestJS/Prisma bootstrapping pattern was reused from the adjacent `PosClient` project, but all POS, tenant, billing, inventory, printing, AI, and administration code was excluded. Authentication lives in signed HTTP-only cookies so browser JavaScript cannot read credentials. Refresh tokens rotate atomically, only their SHA-256 hashes are stored, and logout revokes the active refresh session. Private-post authorization is enforced in API queries and mutations, not merely hidden in the frontend.

Comments use a self-relation for replies and intentionally allow one reply level, matching the scope of the task while avoiding unbounded recursive reads. Likes use separate join tables for clear foreign keys and efficient liker queries. Images upload directly to Cloudinary using the configured unsigned upload preset, and only the resulting HTTPS URL is stored by the API.

The browser rejects unsupported image types and files larger than 5 MB. Configure equivalent format, size, and destination restrictions on the unsigned Cloudinary preset before production deployment; browser validation alone is not a security boundary.

## Verification

```bash
cd backend && npx prisma generate && npm run build
cd frontend && npm run build
```

Run the backend unit tests with `cd backend && npm test`. They cover feed visibility/order queries, cursor pagination, liker state, private-post authorization, reply-depth validation, and like toggling.

Both production builds and all tests pass. Before deployment, set long random and distinct `JWT_SECRET` and `JWT_REFRESH_SECRET` values, use TLS, configure the production frontend origin and Cloudinary preset restrictions, and run `npx prisma migrate deploy`.

## Submission links

- GitHub repository: add after publishing this local repository
- Video walkthrough: add after uploading the recording to YouTube
- Live application: optional; add after deployment
