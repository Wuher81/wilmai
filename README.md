# wilmai

**wilmai** (wilm.ai) brings the Finnish **Wilma** school app to your terminal and to your AI agents.

Use it as a **CLI for parents** to quickly scan messages, news, and exams across kids — and as a **skill/extension** for AI agents (OpenClaw, Claude, etc.) so they can help you keep up with school life.

## Why
- Parents need a fast, reliable way to check **what matters today**.
- Agents need a stable, scriptable interface to Wilma so they can summarize, remind, and assist.
- Wilma is multi‑tenant and non‑standard — wilmai makes it consistent.

## What’s inside
- `packages/wilma-client` – TypeScript Wilma client (auth + parsing + tenant list)
- `packages/wilma-cli` – Interactive CLI and non‑interactive command mode
- `packages/wilma-mcp` – MCP server (planned / optional)
- `apps/site` – Landing page (Vercel)

## Quick start
```bash
pnpm install
pnpm --filter @wilmai/wilma-cli build
node packages/wilma-cli/dist/index.js
```

### Install globally
```bash
npm i -g @wilmai/wilma-cli
# or
pnpm add -g @wilmai/wilma-cli
```

### Non‑interactive (for agents / skills)
```bash
node packages/wilma-cli/dist/index.js kids list --json
node packages/wilma-cli/dist/index.js news list --all --json
node packages/wilma-cli/dist/index.js messages list --folder inbox --all --json
```

## Vision
wilmai is designed to be **open‑source**, **portable**, and **agent‑friendly**:
- CLI for humans
- JSON output for AI tools
- Optional MCP wrapper for native agent integrations

## License
MIT
