
# Vercel Deployment

To ensure this app works on Vercel:

1. Add `API_KEY` to your Vercel project's **Environment Variables**.
2. The code is optimized to access `process.env.API_KEY` only when requested by the user, avoiding top-level ReferenceErrors during the initial bundle load in Vite.
