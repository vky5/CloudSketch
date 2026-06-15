# AI Prompt (placeholder)

This implements a minimal AI prompting flow as a starting point for the CloudSketch vision:

- Client UI: `src/components/AIConsole.tsx` — textarea + Generate button.
- Sidebar integration: `src/components/Sidebar.tsx` — toggle the AI panel from the sidebar.
- Client helper: `src/lib/aiClient.ts` — wrapper that POSTs to the internal API route.
- API route (placeholder): `src/app/api/ai/prompt/route.ts` — returns a mocked architecture graph.

Groq integration:

- The API route will proxy prompts to an external provider if the following environment variables are set:
	- `GROQ_API_URL` — full Groq endpoint (e.g. https://api.groq.ai/v1)
	- `GROQ_API_KEY` — your API key

- The route instructs the provider to return a UGCP-first JSON object with a `graph` payload. The UI consumes that `graph` and places nodes/edges on the canvas. This keeps the AI responsible for generating the internal graph language, while Terraform is generated from the internal graph elsewhere in the app.

If the env vars are not set the route falls back to a mocked graph for local testing.

How to try:

1. Run the Next.js dev server (same as existing project):

```bash
pnpm dev
```

2. Open the app in the browser, open the sidebar and click the `AI Prompt` button.

3. Enter a short architecture description and click `Generate` — you'll receive a mocked response.

Next steps:

- Replace the placeholder in `src/app/api/ai/prompt/route.ts` with a real AI provider (OpenAI, Anthropic, etc.).
- Add parsing that converts generated output to actual nodes/edges in the diagram store.
- Add authentication and rate-limiting for the API route.
