---
name: aet-report-to-dashboard
description: Phase status reporting to visualization dashboard for tracking development progress.
---

# Phase Report

Report phase status (design/development/testing) to visualization dashboard for tracking development progress.

## Language Detection and Response

- Automatically detect the language of user input
- Respond in the same language as the user input

## When to Use

Use this skill when:
- Reporting phase start status to dashboard
- Reporting phase completion status to dashboard
- Tracking development progress visualization
- Pushing PRD project path to dashboard database

## Important: API Operations Must Use phase-report-api.js

### Commands

```bash
# Push PRD project path to dashboard (for PRD workflow)
node skills/aet-report-to-dashboard/scripts/platform/bin/phase-report-api.js prd-push-project --path "$(pwd)"

# Report phase status
node skills/aet-report-to-dashboard/scripts/platform/bin/phase-report-api.js phase-report --phase <phase> --issue <issue-number> [--status start|complete]
```

### Command Examples

```bash
# Push project path (for PRD workflow)
phase-report-api prd-push-project --path "$(pwd)"

# Report design phase start
phase-report-api phase-report --phase design --issue 123 --status start

# Report design phase complete
phase-report-api phase-report --phase design --issue 123

# Report development phase complete
phase-report-api phase-report --phase development --issue 123

# Report testing phase complete
phase-report-api phase-report --phase testing --issue 123
```

### Getting Help

```bash
phase-report-api --help
phase-report-api phase-report --help
phase-report-api prd-push-project --help
```

## Workflows

### 1. Check Project Configuration

**Step 1: Check Project Configuration**
- Check if `.aet/config.json` file exists
- If missing, respond: "Project configuration not found. Please initialize project configuration first."

### 2. Parse Request

Extract from user input:
- **Phase name**: design, development, or testing
- **Status**: start or complete (default: complete)
- **Issue number**: for reporting

### 3. Execute Phase Report

**Step 1: Parse Request**
- Extract: phase name, status, issue number

**Step 2: Execute Phase Report**
```bash
node skills/aet-report-to-dashboard/scripts/platform/bin/phase-report-api.js phase-report --phase <phase> --issue <issue-number> [--status start|complete]
```

**Step 3: Handle Response**
- If success: Confirm phase event was reported to dashboard
- If error: Report the error and suggest retry

### Typical User Input Examples

- "Report design phase start"
- "Report development phase complete"
- "Report testing phase completion"
- "design阶段开始上报"
- "development阶段完成上报"
- "testing阶段完成"

**Important**: Git commands should be executed separately by the model using standard git commands. The phase-report command only reports status to the dashboard and does not execute any git operations.