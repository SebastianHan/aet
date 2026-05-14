---
name: aet-reviewing-code
description: Comprehensive code review orchestrator - first runs security-check for vulnerability analysis, then runs aet-checking-bad-smell for bad smell detection, and synthesizes a unified review report with severity ratings and prioritized recommendations
---

## Language Detection and Response

Automatically detect the language of user input and respond in the same language.

## When to Use

Use this skill when:
- You need a full code review covering both security and code quality
- You want to audit a single file, a module, or an entire codebase
- You need a structured report with prioritized findings from both security and quality perspectives

---

## Workflow

### Step 1: Determine Review Scope

Determine the target from user input:

| Input Type | Scope |
|-----------|-------|
| Single file path | Review that file only |
| Directory path | Review all source files under that path |
| No path given | Review all non-test, non-vendor source files in the project |

Read the target files before proceeding.

### Step 2: Security Audit

Use the Skill tool to invoke the `security-check` skill on the target scope.

- The skill will identify sensitive points, load its reference guides, trace data flows, and produce a security findings list
- Wait for it to complete before proceeding to Step 3

### Step 3: Code Quality Inspection

Use the Skill tool to invoke the `aet-checking-bad-smell` skill on the same target scope.

- The skill will scan for bad smells, load its reference guides, and produce a quality findings list
- Run this after security-check completes (sequential, not parallel) to maintain focused analysis

### Step 4: Synthesize Unified Report

Combine both sets of findings into the output format below:

```markdown
# Code Review Report

## Executive Summary
- Files reviewed: N
- Total issues: N (Critical: X, High: X, Medium: X, Low: X)
  - Security issues: N
  - Code quality issues: N

## Security Findings
(From security-check, grouped by severity — Critical → High → Medium → Low)

## Code Quality Findings
(From aet-checking-bad-smell, grouped by severity — High → Medium → Low)

## Top Priority Recommendations
(5 most impactful fixes ordered by risk-to-effort ratio)
1. ...
2. ...
3. ...
4. ...
5. ...
```

### Step 5: Human Confirmation

After presenting the report, ask the user:
- Whether to generate detailed fix suggestions for any specific finding
- Whether to proceed with automated fixes for clearly low-risk items

---

## Severity Reference

| Level | Security Examples | Code Quality Examples |
|-------|------------------|----------------------|
| Critical | RCE, SQLi auth bypass, Deserialization RCE | — |
| High | Stored XSS, SSRF, Path Traversal, Auth bypass | Duplicated Code, Large Class, Long Method |
| Medium | CSRF, IDOR, Reflected XSS, Log leaks | Long Param List, Feature Envy, Deep Nesting |
| Low | Weak crypto, Info disclosure | Mysterious Name, Dead Code, Excessive Comments |
