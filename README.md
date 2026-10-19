# dash

A calm, minimal habit tracker.  
Log yes, no, or skip. Build or break. No streaks, no guilt.

## Run locally

```bash
npm install
npm run dev
```

Requires a Supabase project for cloud sync (optional – guest mode works locally).
`VITE_GOOGLE_CLIENT_ID` is optional: when set, Google sign-in uses Google Identity Services directly
(the consent screen shows your app instead of the Supabase URL); otherwise it falls back to the Supabase redirect flow.
Create a .env.local file with:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GOOGLE_CLIENT_ID=1234-abc.apps.googleusercontent.com
```

License
MIT
