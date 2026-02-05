# wilma-cli live test

## Prereqs
- Run the interactive CLI once so `.wilmai/config.json` exists.
- Build the CLI.

## Run
```bash
pnpm --filter @wilmai/wilma-cli build
node test/live.spec.mjs
```

Optional override:
```bash
WILMAI_CONFIG_PATH=/path/to/config.json node test/live.spec.mjs
```
