# WINGS redesign + control update

## Done in this build
1. **Admin panel expanded with real controls**
   - Website control center
   - Discord/social settings
   - Announcement manager
   - Editable homepage quick cards
   - Fallback server widget editor
   - Existing Steam staff manager kept

2. **Discord integrated**
   - Invite: https://discord.gg/tFNYKQpHZe
   - Topbar Join Discord button
   - Homepage Join Discord button
   - Sidebar Discord block
   - Staff page Discord button
   - Discord-style icon added to the icon set

3. **Homepage cards are editable**
   - Title
   - Description
   - Link
   - Icon

4. **Server widgets + announcement manager**
   - Edit fallback server name/mode/map/player count/capacity/ping/state
   - Real CS2 bridge still takes priority when connected
   - Announcement can be enabled/disabled and edited from admin

## Vercel persistence
The site works with the defaults in `data/site-config.json` immediately.
For edits made inside the Admin Panel to persist on Vercel, connect Upstash Redis and provide:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without Redis, change `data/site-config.json` in GitHub and push to deploy permanent defaults.

## Vercel build fix
- Fixed TypeScript literal type error in `lib/site-config.ts` for server widget `state`.
- Verified production build successfully with Next.js 16.2.6 (`next build --webpack`).
