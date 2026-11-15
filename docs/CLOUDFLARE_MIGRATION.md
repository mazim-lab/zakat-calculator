# Moving islamichisab.com from Vercel to Cloudflare Workers

Status: prepared on branch `cloudflare-migration`, not cut over. Vercel still
serves the live site. Nothing in this branch changes the Vercel build.

The site runs on Cloudflare Workers through OpenNext
([@opennextjs/cloudflare](https://opennext.js.org/cloudflare)), the same way
FinTerminal does. Cloudflare "Workers Builds" builds and deploys on every push
to the production branch.

## What the branch adds

- `wrangler.jsonc`: Worker name `islamichisab`, Node.js compatibility, static
  assets binding. No KV, R2 or D1 storage is needed.
- `open-next.config.ts`: static-assets cache. Every page is prerendered at build
  time, so nothing is written at request time.
- `public/_headers`: long-lived browser caching for `/_next/static/*` on
  Cloudflare. (Vercel already does this by itself.)
- `src/app/api/metals/route.ts`: on Cloudflare only, the gold and silver prices
  are kept in the Workers edge cache for 1 hour (5 minutes for the fallback), so
  each visit does not call Yahoo Finance. On Vercel this code is skipped.
- `src/app/layout.tsx`: a Cloudflare build leaves out Vercel Web Analytics and
  Speed Insights, which only work on Vercel. A Vercel build still includes them.
- `package.json`: dev-only packages `@opennextjs/cloudflare` 1.18.1 and
  `wrangler` 4.107.1, plus scripts `cf:build`, `cf:preview`, `cf:deploy`,
  `cf-typegen`.

Why adapter 1.18.1: it is the newest release whose supported range includes
the site's Next.js 16.1.6. Releases 1.19.0 and later require Next.js 16.2.3 or
newer. FinTerminal runs the same pair in production. When Next.js is upgraded
(recommended anyway, see "Known points"), upgrade the adapter with it.

## Where DNS lives today (checked 2026-11-15)

- Registrar: Namecheap.
- Nameservers: `dns1.registrar-servers.com`, `dns2.registrar-servers.com`
  (Namecheap BasicDNS).
- `islamichisab.com`: A record `216.198.79.1` (Vercel). Vercel redirects it to
  `www`.
- `www.islamichisab.com`: CNAME `fe16d845f301ec41.vercel-dns-017.com` (Vercel).
- Email: MX records `eforward3/4/5.registrar-servers.com` and an SPF TXT record
  for Namecheap email forwarding.

Cloudflare Workers custom domains need the domain to be a Cloudflare zone, so
the nameservers must move from Namecheap to Cloudflare. This is the same move
you made for finterminal.ca. The registrar stays Namecheap.

## Owner steps

Do these in order. Vercel keeps serving the site until step 8.

1. **Merge the branch.** Merge `cloudflare-migration` into `main`. This is safe
   while Vercel is live: the new files are ignored by Vercel, and the branch's
   Vercel preview build passed. Vercel redeploys `main` exactly as before.

2. **Create the Worker.** In the Cloudflare dashboard (the same account as
   FinTerminal): Compute (Workers) > Workers & Pages > Create > Workers >
   Import a repository. Pick GitHub repo `mazim-lab/zakat-calculator`.
   - Project name: `islamichisab` (must match `name` in `wrangler.jsonc`).
   - Production branch: `main`
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx wrangler deploy`
   - Root directory: leave empty.
   - Builds for non-production branches: turn off, or leave the default.

3. **Environment variables.** None are needed. The app reads no secrets or
   keys, and `/api/metals` uses Yahoo Finance without a key. Workers Builds sets
   `WORKERS_CI=1` by itself, which is how the build knows to leave out the
   Vercel analytics.

4. **Check the test address.** After the first build finishes, open the
   `islamichisab.<your-subdomain>.workers.dev` address and check:
   - `/`, `/zakat`, `/zakat-fitr`, `/fidya`, `/kaffarah`, `/inheritance`,
     `/find-your-school`, `/about`, `/glossary` all load and look right.
   - `/sitemap.xml` and `/robots.txt` load.
   - `/no-such-page` shows the site's "Page not found" page.
   - `/api/metals` returns JSON with `"source":"live"`. If it says
     `"fallback"`, Yahoo is refusing Cloudflare's servers; tell Claude before
     going further.
   - The Zakat page shows live gold and silver prices.
   - If any page shows "Internal Server Error", stop here and check the Worker's
     Logs tab. Do not continue to DNS.
   Note: the edge cache does not run on `workers.dev`, so `/api/metals` calls
   Yahoo on every request there. That is expected; it works on the real domain.

5. **Optional: Cloudflare Web Analytics.** Vercel Analytics stops on
   Cloudflare. To keep page metrics, turn on Web Analytics for the Worker
   (Worker > Settings or Analytics & Logs > Web Analytics). The About page
   privacy section names Vercel Web Analytics and Speed Insights; decide the new
   wording before cutover and ask Claude to change that text in the same change.

6. **Move DNS to Cloudflare.**
   1. Write down the current Namecheap nameservers (above) for rollback.
   2. Cloudflare dashboard > Add a domain > `islamichisab.com` > Free plan.
      Let it scan the existing records. Check that it imported the A record,
      the `www` CNAME, the three MX records and the SPF TXT record. Set the A
      and CNAME records to "DNS only" (grey cloud) for now so nothing changes
      when nameservers switch.
   3. Email: Namecheap email forwarding works only while Namecheap runs the
      DNS. If you use an `@islamichisab.com` forward, set the same forward up in
      Cloudflare Email Routing (Email > Email Routing) and let it replace the
      MX and SPF records. If you do not use email on this domain, skip this.
   4. In Namecheap: Domain List > islamichisab.com > Nameservers > Custom DNS,
      enter the two Cloudflare nameservers. Wait until Cloudflare shows the
      zone as Active (minutes to a few hours). The site is still on Vercel.

7. **Point the domain at the Worker.**
   1. Worker > Settings > Domains & Routes > Add > Custom domain:
      `www.islamichisab.com`. Accept replacing the existing `www` record.
   2. Add a second custom domain: `islamichisab.com`. Accept replacing the A
      record.
   3. Keep the apex redirect to `www` (Vercel does this today): Rules >
      Redirect Rules > create from template "Redirect from root to WWW", status
      301, keep query string.
   Cloudflare issues the TLS certificates by itself.

8. **Verify the live site.**
   - `curl -I https://www.islamichisab.com` shows `server: cloudflare`.
   - `curl -I https://islamichisab.com` redirects to `https://www.islamichisab.com/`.
   - Repeat the page checks from step 4 on `www.islamichisab.com`.
   - Request `/api/metals` twice; the second answer has `CF-Cache-Status: HIT`.
   - Watch the Worker's Logs and Metrics for errors over the next days.

9. **Rollback (any time before step 10).** Vercel still has the project and
   the domains, so rollback is DNS only:
   - Quick: in Cloudflare DNS, remove the two Worker custom domains and add back
     `A @ 216.198.79.1` and `CNAME www fe16d845f301ec41.vercel-dns-017.com`,
     both "DNS only". Disable the redirect rule.
   - Full: in Namecheap set nameservers back to Namecheap BasicDNS
     (`dns1.registrar-servers.com`, `dns2.registrar-servers.com`). Re-add the
     email forwarding records in Namecheap if you changed them.
   - The code needs no change: the merged branch is harmless on Vercel.

10. **Retire Vercel (last, after about a week of clean running).**
    1. In the Vercel project `app`, remove the domains `islamichisab.com` and
       `www.islamichisab.com`.
    2. Delete the Vercel project, or disconnect its Git repository, so pushes to
       `main` stop building on Vercel.
    3. Ask Claude to remove `@vercel/analytics` and `@vercel/speed-insights`
       from the code and tidy the About page privacy text.

## Free plan fit

- Requests: 100,000 Worker requests per day. Page views and `/api/metals` count;
  files under `/_next/static`, images, icons and fonts are static assets, which
  are free and unlimited.
- CPU: 10 ms per request. Pages are prerendered, so a request only reads a
  stored HTML file. `/api/metals` mostly waits on the network (waiting does not
  count as CPU) and is cached for an hour per data centre.
- Subrequests: 50 per request. `/api/metals` makes 2.
- Bundle size: about 1.3 MB compressed in a local build, inside the Free limit.
- Workers Builds: 3,000 build minutes per month, one build at a time. A build
  takes a few minutes.

## Known points

- Building on Windows: `npm run cf:preview` on a Windows PC builds, but the
  local preview then answers every page with "Internal Server Error"
  (ChunkLoadError). This is a known OpenNext limit with Next.js's default
  Turbopack build on Windows. Cloudflare builds on Linux, as it does for
  FinTerminal. For a local test on Windows, build with webpack instead: change
  the `build` script to `next build --webpack` temporarily, run
  `npm run cf:preview`, then change it back.
- Next.js 16.1.6 has published security advisories (npm audit). They are not
  caused by this move and apply on Vercel too. Upgrading Next.js lets the
  OpenNext adapter move to its current release as well.
- `/api/metals` on Vercel was cached by the Vercel CDN for 1 hour. On Cloudflare
  the same 1 hour applies per Cloudflare data centre, so Yahoo sees a few more
  requests in total, still far below one per visit.
- Trailing slashes behave the same: `/zakat/` redirects to `/zakat` (308) on
  both Vercel and the local Workers preview.
