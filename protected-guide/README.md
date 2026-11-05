# Ziiply protected mobile guide — implementation branch

This is an isolated Next.js service for `ohje.ziiply.fi`, not the public GitHub Pages website.

## Status
- Login/logout and DB-backed 30-day sessions implemented in source.
- Not deployed, no domain assigned, no credentials imported.
- The original guide HTML and its images are still PUBLIC in GitHub Pages. Do not claim the guide is protected.
- Before launch: provision isolated database; apply schema; import the 406 credentials with scrypt salt/hash (never commit CSV or passwords); rate-limit login; add protected asset endpoint and migrate guide content/images to non-public storage; verify direct image URLs deny unauthenticated access; disable or remove public guide copies; deploy and test; add Vercel domain and Zoner CNAME.

## Security
Do not store passwords, session tokens, or GUIDE_DATABASE_URL in GitHub. Configure GUIDE_DATABASE_URL as encrypted Vercel environment variable.
