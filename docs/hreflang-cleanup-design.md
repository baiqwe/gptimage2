# Hreflang Cleanup Design

Updated: 2026-05-11

## Goal

Clean up the site's multilingual SEO signals so that search engines only see final localized `200 OK` URLs in each language cluster, while keeping the current user-facing routing model unchanged.

This document covers:

- what the standard Next.js + Vercel i18n SEO shape looks like
- how the current implementation differs from that shape
- the root cause of the Ahrefs hreflang warnings
- the lowest-risk remediation plan
- rollout and verification steps

## Scope

In scope:

- runtime `hreflang` / alternate output
- page metadata alternates
- sitemap alternate refs
- redirect semantics for locale entry URLs
- validation and rollout steps

Out of scope:

- changing the physical localized URL structure
- changing content, canonicals, or internal navigation patterns
- migrating traffic to a non-prefixed locale architecture
- redesigning `next-intl` usage across the app

## Standard Architecture

For a localized Next.js App Router site on Vercel, the stable SEO architecture is:

1. Indexable pages are only the final localized pages, such as `/en/...` and `/zh/...`.
2. Entry URLs without a locale prefix, such as `/` or `/create`, can exist as routing helpers or redirects, but must not appear as members of a hreflang cluster.
3. The following signals must agree with each other:
   - page canonical
   - runtime alternate / hreflang output
   - sitemap alternate refs
4. Every hreflang member should be a final `200 OK` URL.
5. `x-default` is optional. If the framework or platform rewrites `x-default` to a non-final redirecting URL, removing `x-default` is safer than keeping a polluted cluster.

### Redirect best practice

There are two valid redirect patterns:

- Permanent canonical redirects for fixed URL normalization, such as `/ -> /en`
- Contextual locale redirects for language negotiation, where a framework may use `307`

The important SEO rule is not "everything must be 308". The important rule is:

**redirecting URLs must not be emitted as hreflang members.**

## Current Implementation

### Routing

- `localePrefix: 'always'` is enabled in [i18n/routing.ts](../i18n/routing.ts).
- `/` is manually redirected to the default locale with `308` in [middleware.ts](../middleware.ts).
- Locale-prefixed pages such as `/en`, `/zh`, `/en/create`, and `/zh/create` are the intended physical landing pages.

### Page metadata

Page-level metadata currently declares:

- `en`
- `zh`
- `x-default`

Examples:

- [app/(main)/[locale]/page.tsx](../app/(main)/%5Blocale%5D/page.tsx)
- [app/(main)/[locale]/create/page.tsx](../app/(main)/%5Blocale%5D/create/page.tsx)

At the source level, `x-default` points to the English localized page, for example:

- homepage: `https://gptimage2.online/en`
- create page: `https://gptimage2.online/en/create`

### Sitemap

The sitemap generator currently emits alternate refs for:

- `en`
- `zh`
- `x-default`

See [next-sitemap.config.js](../next-sitemap.config.js).

The generated [public/sitemap.xml](../public/sitemap.xml) does **not** include `/` or `/create` as `<loc>` entries. It only includes localized landing pages as primary URLs.

## Observed Live Behavior

The Ahrefs warnings are caused by a mismatch between source intent and live runtime output.

### Live redirects

Observed live responses:

- `https://gptimage2.online/` returns `308` and redirects to `/en`
- `https://gptimage2.online/create` returns `307` and redirects to `/en/create`

### Live hreflang response headers

Observed live `Link` headers:

- `https://gptimage2.online/en`
  - `en -> https://gptimage2.online/en`
  - `zh -> https://gptimage2.online/zh`
  - `x-default -> https://gptimage2.online/`
- `https://gptimage2.online/en/create`
  - `en -> https://gptimage2.online/en/create`
  - `zh -> https://gptimage2.online/zh/create`
  - `x-default -> https://gptimage2.online/create`

This means the runtime output is not preserving the intended `x-default -> /en...` mapping from source metadata. Instead, it is normalizing `x-default` to the non-prefixed entry URL.

That entry URL then redirects, which creates the exact two classes of Ahrefs issues we are seeing:

- `More than one page for same language in hreflang`
- `Hreflang to non-200`

## Root Cause

The problem is **not** that the sitemap primary URLs are wrong.

The problem is that:

1. Source metadata includes `x-default`
2. The runtime response layer rewrites `x-default` to a non-prefixed URL
3. That non-prefixed URL is a redirecting URL
4. Search tools group the redirecting URL and the localized `200` URL into the same language cluster

In practice, this creates a polluted cluster like:

- `en -> /en/create`
- `zh -> /zh/create`
- `x-default -> /create` where `/create` is `307`

The same pattern happens on the homepage with `/`.

## Gap Analysis: Standard vs Current

### What already matches the standard

- Locale-prefixed physical URLs are used as the intended landing pages.
- Canonical URLs point to localized pages.
- Sitemap `<loc>` entries are localized and indexable.
- Root locale normalization from `/` to `/en` already uses `308`.

### What does not match the standard

- Runtime hreflang output still contains redirecting entry URLs through `x-default`.
- Runtime alternate output and sitemap alternate output are not fully aligned.
- Subpage locale entry URLs such as `/create` still resolve via contextual `307` redirects.
- Hreflang strategy is repeated by hand across many pages, which increases drift risk.

## Recommended Fix

### Strategy

Use the lowest-risk cleanup:

1. Remove `x-default` from page metadata alternates.
2. Remove `x-default` from sitemap alternate refs.
3. Keep existing localized URLs, canonical URLs, and redirect behavior unchanged.
4. Keep `/ -> /en` as-is for now.
5. Do not attempt to redesign the entire locale entry model in the same change.

### Why this is the best first move

- It directly removes the polluted hreflang member.
- It does not change user-facing routing.
- It does not require content migrations.
- It does not require a URL architecture change.
- `x-default` is optional, so removing it is valid.
- It restores consistency between "only final localized pages should be hreflang members" and actual emitted signals.

## Proposed Changes

### 1. Remove `x-default` from page metadata

Update all page-level `alternates.languages` objects so they only include:

- `en`
- `zh`

Current pages to update:

- `app/(main)/[locale]/page.tsx`
- `app/(main)/[locale]/create/page.tsx`
- `app/(main)/[locale]/pricing/page.tsx`
- `app/(main)/[locale]/about/page.tsx`
- `app/(main)/[locale]/contact/page.tsx`
- `app/(main)/[locale]/privacy/page.tsx`
- `app/(main)/[locale]/terms/page.tsx`
- `app/(main)/[locale]/gallery/page.tsx`
- `app/(main)/[locale]/arena/page.tsx`
- `app/(main)/[locale]/developer-api/page.tsx`
- `app/(main)/[locale]/prompts/page.tsx`
- `app/(main)/[locale]/prompts/[category]/page.tsx`
- `app/(main)/[locale]/blog/page.tsx`
- `app/(main)/[locale]/blog/[slug]/page.tsx`

### 2. Remove `x-default` from sitemap alternate refs

Update [next-sitemap.config.js](../next-sitemap.config.js):

- `getAlternateRefs()` should emit only `en` and `zh`
- no `x-default` alternate refs should be included

### 3. Optional cleanup: centralize alternate generation

Create a shared helper for localized alternates so page metadata stays consistent across the app.

Suggested helper shape:

```ts
buildLocaleAlternates({
  siteUrl,
  path,
})
```

Return value:

- `canonical`
- `languages.en`
- `languages.zh`

This is not required for the initial fix, but it is recommended to prevent future drift.

## What We Are Not Changing in Phase 1

We are intentionally not changing:

- the `/` redirect behavior
- the `/create` redirect behavior
- localized URL paths
- canonical paths
- content structure
- internal navigation model

This keeps the fix narrow and low risk.

## Risk Assessment

### If we do nothing

- Ahrefs continues to report polluted hreflang groups
- runtime alternate output continues to point search tools to redirecting URLs
- internationalization signals remain noisy

### If we apply the recommended fix

Expected outcome:

- hreflang groups only contain final localized `200` URLs
- Ahrefs warnings should clear after recrawl
- multilingual clustering signals become cleaner

Risk level:

- low

Potential failure modes:

- missing alternate entries on one or more pages due to manual edits
- sitemap not regenerated after code changes
- old cached responses temporarily showing stale headers after deployment

### Why this is lower risk than other options

Alternatives such as forcing non-prefixed URLs to become real `200` pages or redesigning locale detection would be much broader changes with more indexation and routing risk.

## Rollout Plan

### Phase 1: Metadata cleanup

1. Remove `x-default` from page-level alternates.
2. Remove `x-default` from sitemap alternate refs.
3. Regenerate sitemap.

### Phase 2: Verification

Check these live endpoints after deployment:

- `/en`
- `/zh`
- `/en/create`
- `/zh/create`

Validate:

- each returns `200`
- `Link` headers include only `en` and `zh`
- no `x-default` appears in runtime `Link` headers

### Phase 3: Tool recrawl

After deployment:

1. Re-fetch or resubmit sitemap if needed
2. Re-run Ahrefs Site Audit
3. Confirm the following warnings disappear or drop materially:
   - `More than one page for same language in hreflang`
   - `Hreflang to non-200`

## Verification Checklist

### Source checks

- no page metadata file contains `x-default`
- `next-sitemap.config.js` no longer emits `x-default`

### Generated artifact checks

- `public/sitemap.xml` contains only `hreflang="en"` and `hreflang="zh"`
- no `hreflang="x-default"` exists in the generated sitemap

### Live response checks

Run:

```bash
curl -I https://gptimage2.online/en
curl -I https://gptimage2.online/zh
curl -I https://gptimage2.online/en/create
curl -I https://gptimage2.online/zh/create
```

Confirm:

- all four endpoints return `200`
- their `Link` headers do not include `x-default`

### Monitoring checks

- Ahrefs issue counts decline after recrawl
- Google Search Console does not surface new alternate / canonical conflicts

## Final Recommendation

Implement the hreflang cleanup as a narrow metadata and sitemap change first.

Do not broaden this into a routing architecture refactor in the same release.

The current architecture is already close to a standard localized setup. The main issue is the runtime `x-default` rewrite to redirecting non-prefixed URLs. Removing `x-default` cleanly resolves that mismatch with the least risk.
