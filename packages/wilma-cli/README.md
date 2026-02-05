# @wilm-ai/wilma-cli

Command line interface for Wilma (Finnish school system), built for parents and AI agents.

## Install
```bash
npm i -g @wilm-ai/wilma-cli
# or
pnpm add -g @wilm-ai/wilma-cli
```

## Run
```bash
wilma
# or
wilmai
```

## Non-interactive (agent-friendly)
```bash
wilma kids list --json
wilma news list --all --json
wilma messages list --folder inbox --all --json
```

## Config
Local config is stored in `.wilmai/config.json` in the current working directory.
Use `wilma config clear` to remove it.

## Notes
- Credentials are stored with lightweight obfuscation for convenience.
- For multi-child accounts, you can pass `--student <id>` or `--all`.
