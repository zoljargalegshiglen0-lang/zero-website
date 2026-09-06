# ZERO CS2 Community integration

The website is prepared to connect to a CS2 bridge service without demo/fake stats.

## Required later

- `CS2_BRIDGE_URL` – HTTPS base URL for your CS2 bridge/service.
- `CS2_BRIDGE_TOKEN` – optional bearer token shared with the bridge.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` – persistent Staff, moderation and SteamID loadout storage on Vercel.

## Bridge endpoints expected

- `GET /api/servers` → `{ servers: CommunityServer[] }`
- `GET /api/players/:steamId64/profile` → playtime, K/D, map stats, recent 10 maps, FACEIT fields if available.
- `PUT /api/loadouts/:steamId64` body `{ loadout }` → sync saved website loadout to your CS2 server/plugin layer.
- `POST /api/moderation` body moderation record → apply BAN/MUTE/GAG/SILENCE in your server layer.

No fabricated player/server statistics are shown when the bridge is not connected.
