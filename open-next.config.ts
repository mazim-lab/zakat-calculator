import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Cloudflare Workers build config (OpenNext). Vercel never reads this file.
//
// Static-assets incremental cache: every page on this site is prerendered at
// build time and nothing uses ISR or revalidate, so prerendered HTML is served
// straight from the deployed static assets. It uses no KV, R2 or D1 and writes
// nothing at request time. Each content change is a git push that triggers a
// full rebuild on Cloudflare Workers Builds.
//
// If runtime ISR is ever added, switch to the R2 or KV incremental cache and
// add the matching binding in wrangler.jsonc (see opennext.js.org/cloudflare).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
