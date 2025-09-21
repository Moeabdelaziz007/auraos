# Synapse Summarize (Placeholder)

Purpose: Server-side endpoint to summarize note content using an LLM provider.

- Endpoint (planned): POST /api/synapse/summarize
- Auth: Requires authenticated user (Core Auth)
- Inputs: { noteId?: string, text?: string, attachments?: string[] }
- Output: { summary: string, model: string }

Implementation notes:
- Use server-side API keys from environment / GitHub Secrets
- Rate-limit per user
- Optional: include Vault attachment previews in context

Status: Placeholder for Sprint 1 scaffold.
