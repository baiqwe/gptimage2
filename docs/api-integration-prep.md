# API Integration Prep

This project already has a working frontend flow for image generation, credits, auth, and checkout. The missing piece for a real production rollout is making the server-side API integration explicit, stable, and easy to configure.

## Current Request Flow

1. The UI submits generation requests to `POST /api/ai/text-to-image`.
2. The route verifies the signed-in Supabase user.
3. The route deducts credits with the `decrease_credits` RPC.
4. The route calls the configured GPT Image 2 image provider API.
5. The generated image URL is stored in `generations`.
6. If the upstream call fails, credits are refunded.

## Required Environment Variables

These are required before the site can talk to real services:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KIE_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BASE_URL=localhost:3000
```

These are required if payment and self-serve billing should work:

```bash
CREEM_WEBHOOK_SECRET=
CREEM_API_KEY=
CREEM_API_URL=https://test-api.creem.io/v1
CREEM_SUCCESS_URL=http://localhost:3000/en/create
```

## Database Prerequisites

Run the Supabase SQL setup before testing the real API flow:

1. `supabase/setup_database.sql`
2. Latest migrations under `supabase/migrations/`

The image generation flow depends on:

- `customers`
- `generations`
- `credits_history`
- RPC function `decrease_credits(uuid, integer, text)`

## What Was Hardened

The codebase now has a proper integration boundary:

- `lib/env.ts`: central required-env validation
- `app/api/ai/text-to-image/route.ts`: GPT Image 2 provider routing, aspect-ratio and resolution validation, and upstream error handling
- `app/api/ai/text-to-image/route.ts`: simplified orchestration route with clearer failure modes

## Production Checklist

1. Fill `.env.local` from `.env.example`.
2. Verify Supabase auth works locally.
3. Verify the `customers` row is created for a newly registered user.
4. Confirm test credits exist for the account you use.
5. Send a test request to `/api/ai/text-to-image`.
6. Confirm a row is written to `generations`.
7. Confirm failed upstream requests refund credits.
8. Switch `CREEM_API_URL` from test to production before launch.

## Smoke Test

After configuring env vars, run:

```bash
npm run build
```

Then sign in and generate one image from the site UI. If the request succeeds, the real API path is fully connected.
