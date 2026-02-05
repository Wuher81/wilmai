# wilma-client tests

## Offline tests (fixtures)
Add fixture-based parser tests here (no secrets needed).

## Live test (opt-in)
1. Copy `test/.env.example` to `test/.env.local` and fill in credentials.
2. Build the client:
   ```bash
   pnpm --filter @wilmai/wilma-client build
   ```
3. Run:
   ```bash
   node test/live.spec.mjs
   ```

You can also point to a different env file with `WILMA_ENV_PATH=/path/to/.env`.

**Note:** `.env.local` should never be committed.
