---
name: aet-diagnosing-bug
description: Systematic bug diagnosis skill - reproduces bugs, traces root causes, identifies affected files, and produces a structured diagnosis report for fix planning
---

## Language Detection and Response

### Language Detection
- Automatically detect the language of user input

### Response Language Matching
- Respond in the same language as the user input

## When to Use

Use this skill when:
- You need to systematically diagnose a bug before fixing it
- You need to identify root cause and all affected files
- You need a structured diagnosis report to feed into fix planning
- Called from the `aet-bugfix` agent workflow

## Input

This skill accepts:
- Bug description (from issue or direct input)
- Error messages, stack traces, logs
- Reproduction steps (if available)
- Feature folder path (if exists)

## Output

A structured **Diagnosis Report** containing:
- Bug summary
- Root cause analysis
- Affected files list with specific locations
- Impact assessment
- Recommended fix direction

## Diagnosis Workflow

### Phase 0: Vulnerability Identifier Detection (CVE)

**Before starting standard diagnosis, check if the input contains vulnerability identifiers.**

1. **Detect Vulnerability Identifiers**
   - Scan input for patterns: `CVE-YYYY-NNNNN`
   - Also check for references like "漏洞编号", "vulnerability ID", "security advisory"

2. **If Vulnerability ID Found**:
   - Run the vulnerability info fetcher script:
     ```bash
     node skills/bug-diagnosis/scripts/vulinfo.js --id <vulnerability-id> 
     ```
   - Parse the output and use web search tool to figure out:
     - Vulnerability description and severity
     - Affected products/versions/components
     - Known attack vectors
     - Recommended remediation from advisory

3. **Cross-Reference with Local Code**:
   - Match affected products/libraries against project dependencies (package.json, requirements.txt, pom.xml, go.mod, etc.)
   - Check if the vulnerable version is in use
   - Search local codebase for the vulnerable code patterns described in the CVE
   - Identify specific files and functions that match the vulnerability pattern

4. **Proceed to Phase 1** with enriched context from the vulnerability database

   > If vulnerability ID is NOT found in input, skip directly to Phase 1.

### Phase 1: Bug Understanding

1. **Parse Bug Description**
   - Extract: error messages, stack traces, expected vs actual behavior
   - Identify: affected component, trigger conditions, environment info
   - Note: any reproduction steps provided
   - If CVE/vulnerability info was fetched in Phase 0, incorporate that context

2. **Reproduce the Bug**
   - Follow reproduction steps if provided
   - If no steps: attempt to reproduce based on description
   - For security vulnerabilities: use safe reproduction methods (do NOT exploit in production)
   - If cannot reproduce: ask user for more details using Question tool
   - Record exact reproduction steps and observed behavior

3. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - Read stack traces completely
   - Note line numbers, file paths, error codes
   - They often contain the exact location of the problem

### Phase 2: Root Cause Localization

1. **Check Recent Changes**
   - Use `git log` and `git diff` to identify recent changes
   - Look for changes related to the affected component
   - Check for new dependencies, config changes

2. **Trace Data Flow**
   - Start from the error/symptom point
   - Trace backward through the call stack
   - For each step: Where does the bad value originate?
   - Keep tracing until you find the source

3. **Gather Evidence in Multi-Component Systems**
   - For each component boundary:
     - What data enters the component?
     - What data exits the component?
     - Where does the data transform incorrectly?
   - Run diagnostics to determine WHERE exactly it breaks

4. **Find Working Examples**
   - Locate similar working code in the same codebase
   - Compare working vs broken code
   - Identify all differences, however small

5. **Pinpoint Root Cause**
   - Form hypothesis: "The root cause is X because Y"
   - Verify with evidence (logs, code analysis, test results)
   - Distinguish between root cause and symptoms

### Phase 3: Affected Files Analysis

1. **Direct Impact Files**
   - Files containing the bug (root cause location)
   - Files where the fix needs to be applied

2. **Indirect Impact Files**
   - Files that depend on the buggy code
   - Files that may need adjustment after the fix
   - Test files that cover the affected code

3. **For Each Affected File, Document:**
   - File path
   - Specific lines/functions affected
   - Type of change needed (fix, adjust, test update)
   - Priority (critical/secondary/optional)

### Phase 4: Diagnosis Report Generation

Generate a structured diagnosis report:

```
## Bug Diagnosis Report

### Bug Summary
- Description: [concise bug description]
- Severity: [critical/high/medium/low]
- Reproducible: [yes/no/intermittent]
- Reproduction Steps: [steps]

### Root Cause Analysis
- Root Cause: [specific technical explanation]
- Evidence: [how we know this is the root cause]
- Category: [logic error / data issue / config error / race condition / etc.]

### Affected Files
| File | Location | Change Type | Priority |
|------|----------|-------------|----------|
| path/to/file.ts | function/line | fix | critical |
| path/to/other.ts | function/line | adjust | secondary |
| path/to/test.ts | test case | test update | required |

### Impact Assessment
- Scope: [how many components/features affected]
- Risk: [risk level of the fix]
- Regression Potential: [areas that could regress]

### Recommended Fix Direction
- [High-level description of the recommended approach]
- [Alternative approaches if applicable]
```

### Phase 5: User Confirmation

1. Present the diagnosis report to the user
2. Use Question tool: "Does this diagnosis match your understanding of the bug? Do you have additional context?"
3. If user provides corrections or additional info:
   - Return to relevant phase to re-analyze
   - Update the diagnosis report
   - Present again for confirmation

## Integration with Systematic Debugging

This skill builds upon the methodology:
- Phase 0 is a new addition for vulnerability-specific diagnosis
- Phase 1-2 correspond to Phase 1 (Root Cause Investigation)
- Phase 2 includes Phase 2 (Pattern Analysis)

## Scripts

- **`scripts/vulinfo.js`** - Fetches vulnerability information from public databases (CVE/CNVD/CNNVD). Used in Phase 0 when vulnerability identifiers are detected in the input.

## Red Flags - Return to Earlier Phase

- Proposing fixes before completing root cause analysis
- Skipping reproduction step
- Assuming root cause without evidence
- Missing affected files in the analysis
- Confusing symptoms with root cause
- For CVE-based bugs: skipping vulnerability info fetching and going straight to code analysis