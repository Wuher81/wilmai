# Testing

wilmai uses two tiers of tests:

## 1) Offline tests (no credentials)
These are safe to run in CI and do not require Wilma access.

- Parser/unit tests live under `packages/wilma-client/test/fixtures`.

## 2) Live tests (opt-in, require your own credentials)
These tests require access to a real Wilma account and should be run locally.
No secrets are committed to the repo.

### Wilma client live test
1. Copy `packages/wilma-client/test/.env.example` to `packages/wilma-client/test/.env.local` and fill in credentials.
2. Run:
   ```bash
   pnpm --filter @wilmai/wilma-client test:live
   ```

### Wilma CLI live test
1. Run the interactive CLI once to create `.wilmai/config.json`.
2. Run:
   ```bash
   pnpm --filter @wilmai/wilma-cli test:live
   ```

### Notes
- Tests only assume you have **at least one student** in one tenant.
- For CLI tests, the `kids list --json` command must return at least one student.
- You can override the config file path with:
  ```bash
  WILMAI_CONFIG_PATH=/path/to/config.json pnpm --filter @wilmai/wilma-cli test:live
  ```
