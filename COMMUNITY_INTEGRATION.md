# WINGS CS2 integration guide

This site is prepared for real CS2 integration. Fake top players / fake clans are intentionally removed from the public pages.

## 1) Required environment variables

- `CS2_BRIDGE_URL`
  - HTTPS URL of your own bridge / relay service.
  - Example: `https://bridge.yourdomain.com`
- `CS2_BRIDGE_TOKEN`
  - Optional bearer token.
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
  - Recommended on Vercel for persistent admin edits, staff data, loadouts and moderation history.
- `STEAM_WEB_API_KEY`
  - Optional for richer Steam profile data.

## 2) Why use a bridge

The website should not talk directly to a CS2 plugin from the browser.
Recommended flow:

`Website -> Bridge API -> CS2 plugin / server services`

This keeps tokens private and lets you normalize plugin data before the website reads it.

## 3) Bridge endpoints expected by the website

### `GET /api/servers`
Return:

```json
{
  "servers": [
    {
      "id": "01",
      "name": "WINGS PREMIER #1",
      "address": "1.2.3.4:27015",
      "mode": "PREMIER",
      "map": "de_mirage",
      "players": 8,
      "capacity": 10,
      "ping": 14,
      "state": "ONLINE",
      "updatedAt": "2026-09-06T12:00:00.000Z"
    }
  ]
}
```

### `GET /api/players/:steamId64/profile`
Return playtime and community stats, for example:

```json
{
  "playtimeSeconds": 24000,
  "kills": 420,
  "deaths": 300,
  "kd": 1.4,
  "matches": 55,
  "mapsPlayed": 7,
  "favoriteMap": "de_mirage",
  "mapRecord": "18W-7L",
  "faceitLevel": 7,
  "faceitElo": 1650,
  "recentMaps": []
}
```

### `PUT /api/loadouts/:steamId64`
The website sends saved skinchanger loadouts here.

Request body:

```json
{
  "loadout": {}
}
```

Use this to sync the website skinchanger with your CS2 plugin.

### `POST /api/moderation`
Receives moderation records created from the website.
Your bridge can then forward them to the plugin / server backend.

## 4) Skinchanger readiness

The skinchanger page is already prepared for:

- Steam-based saved loadouts
- live catalog fetches for skins / stickers / charms / agents / music kits / medals
- website-side save calls through `/api/loadout`
- bridge sync through `PUT /api/loadouts/:steamId64`

## 5) Recommended plugin-side tasks

Your plugin / backend should provide or forward:

- server list and current player counts
- player profile / stats data
- loadout apply / save endpoint
- moderation action handling if you want website-issued punishments

## 6) Public page behavior

If live data is not connected, the website now shows clean empty states instead of obvious fake stats.
