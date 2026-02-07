---
name: wilma
description: Access Finland's Wilma school system from AI agents. Fetch messages, news, exams, and student data via the wilma CLI. Use when an agent needs to check school notifications, list upcoming exams, or summarize what needs parent attention.
---

# Wilma Skill

## Overview

Wilma is the Finnish school information system used by schools and municipalities to share messages, news, exams, attendance, and other student-related updates with parents/guardians.

Use the `wilma` / `wilmai` CLI in non-interactive mode to retrieve Wilma data for AI agents. Prefer `--json` outputs and avoid interactive prompts.

## Quick start

### Install
```bash
npm i -g @wilm-ai/wilma-cli
```

1. Ensure the user has run the interactive CLI once to create `~/.config/wilmai/config.json`.
2. Use non-interactive commands with `--json`.

## Core tasks

### List students
```bash
wilma kids list --json
```

### Fetch data for one student
```bash
wilma news list --student 123456 --json
wilma messages list --student 123456 --folder inbox --json
wilma exams list --student 123456 --json
```

You can also pass a name fragment for `--student` (fuzzy match).

### Fetch data for all students
```bash
wilma news list --all-students --json
wilma messages list --all-students --folder inbox --json
wilma exams list --all-students --json
```

## Notes
- If no `--student` is provided, the CLI uses the last selected student from `~/.config/wilmai/config.json` (or `$XDG_CONFIG_HOME/wilmai/config.json`).
- If multiple students exist and no default is set, the CLI will print a helpful error with the list of students.
- If auth expires or the CLI says no saved profile, re-run `wilma` interactively or use `wilma config clear` to reset.

## Read commands
```bash
wilma messages read <id>
wilma news read <id>
```

## Actionability guidance (for parents)

Wilma contains a mix of urgent items and general info. When summarizing for parents, prioritize **actionable** items:

**Include** items that:
- Require action or preparation (forms, replies, attendance, permissions, materials to bring).
- Announce a deadline or time‑specific requirement.
- Describe a schedule deviation or noteworthy event (trips, themed days, school closures, exams).
- Refer to a date/time within the target window, or clearly imply it.
- Are broad bulletins (weekly/monthly) whose timestamp is close to the target window (they may contain relevant dates).

**De‑prioritize** items that:
- Are purely informational with no action, deadline, or schedule impact.
- Are generic announcements unrelated to the target period.

When in doubt, **include** and let the parent decide. Prefer a short, structured summary with dates and IDs.

## Scripts

Use `scripts/wilma-cli.sh` for a stable wrapper around the CLI.

## Links
- **GitHub:** https://github.com/aikarjal/wilmai
- **Website:** https://wilm.ai
