import { THEME_INIT_SCRIPT } from "@/providers/theme";

// Served as a same-origin script so the CSP needs neither 'unsafe-inline' nor a
// dangerouslySetInnerHTML (banned by lint). It blocks first paint for a few
// bytes, which is what prevents a flash of the wrong theme (FR-24).
export function GET() {
  return new Response(THEME_INIT_SCRIPT, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
