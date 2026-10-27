# ChatGPT Sites deployment

This app uses the supplied Sites Vinext starter: React + TypeScript, a Workers-compatible server, and a Sites-managed D1 binding named `DB`. R2 is unused. No external database or hosting account is required.

The real Site ID is preserved in `.openai/hosting.json`: `appgprj_6ae0d9b42cf8819199c305fc8acae770`. Do not create another Site for this checkout or replace this ID.

The official GitHub origin is `https://github.com/AERIF-Dev/TheCombackClub.git`. Its spelling is intentional. GitHub stores the application source; Sites hosts the application and managed D1. After checks, commit the source and use a normal `git push -u origin main`. Never force-push. Sites publication uses a separate short-lived source credential and does not replace GitHub origin.

## Local development

Requires Node 22.13+ (tested on Node 24), pnpm, Git, and tar. The lockfile records the installed dependencies. Build scripts for esbuild, workerd, sharp, and unrs-resolver are approved in `pnpm-workspace.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm test
pnpm run build
```

In a Sites-enabled agent workflow, use the Sites plugin's `install-dependencies.mjs` and `build-site.mjs` helpers instead of introducing a different hosting workflow.

After the first local build, apply each **pending** migration once, in filename order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_furry_lady_bullseye.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_giant_ben_grimm.sql
pnpm run dev -- --hostname 127.0.0.1
```

Preview is normally `http://127.0.0.1:5173`. Local sign-in uses the official starter's development identity simulator. It is excluded from the production build.

Run HTTP integration checks while that preview is running:

```sh
node tests/integration.mjs
```

`TEST_URL` can select another **test** origin. The suite creates and modifies isolated demo data; don't use it on an unrelated production app. Local D1 is separate from hosted D1.

## Publish / update

1. Keep the exact source manifest and generated Drizzle SQL, snapshots, and journal under source control. Do not modify applied migrations; append new ones.
2. Obtain a source repository write credential for this existing project with the Sites connector. Keep it in memory only.
3. Run the Sites `site-workflow.mjs --project-id appgprj_6ae0d9b42cf8819199c305fc8acae770` helper from this checkout. Send its credential through hidden stdin; never place it in arguments, files, or Git config. Supply remaining checks/builds and an archive path outside the checkout or under ignored `outputs/`.
4. The helper commits/pushes the exact source and packages the built Worker. Pass its verified project ID, commit SHA, and archive to `save_version_and_deploy_private` while the Site remains owner-private. For a deliberately changed audience, inspect access and use the corresponding Sites publish operation.
5. Wait for terminal `succeeded` before reporting a production URL. Sites provisions D1 and applies schema migrations before publishing the Worker. Demo seed data is created transactionally when a visitor enters a fresh demo; it is not part of migrations.

The local manifest's logical `DB` is intentional. Any all-zero database ID in generated local Wrangler configuration is the official starter's preview placeholder, not a hosted database identifier. Sites supplies the actual hosted binding. Do not provision external Cloudflare resources or run `wrangler deploy`.

## Access and secrets

- New Sites are owner-private by default. Publishing does not make this Site public. Change access only when the owner explicitly asks.
- Hosted member identity comes from Sites-verified request headers through `getChatGPTUser()`. The client cannot submit an actor ID for real-member writes.
- Never expose the Worker directly outside the Sites dispatch boundary: the member authentication model relies on its verified identity-header contract.
- Optional `OPENAI_API_KEY` must be a Sites secret; optional `OPENAI_MODEL` must name an eligible model. Both must be configured to enable live inference. Use the approved OpenAI Developers key-setup workflow when adding credentials. No key was supplied or created during this build.
- After changing environment variables, deploy a saved version so the new environment revision applies.
- No Codex credentials, subscriber OAuth tokens, or creator subscription credentials are reused.

## Official references reviewed

- [Sites overview](https://learn.chatgpt.com/docs/sites)
- [Data and connections](https://learn.chatgpt.com/docs/sites/data-and-connections)
- The installed Sites skill and supplied starter documentation for D1, identity, migrations, local preview, and private publication.
- [OpenAI structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) for the optional server-only Responses adapter.

The supplied runtime documents identity and connected-app access, but exposes no verified subscription-inference binding for this Site. Live inference therefore remains unavailable until a separately authorized provider is configured. The app does not claim otherwise.
