---
name: aet-testing-agent
description: |-
  Test Agent/Skill/Command projects using OpenCode CLI patterns. Use for verifying newly developed agents, commands, and skills work correctly before PR submission. Make sure to use this skill after completing agent/skill/command development to validate functionality and catch errors early.

  Examples:
  - user: "Test the new agent I created" → run discovery and functional tests
  - user: "验证这个 command 是否正常工作" → test command loading and skill invocation
  - user: "帮我测试下这个 skill" → verify skill discovery and invocation patterns
  - user: "开发完成后需要做什么" → invoke this skill for post-development validation
---

# Agent Test-Driven

Testing patterns for Agent/Skill/Command projects using OpenCode CLI.

---

## Core Command

```bash
opencode run "[test-input]" --format json 2>&1
```

---

## Discovery Testing

Before testing functionality, verify the target exists:

### Agent Discovery

```bash
opencode run "test" --agent [agent-name] 2>&1
```

| Result | Output Contains |
|--------|----------------|
| **PASS** (exists) | No "not found" message |
| **FAIL** (not exists) | `agent 'xxx' not found. Falling back to default agent` |

### Command Discovery

```bash
opencode run "/[command-name]" 2>&1
```

| Result | Output Contains |
|--------|----------------|
| **PASS** (exists) | `→ Skill` or successful execution |
| **FAIL** (not exists) | `Unknown command. Try /help` |

### Skill Discovery

```bash
opencode run "[skill-name] skill 是否存在？" 2>&1
```

| Result | Output Contains |
|--------|----------------|
| **PASS** (exists) | `存在` / `exists` |
| **FAIL** (not exists) | `不存在` / `doesn't exist` |

---

## Functional Testing

### Test Agent

```bash
opencode run "hello" --agent [agent-name] --format json 2>&1
```

Verify: Non-empty response, no errors

### Test Command

```bash
opencode run "/[command-name]" --format json 2>&1
```

Verify: `→ Skill "[skill-name]"` appears in output

### Test Skill Invocation

```bash
opencode run "使用 [skill-name] skill 完成 [task]" --format json 2>&1
```

Verify: `tool_use` with `tool="skill"` and `Loaded skill: [name]`

---

## Error Pattern Reference

| Component | Failure Pattern |
|-----------|----------------|
| Agent | `agent 'xxx' not found. Falling back to default agent` |
| Command | `Unknown command. Try /help for available commands.` |
| Skill | `技能 "xxx" 不存在。请从可用技能列表中选择一个...` |

---

## Test Report

After testing, summarize results:

```
## Test Report: [Component]

| Test | Status | Evidence |
|------|--------|----------|
| Discovery: agent | PASS/FAIL | [output snippet] |
| Discovery: command | PASS/FAIL | [output snippet] |
| Discovery: skill | PASS/FAIL | [output snippet] |
| Functional: [test] | PASS/FAIL | [output snippet] |

**Summary**: X tests, Y passed, Z failed
```

---

## Quick Test Sequence

```bash
# 1. Discovery check
opencode run "/[command]" 2>&1 | grep -i "unknown command" && echo "FAIL" || echo "PASS"

# 2. Skill loaded check
opencode run "/[command]" --format json 2>&1 | grep "Loaded skill" && echo "PASS" || echo "FAIL"
```
