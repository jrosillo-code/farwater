import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";

// Source for the pre-bundled Vercel function (api/_serverless.cjs). The
// repo is "type": "module" with extensionless relative imports — fine for
// Vite/esbuild, but Vercel's runtime executes /api as real Node ESM where
// those imports cannot resolve, so every invocation died on import
// (FUNCTION_INVOCATION_FAILED). Bundling to one CJS file sidesteps module
// resolution entirely; scripts/build-serverless.mjs produces the bundle.
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const ready = registerRoutes(createServer(app), app).then(() => {
  // Terminal JSON error handler — a thrown route error must never leak a
  // stack trace or hang the function.
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("api error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Internal error" });
  });
});

export default async function handler(req: unknown, res: unknown) {
  await ready;
  return (app as unknown as (req: unknown, res: unknown) => void)(req, res);
}
