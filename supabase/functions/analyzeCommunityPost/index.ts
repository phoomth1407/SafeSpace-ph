// Legacy compatibility endpoint intentionally retired.
// The current application uses analyze-community-post instead.
// Keep the slug temporarily so stale clients fail safely rather than reaching
// the old implementation.

Deno.serve(() => new Response(
  JSON.stringify({
    error: "This legacy function has been retired.",
    replacement: "analyze-community-post",
  }),
  {
    status: 410,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  },
));
