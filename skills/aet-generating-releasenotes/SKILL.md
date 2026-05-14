---
name: aet-generating-releasenotes
description: Automatically generate structured Release Notes from git diff, commits, PRs, Issues, and branches/tags. Triggers when user asks to generate release notes, version notes, changelog, or provides version/branch/tag information. Analyzes git log/diff by tag/branch range, fetches linked Issues/PRs, analyzes PR file changes, classifies changes, and extracts contributors.
---

# Release Notes Generator

This skill analyzes git log/diff by version tag or branch, fetches linked Issues and PRs merged to that version, analyzes file changes in each PR, classifies changes (new features, bug fixes, etc.), and generates structured Release Notes documents.

## Input Requirements

Accept the following inputs and analyze them together to generate Release Notes:

- Git diff/log by tag range: `git diff v1.0.0..v1.1.0`, `git log v1.0.0..v1.1.0`
- Git diff/log by branch: `git diff main..v1.0.0`, `git log develop..main`
- Git diff/log output: `git diff`, `git log`, or direct output
- PR/MR links: GitHub PR links, GitLab MR links (linked to this version/tag/branch)
- Issue links: GitHub Issues, GitLab Issues (linked to this version/tag/branch, with labels: feature, RFC, bug, enhancement, etc.)
- Direct commit messages: with any format (Angular style or custom)
- Manual input: New features, enhancements, bug fixes, contributors

The analysis process unifies all provided inputs - if user provides a specific type of input, use it; if not provided, skip it.

## Output Format

Generate Markdown formatted Release Notes with the following structure:

```markdown
# [Project Name] v[Version] Release Notes

Release Date: YYYY-MM-DD

## New Features & Enhancements
- [Feature 1]: Brief description
- [Feature 2]: Brief description
- [Enhancement 1]: Improvement details

## Bug Fixes
- [#issueID] Fix description
- [[PR#123]] Fix description

## Breaking Changes (only if present)
- [Change description]

## Deprecations (only if present)
- [Deprecation description]

## Performance Improvements (only if present)
- [Optimization description]

## Documentation (only if present)
- [Documentation changes]

## Contributors (only if present)
- contributor1
- contributor2

## Migration Guide (only if present, and if Breaking Changes exist)
- [Migration notes]

## Known Issues (only if present)
- [Outstanding issues]
```

### Required vs Optional Sections

**Required (always output if corresponding content exists):**
- New Features & Enhancements
- Bug Fixes

**Optional (output only if content exists):**
- Contributors
- Performance Improvements
- Documentation
- Migration Guide (only when Breaking Changes exist)
- Known Issues

## Analysis Process

### 1. Parse Input

**Git diff parsing:**
- Analyze file change types (added/modified/deleted)
- Identify affected modules/components
- Extract intent from commit messages (feat, fix, docs, refactor, perf, test, chore, break)

**Commit message convention (Angular style):**
- `feat:` New feature
- `fix:` Bug fix
- `enhance:`/`improvement:` Enhancement
- `docs:` Documentation
- `refactor:` Refactoring
- `perf:` Performance improvement
- `test:` Test related
- `chore:` Maintenance task
- `BREAKING CHANGE:` Breaking change
- `deprecate:` Deprecation

**Issue/PR content parsing:**
- Extract change type from title and description
- Link issue numbers
- Extract file changes from PR
- Parse issue labels: feature, RFC, bug, enhancement, etc.

### 2. Category Mapping

Map each change to corresponding section:

| Commit/Issue Type | Release Notes Section |
|-------------------|------------------------|
| feat, feature | New Features & Enhancements |
| fix, bug | Bug Fixes |
| enhance, improvement, RFC | New Features & Enhancements |
| refactor (perf related) | Performance Improvements |
| perf | Performance Improvements |
| docs | Documentation |
| BREAKING CHANGE | Breaking Changes |
| deprecate | Deprecations |
| test | (usually excluded) |
| chore | (usually excluded) |
| ci | (usually excluded) |

### 3. Content Generation Rules

Each entry should:
- Use imperative or third person, concise and impactful
- Keep under 50 characters
- Include relevant file/module name as context
- Bug fixes must include issue/PR link

**Examples:**

Input commit: `feat(auth): add JWT refresh token support`
Output: `- Added JWT refresh token mechanism for seamless token renewal`

Input commit: `fix(api): resolve null pointer in userService`
Output: `- [#123] Fixed null pointer exception in user service`

### 4. Contributor Extraction

Extract author information from commits:
- Git author name
- GitHub/GitLab username (if available)

### 5. Generate Document

Output sections in priority order (only output if content exists):

**Required (always output if content exists):**
1. New Features & Enhancements
2. Bug Fixes
3. Contributors

**Optional (output only if content exists):**
4. Breaking Changes
5. Deprecations
6. Performance Improvements
7. Documentation
8. Migration Guide (only when Breaking Changes exist)
9. Known Issues

## Usage Examples

### Example: Generate Release Notes

The skill performs the following analysis:

1. Parse target version from user input (e.g., v1.0.0 or release branch)
2. Identify previous tag/branch and fetch git log/diff (e.g., v0.9.0..v1.0.0 or main..v1.0.0)
3. Fetch Issues linked to this version/tag/branch (feature/bug/enhancement labels)
4. Fetch PRs/MRs merged to this version/tag/branch
5. Analyze file changes in each PR: modified files, additions, deletions
6. Classify changes: New Features, Bug Fixes, etc.
7. Extract contributors
8. Generate Release Notes document

**Input:**
```
Repository: https://github.com/myorg/myproject
Version: v1.0.0
```

**Output:**
```markdown
# MyProject v1.0.0 Release Notes

Release Date: 2024-01-15

## New Features & Enhancements
- Added user profile picture upload feature
- [#45] Added new authentication flow
- [RFC#78] Implemented new API design pattern

## Bug Fixes
- Fixed memory leak in data cache
- [#67] Fixed cache invalidation issue
- [PR#123] Resolved API timeout issue

## Performance Improvements
- Optimized database query for large datasets
- Reduced bundle size by 30%

## Documentation
- Updated API documentation
- Added migration guide

## Contributors
- John Doe
- Jane Smith
```

## Notes

1. **Concise content**: Keep each entry under 50 characters, focus on core value
2. **User-oriented**: Use user-understandable language, avoid technical details
3. **Version number**: Target version must be specified
4. **Links**: Bug fixes must include issue/PR link
5. **Optional sections**: Only output sections if corresponding content exists
6. **Required sections**: New Features & Enhancements, Bug Fixes always output if content exists

## Quality Check

Before outputting, verify:

1. **Version accuracy**: Is the target version correctly identified?
2. **Change classification**: Are all changes properly categorized?
3. **Duplicate removal**: Are there duplicate entries?
4. **Contributor completeness**: Have all contributors from commits, PRs, and Issues been captured?
5. **Link accuracy**: Are all referenced Issue/PR links valid?
6. **Content completeness**: Are all provided inputs analyzed?
7. **Format consistency**: Is the output format consistent with the template?

## Required Information

- Repository link
- Target version (e.g., v1.0.0 or release/1.0.0 branch)