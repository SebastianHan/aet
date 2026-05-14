---
name: aet-generating-manual
description: |
  Generate user manual documentation from codebase information. Two trigger scenarios:
  1. User manual generation: installation and configuration guide, feature usage, troubleshooting (all types or specific type)
  2. Generate documentation from Issue link: parse Issue content and generate corresponding user manual documentation
  This skill analyzes the codebase (code, design docs, README, issues, wiki, supports Gitee/AtomGit/GitHub) to generate comprehensive user manuals. Output documents to local file path.
---

# User Manual Generator

## Overview

This skill generates comprehensive user manual documentation from information extracted from the codebase. It can produce multiple document types in markdown format based on user requirements.

## When to Use

Use this skill when users request:
- User manual generation (all types or specific type)
- Installation or setup guides
- Feature usage tutorials or operation guides
- Troubleshooting guides or FAQ documents
- Generate documentation from Issue link
- Updating existing user documentation

## Workflow

### Step 0: Pre-check - Detect Existing Documentation

Before generating new documentation, first check if requested document type already exists:

1. Search common documentation locations:
   - `docs/` directory
   - `documents/` directory
   - Root directory for `README.md`, `INSTALL.md`, `TROUBLESHOOTING.md`, `{feature-name}.md`

2. Match against requested document types:
   - Installation guide → `installation.md`, `INSTALL.md`, `docs/installation.md`
   - Feature usage → `{feature-name}.md`, `docs/{feature-name}.md`
   - Troubleshooting → `troubleshooting.md`, `TROUBLESHOOTING.md`, `docs/troubleshooting.md`

3. If existing document found:
   - Compare with current codebase to determine if update is needed
   - Present findings to user and ask whether to update
   - If update needed, proceed with Scenario 1 using existing document as base
   - If no update needed, inform user and skip generation

### Scenario 1: User Manual Generation (All Types or Specific Type)

Triggered when user requests user manual generation (all or specific types).

#### Determine Document Types

Based on user request, determine the document types to generate:

| Request Content | Documents to Generate |
| :--- | :--- |
| User manual generation | All types (Installation + All Feature Docs + Troubleshooting) |
| Installation guide / Install / Setup | Installation guide only (installation.md) |
| Feature usage / How to use / Tutorial | Feature usage guides only |
| Troubleshooting / FAQ / Common issues | Troubleshooting document only |
| Specific feature name | That specific feature's document only |

#### Collect Codebase Information

Search and analyze the following sources:

1. **Code Files**: Read relevant source code to understand functionality
2. **Design Documents**: Search the entire repository for architecture docs, design specs, and technical specifications (e.g., DESIGN.md, architecture/, design/, *.md files with "design", "architecture", "spec" in the name)
3. **README**: Use as reference for setup and usage if available
4. **Existing Documentation**: Check docs/, documents/ folders
5. **Install Scripts**: Read install.sh, setup.sh, postinstall.mjs, Makefile - these often contain the latest/correct installation steps (MUST READ even if INSTALL.md exists)
6. **package.json**: Check scripts field for build/test/install commands
7. **Issue Tracker**: Check issues with "feature" label for feature requirements and implementation details (includes local files and remote API)
   - **Local**: Search for files containing "feature", "enhancement" in file names or content
   - **Gitee**: Use GitLab CLI (`glab`) or API (e.g., https://gitee.com/api/v5/repos/{owner}/{repo}/issues)
   - **AtomGit**: Fetch via API (e.g., https://atomgit.com/api/v5/repos/{owner}/{repo}/issues)
   - **GitHub**: Use GitHub CLI (`gh`) or API (e.g., https://api.github.com/repos/{owner}/{repo}/issues)
   - **Remote**: Use Bearer token for API authentication
   - Look for CHANGELOG.md or RELEASE_NOTES.md that document implemented features

   **For each feature Issue found, also check linked PRs/MRs**:
   - Check Issue's `pull_request` field for merged/closed PRs
   - Search for PRs referencing the Issue (in title, body, or commits)
   - Fetch PR diff/files to understand implementation details: `/pulls/{number}/files`
   - Extract code changes, new APIs, config options from PR content
8. **Wiki**: Extract usage instructions and guides (includes local exports and online wiki)
   - **Local**: Check if wiki content is exported locally
   - **Gitee**: Online wiki
   - **AtomGit**: Online wiki
   - **GitHub**: Online wiki
9. **Configuration Files**: Find config examples, environment variables
10. **Test Files**: Extract usage examples

#### Information Consistency Verification

After collecting codebase information and before generating documentation, verify key information for consistency:

1. **Repository URL Verification**:
   - Search all possible repository URL references (e.g., repository.url in package.json, URLs in documentation, clone addresses in install scripts)
   - Compare URLs from multiple sources and ensure consistent correct address is used
   - If inconsistencies found, prefer the address used in existing user documentation or official maintained docs

2. **Configuration Location Verification**:
   - Verify correct location for configuration files (e.g., .env vs .opencode/*.jsonc)
   - If multiple configuration locations exist, prefer references from existing user documentation

3. **Commands and Paths Verification**:
   - Verify correct format for installation commands (e.g., npm install vs install.sh)
   - Verify path references are correct

### Scenario 2: Check Existing Documentation

Triggered when determining that the requested document type already exists in the codebase.

#### Detect Existing Documents

1. Search for documentation files in common locations:
   - `docs/` directory
   - `documents/` directory
   - Root directory (e.g., `README.md`, `INSTALL.md`, `TROUBLESHOOTING.md`)
   - `{feature-name}.md` files for feature-specific documentation

2. Match against requested document types:
   - Installation guide → `installation.md`, `INSTALL.md`, `docs/installation.md`
   - Feature usage → `{feature-name}.md`, `docs/{feature-name}.md`
   - Troubleshooting → `troubleshooting.md`, `TROUBLESHOOTING.md`, `docs/troubleshooting.md`

#### Determine Update Requirement

If existing document is found:
1. Compare the existing document with current codebase information
2. Check if significant updates are needed (new features, changed APIs, configuration changes)
3. Present findings to user and ask whether to update

**Update Decision Criteria:**
- Major changes (new features, API changes, new dependencies) → Recommend update
- Minor changes (bug fixes, text improvements) → Ask user preference
- No significant changes → Inform user, no update needed

### Scenario 3: Generate Documentation from Issue Link

Triggered when user provides an Issue link.

#### Fetch and Analyze Issue

1. Parse Issue link to determine codebase and Issue number
2. Fetch Issue content via API
3. Analyze Issue labels, confirm if it's a "feature" label
4. Determine if Issue content requires generating user manual documentation

**Decision Rules:**
- If Issue involves user-facing features/config/operations → generate documentation
- If Issue is internal-only (refactor, performance, backend-only) → skip, notify user
- If unclear → ask user to confirm

#### Collect Codebase Context

When generating documentation from an Issue, **always** also collect relevant codebase information to provide proper context:

1. **Code Files**: Read relevant source code files related to the Issue
2. **Design Documents**: Check for existing design specs or architecture docs related to the feature
3. **README**: Reference setup and usage information if available
4. **Existing Documentation**: Check docs/ folder for related feature documentation
5. **Install Scripts**: Read install.sh, setup.sh if installation is involved
6. **package.json**: Check scripts for build/test commands
7. **Test Files**: Extract usage examples from tests
8. **Configuration Files**: Find config examples and environment variables

**This is critical** - the Issue provides the feature requirements, but the codebase provides the implementation details needed for accurate documentation.

#### Fetch Related PR/MR

After confirming documentation is needed, fetch related Pull Requests/Merge Requests to understand the complete implementation:

1. **Find linked PRs/MRs**:
   - Check Issue's `pull_request` field (if merged/closed)
   - Search for PRs/MRs that reference this Issue (in title or body)
   - API: `https://atomgit.com/api/v5/repos/{owner}/{repo}/issues/{number}/comments` (may contain PR links)

2. **Fetch PR/MR content**:
   - Get PR title, description, and changed files
   - API: `https://atomgit.com/api/v5/repos/{owner}/{repo}/pulls/{number}`
   - Get diff/patch: `https://atomgit.com/api/v5/repos/{owner}/{repo}/pulls/{number}/files`

3. **Analyze code changes**:
   - Identify new files added
   - Identify modified files and key changes
   - Extract configuration changes, API additions, UI components, etc.
   - Look for test files to understand usage patterns

4. **Extract implementation details**:
   - New configuration options and environment variables
   - New API endpoints or changes
   - Database schema changes
   - New dependencies added

**This is critical** - the Issue provides feature requirements, but the PR/MR provides the actual implementation code and changes needed for accurate documentation.

#### Generate Issue-based Documentation

If required:
1. Parse Issue requirements (background, requirements, API, usage, etc.)
2. Use codebase context to understand actual implementation
3. Generate corresponding document content with accurate details
4. Add as sub-section to corresponding feature document, or create new document

### Step 3: Structure Documentation

Organize content into appropriate sections:

#### Installation Guide
- System requirements
- Required dependencies and versions
- Environment variables
- Prerequisites
- Installation methods
- Step-by-step installation guide
- Initial configuration
- Verification steps

#### Feature Usage Guide (multiple docs supported)
- For each major feature identified in the codebase, generate a separate document
- Each document includes:
  - Description and purpose
  - Prerequisites
  - Usage instructions with examples
  - Configuration options
  - API references if applicable
- If user specifies particular features, generate docs for those only; otherwise generate docs for all major features

#### Troubleshooting
- Common issues and solutions
- Error messages and their meanings
- Debug tips
- FAQ section

### Step 4: Handle Images

Analyze whether the generated document needs images:

**Determine if images are needed:**
- Images are needed when content involves UI display, operation flows, architecture diagrams
- Content that can be clearly expressed with text alone does not need images

**Image handling:**
- **Use existing images**: If screenshots or diagrams exist in the codebase or Issue, search for matching image files (e.g., ./images/, ./docs/images/, ./*.png, ./*.jpg), reference with correct path
- **Placeholder for missing images**: If no matching images exist in codebase, add clear placeholder in bold with detailed description:

> **TODO: Add screenshot - [Describe what this image should show in this context, including where the image appears in the document, the preceding content that leads into it, and the content that follows]**

### Step 5: Document Writing Style

When generating documentation, ensure the description style is detailed and easy to understand:

- **Avoid overly brief descriptions**: Each section should have sufficient context and explanation
- **Provide background information**: Explain why this step is needed and what problem it solves
- **Connect content**: Use transitional phrases to link sections (e.g., "Based on the above...", "Following this step...", "Next, we will...")
- **Include examples**: Show practical examples with command outputs and expected results
- **Explain consequences**: Describe what happens after each action
- **Use consistent terminology**: Maintain consistent terminology throughout the document
- **Add context**: Before each major section, briefly introduce what will be covered and why it matters

Each section description should be 2-4 sentences that provide context, purpose, and connection to help readers understand the flow of the document.

### Step 6: Generate Output Files

Generate all requested documents in markdown format. Save to local file path as requested by user.

**File naming conventions:**
- Software installation → `installation.md`
- Feature usage guide → `{feature-name}.md` (one document per major feature)
- Troubleshooting → `troubleshooting.md`

**Handling Issue-generated content:**
- If content is generated from an Issue, add it as a new section to the corresponding feature document
- If corresponding feature document doesn't exist, create a new document

Each document should:
- Have clear hierarchical structure (H1 for title, H2 for sections, H3 for subsections)
- Include practical examples where applicable
- Have table of contents if document is long
- Use consistent formatting

### Step 7: Handle Insufficient Information

If certain information is not available in the codebase:
- Use reasonable assumptions based on common practices for that type of software
- Mark uncertain information clearly with: `> **Note:** [Information based on typical patterns, please verify]`
- Skip the section if absolutely no information can be reasonably inferred
- Clearly indicate in the document which sections are based on assumptions

### Step 8: Quality Check

Before presenting output, verify:
- [ ] All sections are complete and well-structured
- [ ] Code examples are accurate and functional
- [ ] Instructions are clear and actionable
- [ ] Image requirements have been analyzed and handled correctly (use real images or add placeholders)
- [ ] Placeholder images are clearly marked with descriptions
- [ ] Cross-references between documents are accurate
- [ ] Language is clear and consistent
- [ ] Assumptions are clearly marked when information is insufficient
- [ ] **Information Consistency**: Key information (repository URLs, configuration locations, command formats) is consistent throughout the document

## Output Format

Output should be in markdown format with proper heading hierarchy, code blocks for examples, and tables for structured information. Save to local file path as specified by user.