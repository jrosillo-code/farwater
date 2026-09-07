// Bundle the Express API into a single CJS file for the Vercel function.
// Runs in the Vercel buildCommand; the committed copy is a fallback so the
// function works even if a build reorders steps.
import { build } from "esbuild";

await build({
  entryPoints: ["server/serverless.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  outfile: "api/_serverless.cjs",
  logLevel: "info",
});
