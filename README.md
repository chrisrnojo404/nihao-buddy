# nihao buddy

nihao buddy is a Next.js App Router MVP for beginner Mandarin learners. The
project combines translation, pinyin generation, vocabulary saving, flashcard
review, writing practice, and lightweight progress tracking.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style reusable components
- Prisma ORM
- PostgreSQL
- bcryptjs
- jsonwebtoken
- zod
- hanzi-writer
- pinyin-pro

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and update the values:

```bash
cp .env.example .env
```

3. Start PostgreSQL with Docker:

```bash
docker compose up -d
```

4. Generate the Prisma client:

```bash
npx prisma generate
```

5. Push the schema or run the initial migration:

Quick setup:

```bash
npx prisma db push
```

Or if you want a migration file too:

```bash
npx prisma migrate dev --name init
```

6. Start the development server:

```bash
npm run dev
```

7. Open `http://localhost:3000`.

## Database migrations

- Start the database:

```bash
docker compose up -d
```

- Stop the database:

```bash
docker compose down
```

- Create a new migration after schema changes:

```bash
npx prisma migrate dev --name describe_your_change
```

- Refresh the client after schema-only edits:

```bash
npx prisma generate
```

## Testing instructions

- Run linting:

```bash
npm run lint
```

- Run a production build check:

```bash
npm run build
```

- Manual smoke test:
  - Visit `/`, `/register`, `/login`, `/dashboard`, `/translate`, `/vocabulary`, `/writing`, and `/flashcards`.
  - Confirm `POST /api/translate` returns Chinese text and pinyin for supported beginner phrases.
  - After database setup, verify register/login and authenticated vocabulary/progress routes.

## Demo accounts

After the database schema is available, create demo accounts with:

```bash
npm run db:seed
```

Recommended full local setup:

```bash
docker compose up -d
npx prisma db push
npm run db:seed
npm run dev
```

Demo login credentials:

- `alicia@nihaobuddy.demo` / `DemoPass123!`
- `ravi@nihaobuddy.demo` / `DemoPass123!`

## Current Phase 1 scope

- App shell and responsive page scaffolding
- Prisma schema for `User`, `Vocabulary`, and `Progress`
- JWT and password helper foundation
- zod validation modules
- Mock translation dictionary with automatic pinyin generation
- Hanzi Writer preview integration
- API route scaffolding for auth, translation, vocabulary, and progress

## Future improvements

- Add real client-side forms for registration, login, and translation
- Add browser `SpeechSynthesis` playback for Mandarin phrases
- Introduce optimistic UI updates for vocabulary management
- Add spaced repetition scheduling for flashcards
- Add unit and integration tests for API routes and translation utilities
- Support sentence-level translations via an external translation provider
