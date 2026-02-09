<p align="center">
  <img src="assets/wilmai_mascot.png" alt="wilmai mascot" width="200">
</p>

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
- `apps/site` – Landing page (Vercel)

## Quick start
```bash
pnpm install
pnpm --filter @wilm-ai/wilma-cli build
node packages/wilma-cli/dist/index.js
```

### Install globally
```bash
npm i -g @wilm-ai/wilma-cli
# or
pnpm add -g @wilm-ai/wilma-cli
```

### Install as a skill (npx skills)
```bash
npx skills add aikarjal/wilmai
```

### Non‑interactive (for agents / skills)
```bash
wilma summary --all-students --json
wilma schedule list --when tomorrow --json
wilma homework list --all-students --json
wilma exams list --all-students --json
wilma grades list --all-students --json
```

Config is stored in `~/.config/wilmai/config.json` (or `$XDG_CONFIG_HOME/wilmai/config.json`). Override with `WILMAI_CONFIG_PATH`.

## Credentials & Privacy

Your Wilma credentials are stored locally in `~/.config/wilmai/config.json` (or `$XDG_CONFIG_HOME/wilmai/config.json`) after first login. The password is obfuscated (not encrypted) for convenience — this is a personal productivity tool, not a vault.

**Do not share your config file.** If you're on a shared machine, consider deleting the config after use (`rm -rf ~/.config/wilmai`).

## Vision
wilmai is designed to be **open‑source**, **portable**, and **agent‑friendly**:
- CLI for humans
- JSON output for AI tools
- Skills integration for AI agents

## License
MIT
