# Stripe Primary Payment Rollout

This document records the production rollout for using Stripe as the primary checkout provider across all products, while keeping Creem as an alternative fallback checkout.

## Goals

- Make Stripe the default payment provider for:
  - one-time credit packs
  - monthly subscriptions
  - yearly subscriptions
- Keep Creem available as a fallback checkout option.
- Avoid breaking:
  - image generation flow
  - credits and paid-access gating
  - SEO-critical metadata, routing, and sitemap behavior

## Phase 1: Billing Data Compatibility

### Database changes

We extend the billing schema to support Stripe without removing Creem compatibility:

- `customers`
  - `stripe_customer_id`
  - `has_paid_access`
  - `billing_provider`
- `subscriptions`
  - `provider`
  - `stripe_subscription_id`
  - `stripe_price_id`
  - `stripe_product_id`

### Compatibility rules

- Stripe is the new primary billing provider for new purchases.
- Creem remains valid for fallback checkout and any legacy/manual paths.
- Paid-access checks now support either:
  - `has_paid_access = true`
  - a valid Stripe customer id
  - a valid non-auto Creem customer id

### Safety principle

This phase does not change image generation logic. It only broadens the billing identity model so both providers can coexist safely.

## Phase 2: Stripe Checkout, Webhooks, and Billing Portal

### Checkout

New API:

- `POST /api/stripe/checkout`

Behavior:

- Creates an embedded Stripe Checkout Session
- Uses `mode=payment` for one-time credit packs
- Uses `mode=subscription` for recurring plans
- Returns a `clientSecret` for embedded checkout rendering

### Webhooks

New API:

- `POST /api/webhooks/stripe`

Handled events:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Credit and entitlement logic

- One-time purchases grant credits from `checkout.session.completed`
- Recurring subscription cycles grant credits from `invoice.paid`
- Subscription state is synced into the shared `subscriptions` table
- Paid-access unlock is marked on the matching `customers` row

### Billing portal

New API:

- `GET /api/billing/customer-portal`

Behavior:

- Opens Stripe Billing Portal when the user is Stripe-backed
- Falls back to Creem billing portal when the user is still backed by Creem

## Phase 3: UI Rollout

### Pricing page

- Stripe is shown as the recommended default payment path
- Creem is available inside the same payment dialog as an alternative checkout tab

### Quick refill modal

- The refill flow now uses the same provider selector pattern
- Stripe stays primary
- Creem remains available for fallback payments

### UX principles

- Do not over-promise specific local wallets in the UI
- Present Stripe as the default and most seamless path
- Keep Creem available for fallback reliability

## Historical Data Handling

There are no legacy users that require a Stripe migration.

However, we still preserve historical compatibility:

- Existing Creem-backed rows remain valid
- The billing portal route can still open Creem when needed
- High-resolution unlock logic accepts both Stripe and Creem paid identities

## Environment Variables

Required for Stripe:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER_ID`
- `STRIPE_PRICE_PRO_MONTHLY_ID`
- `STRIPE_PRICE_PRO_YEARLY_ID`

Existing Creem variables remain valid for fallback checkout:

- `CREEM_API_URL`
- `CREEM_API_KEY`

## Rollback Strategy

If Stripe needs to be disabled quickly:

1. Remove Stripe keys from the environment
2. Keep Creem keys in place
3. The fallback Creem checkout path remains available

Because the UI keeps Creem as an alternative path, this rollout is reversible without touching image generation or SEO-critical code paths.
