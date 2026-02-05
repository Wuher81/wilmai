---
name: wilma
description: Use the Wilma CLI to fetch kids, messages, news, and exams for Finnish Wilma accounts. Trigger this skill when an agent needs Wilma data or must run non-interactive CLI commands with JSON output.
---

# Wilma Skill

## Overview

Wilma is the Finnish school information system used by schools and municipalities to share messages, news, exams, attendance, and other student-related updates with parents/guardians.

Use the `wilma` / `wilmai` CLI in non-interactive mode to retrieve Wilma data for AI agents. Prefer `--json` outputs and avoid interactive prompts.

## Quick start

1. Ensure the user has run the interactive CLI once to create `.wilmai/config.json`.
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
- If no `--student` is provided, the CLI uses the last selected student from `.wilmai/config.json`.
- If multiple students exist and no default is set, the CLI will print a helpful error with the list of students.

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
