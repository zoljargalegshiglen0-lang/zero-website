# WINGS — GitHub → Vercel deploy

## 1) GitHub
Create an EMPTY GitHub repository. Do not add README, license, or .gitignore when creating it.

Extract this ZIP into a folder, open PowerShell/CMD inside that folder, then run:

```powershell
git init
git add .
git commit -m "WINGS website"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

If you are updating an existing repository that is already connected to Vercel, replace the old project files with these files and run:

```powershell
git add .
git commit -m "WINGS website update"
git push
```

## 2) Vercel
1. Vercel → Add New → Project.
2. Import the GitHub repository.
3. Framework should auto-detect **Next.js**.
4. Root Directory: `./`
5. Do not change Build/Output settings unless Vercel asks.
6. Add environment variable:
   - `ZERO_ADMIN_PASSWORD` = your admin password
7. Click Deploy.

Vercel will give a free `*.vercel.app` address.

## Admin persistence on Vercel
The default Discord URL, homepage cards, announcements, and demo server widgets are bundled in the project and work immediately.

Vercel server functions cannot permanently write to normal project files. To make Admin → Website Controls and Staff add/remove changes survive redeploys, add:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Without Redis, the public site still works; only permanent admin edits are limited.

## Optional integrations
- `STEAM_WEB_API_KEY` — Steam profile lookup.
- `CS2_BRIDGE_URL` + `CS2_BRIDGE_TOKEN` — real live CS2 server/player data later.

Never commit a real `.env` file or passwords to GitHub.
