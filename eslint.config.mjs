import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare (OpenNext and Wrangler) build output.
    ".open-next/**",
    ".wrangler/**",
    // Frozen copy of the original code, kept byte-identical for equivalence tests.
    "tests/reference/**",
  ]),
]);

export default eslintConfig;
