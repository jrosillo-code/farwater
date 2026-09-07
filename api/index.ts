// Thin Vercel entry over the pre-bundled server (see server/serverless.ts
// for why bundling is required). createRequire keeps this file valid ESM
// while loading the CJS bundle; the literal path lets Vercel's file tracer
// include it in the deployed function.
import { createRequire } from "node:module";

const cjsRequire = createRequire(import.meta.url);
const bundled = cjsRequire("./_serverless.cjs") as { default: (req: unknown, res: unknown) => Promise<void> };

export default bundled.default;
