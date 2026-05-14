---
name: aet-implementing-requirement
description: Independent implementation phase skill - executes design specifications into working solutions
---

## Language Detection and Response

### Language Detection
- Automatically detect the language of user input

### Response Language Matching
- Respond in the same language as the user input
- For actual implementation work (coding, documentation writing, etc.), use the language appropriate for the project context

## When to Use

Use this skill when:
- You have an approved design document
- You need to implement features, bug fixes, or code changes
- You need to turn specifications into working code

## Input

This skill accepts:
- Design document path
- Implementation plan path
- Feature folder path for context storage

Check for design specifications:
- For feature development: `.aet/features/{feature-name}/`
- For non-feature tasks: `.aet/{task-id}/`

## Output Location

Based on task type, save to:
- **Code**: Appropriate directories based on project structure
- **Tests**: Test directories following project organization
- **Documentation**: Relevant documentation directories
- **Configuration**: Update or create configuration files as needed

**Feature development**: Output to `.aet/features/{feature-name}/implementation/`
**Non-feature task**: Output to `.aet/{task-id}/implementation/`

File naming: `{YYYYMMDD-HHMMSS}-{description}.md`

## Implementation Workflow

See [WORKFLOW.md](./WORKFLOW.md) for detailed implementation workflow steps.