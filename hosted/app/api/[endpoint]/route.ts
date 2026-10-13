import { env } from "cloudflare:workers";
import { handle } from "../../../lib/api.mjs";
export const dynamic = "force-dynamic";
export function GET(request: Request) { return handle(request, (env as unknown as { DB: unknown }).DB); }
export function POST(request: Request) { return handle(request, (env as unknown as { DB: unknown }).DB); }
