# wilma-client tests

## Smoke test

1. Copy `test/.env.example` to `test/.env.local` and fill in credentials.
2. Run `pnpm --filter @wilmai/wilma-client build`.
3. Run `node test/smoke.mjs` from `packages/wilma-client`.

You can also point to a different env file with `WILMA_ENV_PATH=/path/to/.env`.

**Note:** `.env.local` should never be committed.
