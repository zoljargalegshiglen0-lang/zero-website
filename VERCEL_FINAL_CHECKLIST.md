# WINGS V4 — GitHub → Vercel final checklist

## Required environment variable
- `ZERO_ADMIN_PASSWORD`

## Optional environment variables
- `STEAM_WEB_API_KEY` — Steam public profile enrichment.
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN` — required if Admin Website Controls / Staff edits must persist on Vercel.
- `CS2_BRIDGE_URL`
- `CS2_BRIDGE_TOKEN` — real CS2 server/player backend.

## Deploy
1. Replace the existing GitHub project files with this ZIP contents.
2. Run `git add .`
3. Run `git commit -m "WINGS V4 premium redesign"`
4. Run `git push`
5. Vercel redeploys automatically from the connected `main` branch.

## Quick production test
- `/` homepage loads.
- `/servers` displays bridge data or fallback server widgets.
- `/skinchanger` opens and Steam gate works.
- `/admin` requires owner password.
- `/api/health` returns `ok: true`.

The project includes graceful fallback behavior when optional integrations are not configured.
