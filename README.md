# The Comeback Club

**Give what you can. Get what you need.**

A Detroit-first skills exchange built for ChatGPT Sites. Members trade skills directly or form three-person Comeback Circles. Everyone explicitly agrees before work starts, and completed hours count only after every participant confirms.

## Start here

- [Demo walkthrough](DEMO.md)
- [Development and Sites deployment](DEPLOYMENT.md)
- [Implementation, verification, and limitations](IMPLEMENTATION.md)
- [Original Sites starter documentation](STARTER.md)

## Stack

React 19, TypeScript, the official Sites Vinext starter, server endpoints, Sites-managed D1, Drizzle schema/migrations, and pnpm. No external database service. No browser-local production database. No payment system.

## Key files

- `app/club.tsx`: responsive application and interactive forms
- `app/api/club/route.ts`: validated and authorized server API
- `lib/model.ts`: shared types and specific task taxonomy
- `lib/matching.ts`: deterministic reciprocal matching
- `lib/seed.ts`: per-session fictional community
- `lib/ai.ts`: rule provider and optional server-side OpenAI provider
- `db/schema.ts` and `drizzle/`: relational schema and immutable migrations
- `tests/`: matching unit tests and D1-backed HTTP integration tests
- `.openai/hosting.json`: real Sites project identity and managed DB declaration

## Commands

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```

Apply local migrations using DEPLOYMENT.md, then run `pnpm run dev`. With the preview running, execute `node tests/integration.mjs`.

The demo seeds 15 fictional neighbors, 15 offers, 16 needs, 4 direct matches, and 2 circles. Each browser gets a separate durable demo session. The member community uses Sites sign-in and remains separate.

Live AI is **not connected**. The app labels rule-based suggestions and drafts honestly. A separately authorized server API key and model can enable the optional skill-understanding provider later; the app never borrows Codex credentials or assumes subscription inference.
