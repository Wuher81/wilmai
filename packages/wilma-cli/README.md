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

## Commands

### Daily briefing
```bash
wilma summary [--days 7] [--student <id|name>] [--all-students] [--json]
```
Combines today's and tomorrow's schedule, upcoming exams, recent homework, news, and messages into one view. Designed for AI agents to surface what matters.

### Schedule
```bash
wilma schedule list [--when today|tomorrow|week] [--date YYYY-MM-DD] [--student <id|name>] [--all-students] [--json]
```

Examples:
```bash
# Specific day (e.g. Wednesday)
wilma schedule list --date 2026-02-25 --student "Stella" --json

# Tomorrow
wilma schedule list --when tomorrow --student "Stella" --json
```

### Homework
```bash
wilma homework list [--limit 10] [--student <id|name>] [--all-students] [--json]
```

### Upcoming exams
```bash
wilma exams list [--limit 20] [--student <id|name>] [--all-students] [--json]
```

### Exam grades
```bash
wilma grades list [--limit 20] [--student <id|name>] [--all-students] [--json]
```

### News and messages
```bash
wilma news list [--limit 20] [--student <id|name>] [--all-students] [--json]
wilma news read <id> [--student <id|name>] [--json]
wilma messages list [--folder inbox] [--limit 20] [--student <id|name>] [--all-students] [--json]
wilma messages read <id> [--student <id|name>] [--json]
```

### Other
```bash
wilma kids list [--json]
wilma update
wilma config clear
```

## Config
Local config is stored in `~/.config/wilmai/config.json` (or `$XDG_CONFIG_HOME/wilmai/config.json`).
Use `wilma config clear` to remove it. Override with `WILMAI_CONFIG_PATH`.

## Notes
- Credentials are stored with lightweight obfuscation for convenience.
- For multi-child accounts, you can pass `--student <id|name>` or `--all-students`.
- All list commands support `--json` for agent-friendly structured output.
