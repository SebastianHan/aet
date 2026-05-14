---
name: aet-developing-agent
description: |
  Development specifications for Agent/Skill/Command projects. Defines directory structure and development norms for commands/agents/skills.
  Use this skill when: (1) creating new agent/skill/command projects, (2) developing new agent/skill/command.
---

# Agent Developing

Development specifications for Agent/Skill/Command projects.

---

## Project Directory Structure

```
.
├── commands/                    # Command definitions (platform-agnostic)
│   ├── command-a.md
│   └── command-b.md
├── agents/                      # Agent definitions (platform-agnostic)
│   ├── agent-a.md
│   └── agent-b.md
├── skills/                      # Skill packages (platform-agnostic)
│   ├── skill-a/
│   │   └── SKILL.md
│   └── skill-b/
│       └── SKILL.md
├── .opencode/                   # OpenCode platform adapter
├── .claude/                     # Claude platform adapter
├── .codex/                      # Codex platform adapter
```

### Directory Purpose

| Directory | Purpose | Platform-Specific |
|-----------|---------|-------------------|
| `commands/` | Command templates | No |
| `agents/` | Agent definitions | No |
| `skills/` | Skill packages with SKILL.md | No |
| `.opencode/` | OpenCode platform adapter | Yes |
| `.claude/` | Claude platform adapter | Yes |
| `.codex/` | Codex platform adapter | Yes |

---

## Agent Development

### Agent File Format

```markdown
---
name: agent-name
description: Brief description of what this agent does and when to use it
mode: primary|subagent|all
tools:
  read: true|false
  write: true|false
  edit: true|false
  bash: true|false
  grep: true|false
  glob: true|false
permission:
  edit: allow|ask|deny
  bash:
    "*": ask|allow|deny
    "git status": allow
    "git push": ask
---

You are [ROLE]. Your expertise is [DOMAIN].

## Core Responsibilities

1. [PRIMARY RESPONSIBILITY]
2. [SECONDARY RESPONSIBILITY]

## Operating Principles

### Context First

Before taking action on any request:

1. **Identify what's missing** - What assumptions am I making?
2. **Ask targeted questions** - Be specific, prioritize by impact
3. **Confirm understanding** - Summarize before proceeding
4. **Respect overrides** - If user says "just do it", proceed with defaults

### Verification Loop

After completing any changes:

1. **Syntax Check** - Validate file syntax
2. **Functional Test** - Run relevant commands to verify behavior
3. **Permission Test** - Confirm access controls work as expected

## Workflow

1. **Understand** - Clarify requirements
2. **Plan** - Design approach
3. **Execute** - Implement
4. **Verify** - Validate results

## Common Tasks

[Examples with commands]
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent name (kebab-case) |
| `description` | Yes | Brief description with trigger scenarios |
| `mode` | No | `primary`/`subagent`/`all` (default `all`) |
| `tools` | No | Tool enable/disable config |
| `permission` | No | Permission config |
| `model` | No | Specified model (only if user explicitly requests) |
| `temperature` | No | 0.0-1.0 (only if user explicitly requests) |
| `maxSteps` | No | Max iterations |

### Agent Types

| Type | Mode | Tools | Typical Use |
|------|------|-------|------------|
| Builder | primary | all | Full development |
| Planner | primary | read, grep | Analysis and planning |
| Reviewer | subagent | read, grep | Code review |
| Executor | subagent | bash, read | System tasks |

### Risk Levels

| Level | Tools | Permission | Examples |
|-------|-------|------------|----------|
| 🟢 Safe | read, grep, glob | all write/bash = deny | Reviewers, analyzers |
| 🟡 Moderate | +write, edit | bash = deny, edit = ask | Doc writers, refactorers |
| 🟠 Elevated | +bash (patterns) | Specific allows only | Build agents, testers |
| 🔴 High | +bash (broad) | ask for all dangerous | DevOps, DB admins |

---

## Command Development

> **Warning**: Command name and skill name must not be the same, otherwise it will cause an infinite loop.

### Command File Format

```markdown
---
description: Brief description of what this command does
agent: agent-name (optional)
model: model-identifier (optional, only if user explicitly requests)
subtask: true|false
---

Command template with $ARGUMENTS placeholder
and other prompt content.

$ARGUMENTS will be replaced with user input.
```

### Template Features

| Feature | Syntax | Description |
|---------|--------|-------------|
| All arguments | `$ARGUMENTS` | User input as whole |
| Single argument | `$1`, `$2`, `$3` | Positional arguments |
| Shell output | `` !`command` `` | Inject command result |
| File reference | `@filename` | Include file content |

### Invoking Skills from Commands

Commands can invoke skills to delegate complex workflows:

```markdown
---
description: Brief description of what this command does
disable-model-invocation: true
---

Invoke the <skill-name> skill with the provided natural language arguments, then execute exactly as the skill presents.
```

- `disable-model-invocation: true` - Skips model invocation and directly loads the skill

### Example

```markdown
---
description: Create a new React component
agent: builder
---

Create a new React component named $ARGUMENTS with TypeScript support.
Include props interface and basic styling.
```

---

## Skill Development

### Step 1: Search for Existing Skills

> **Before developing a new skill, use `find-skills` to search for existing similar skills.**

Search sources:
- [skills.sh leaderboard](https://skills.sh/) — Browse popular skills ranking
- `npx skills find [query]` — CLI search command

### Step 2: Reuse Existing Skills

If a matching skill is found:

**Option A: Direct Reuse**

```bash
# Clone existing skill from GitHub
git clone --depth 1 --filter=blob:none --sparse <repo-url>
cd <repo> && git sparse-checkout set skills/<skill-name>

# Copy to project skills directory
cp -r <source>/skills/<skill-name> ./skills/
```

**Option B: Modify and Reuse**

If the existing skill doesn't fully match requirements, modify it:

1. Clone and copy to project
2. Adjust `SKILL.md` content based on requirements
3. Update trigger keywords and description
4. Test and verify the modified skill

### Step 3: Create New Skill

If no matching skill is found, use `skill-creator` to create a new one.

### Skill Directory Structure

```
skill-name/
├── SKILL.md              # Main file (required)
├── references/           # Reference documents (optional)
│   ├── detail-a.md
│   └── detail-b.md
├── templates/            # Template files (optional)
│   └── template.md
├── scripts/              # Script files (optional)
│   └── script.sh
└── agents/               # Subagent definitions (optional)
```

---

## Anti-Patterns

### Agent

- ❌ Tool overload (enabling all tools "just in case")
- ❌ Permission promiscuity (`bash: allow` without controls)
- ❌ Vague description ("Helps with coding tasks")
- ❌ Missing Context First section
- ❌ Skipping verification

### Command

- ❌ No description
- ❌ Overly complex templates
- ❌ Missing argument handling

### Skill

- ❌ SKILL.md > 1000 lines without progressive disclosure
- ❌ Unclear triggers
- ❌ Dependencies on external files not in skill package
