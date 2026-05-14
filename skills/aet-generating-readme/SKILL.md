---
name: aet-generating-readme
description: Generate comprehensive README documentation for code repositories. Use this skill when the user wants to create, update, or improve a README.md file for any codebase. Triggers on requests like "generate README", "create repository documentation", "write README for this project", "add project documentation", or when analyzing a repository that lacks proper documentation. This skill analyzes codebase structure, reads existing docs if available, and produces polished README with project title, description, core challenges, core features, demo/screenshots, quick start, project structure, roadmap, and license sections. This skill generates bilingual README files (README.md in English and README_zh.md in Chinese) by default.
---

# README Generator

Generate high-quality bilingual README documentation (English and Chinese) for any code repository by analyzing the codebase and existing documentation.

## Key Requirements

1. **Bilingual Output**: Generate both English (README.md) and Chinese (README_zh.md) README files by default
2. **Image Support**: Check for images in figures/, images/, docs/images/ directories and include them with detailed descriptions
3. **Image Description Format**: Every image must have a 2-4 sentence description explaining what it shows, key elements visible, and how it helps users understand the project

## Workflow

### Step 1: Explore the Repository

Explore the repository structure to understand:
- What type of project this is (library, framework, application, CLI tool, documentation repo, etc.)
- Programming languages and frameworks used
- Main entry points and core modules
- Configuration files and build systems

Use bash `ls` command to list directory contents:
- List root directory to see all top-level files and folders
- List docs/ subdirectory to see all documentation categories
- List any subdirectories inside docs/ to understand documentation structure

Use glob and grep to find:
- Package.json, Cargo.toml, pom.xml, go.mod, requirements.txt (dependencies)
- README.md, CONTRIBUTING.md, docs/ (existing documentation)
- Makefile, Dockerfile, docker-compose.yml (build/deployment)
- src/, lib/, main/, app/ (source code directories)
- test/, tests/, spec/ (test directories)

**IMPORTANT**: Always verify directory existence by listing them. Do NOT assume or infer directories that may not exist.

### Check for Images (Required)

**You MUST check for images in the repository.** Look for image directories that may contain screenshots, diagrams, or architecture images:

- `figures/`, `images/`, `docs/images/`, `img/`, `assets/images/`
- Use `ls` to list these directories and note any existing image files (.png, .jpg, .svg, .gif)

For each image found:
1. Verify the image file exists
2. Note the relative path from repository root
3. Include in README using Markdown image syntax with detailed description

**Image Description Format** (REQUIRED for every image):
```markdown
![Image Title](path/to/image.png)

The image shows [what the image displays]. Key elements include [key features visible], which helps users understand [how this image aids comprehension].
```

Example:
```markdown
![Cangjie Architecture Overview](figures/architecture.png)

The architecture diagram illustrates the Cangjie compilation pipeline from source code to execution. It shows the compiler frontend parsing, type checking, and AST transformation, followed by the backend code generation targeting the runtime. This visual representation helps developers understand how their code flows through the system.
```

### Step 1.5: Fetch Repository Issues (Optional but Recommended)

If the user provides a GitHub repository URL or the repository is accessible:

1. **Fetch Issues with Feature Labels**: Use `gh` command or webfetch to retrieve issues with labels like:
   - `feature`, `enhancement`, `new feature`, `功能`, `需求`
   - `bug`, `fix`, `bugfix`
   - `documentation`, `docs`

2. **Extract Key Information from Issues**:
   - Feature requests → Use for Core Features and Roadmap sections
   - Bug reports → Use for Core Challenges section
   - Common pain points mentioned in issues → Use for Core Challenges
   - User suggestions → Use for additional Features or FAQ

3. **Reference Format**:
   ```
   Issue #123: [Feature] Add dark mode support
   - User requested dark mode for better night-time usage
   - Related to UI/UX enhancement
   ```

Example `gh` commands to fetch issues:
```bash
# Fetch feature requests
gh issue list --label "feature" --state all

# Fetch all enhancement issues
gh issue list --label "enhancement" --state all

# Fetch recent issues (last 20)
gh issue list --limit 20
```

If `gh` is not available, use webfetch to get issue content from GitHub URL:
- `https://github.com/{owner}/{repo}/issues?q=label%3Afeature+is%3Aissue`

### Step 2: Analyze Existing Documentation

If reference documents exist in the repository:
- Read existing README.md, CONTRIBUTING.md, docs/
- Extract key information: project name, description, features, setup instructions
- Use this as the primary source when available

If no documentation exists:
- Analyze source code to infer project purpose
- Look at main entry files for functionality hints
- Check package.json/name, Cargo.toml/package name, or similar for project identity

### Step 2.5: Check Existing README for Updates

If README.md already exists in the repository:

1. **Read the existing README.md** to understand current content structure
2. **Generate new README content** using Step 3
3. **Compare sections** between old and new:
   - Project name/title changed?
   - Description significantly different?
   - New features added or removed?
   - Installation/usage commands changed?
   - Structure/directories modified?
4. **Decision**:
   - If more than 30% of sections have significant changes → Update the README
   - If only minor changes (badges, typos, formatting) → Ask user if they want to update or skip
   - If no meaningful changes → Tell user "README is already up-to-date, no updates needed"

### Step 3: Generate README Content

**Generate both English (README.md) and Chinese (README_zh.md) versions.** Both versions should contain the same sections with appropriate translations.

Generate a comprehensive README with these sections. Only include sections that have relevant content from the repository analysis:

- **Title**: Project name from package.json, Cargo.toml, or directory name
- **Badges**: Build status, version, license, downloads, etc. (shields.io badges) - only if applicable
- **Description**: 2-3 sentences describing what the project does and its primary purpose
- **Core Challenges**: 3-5 bullet points on key problems this project solves
- **Core Features**: 5-10 key features with brief descriptions
- **Demo / Screenshots**: Include actual images if they exist in the repository (figures/, images/, etc.). Use Markdown image syntax: `![Alt text](path/to/image.png)`. **IMPORTANT**: Every image must include a detailed description paragraph immediately after the image. The description should explain:
  - What the image shows (UI screenshot, architecture diagram, flowchart, etc.)
  - Key elements or features visible in the image
  - How it helps users understand the project
  - Only add placeholder if no images are found but the project would benefit from visuals.

Example format for images with descriptions:
```markdown
![Project Dashboard Overview](docs/images/dashboard.png)

The dashboard displays real-time metrics including CPU usage, memory consumption, and network throughput. The main panel shows a line chart tracking performance over the last 24 hours, with filter controls at the top for selecting different time ranges and metric types.
```
- **Quick Start**: Prerequisites, installation commands, and basic usage examples
- **Configuration**: Only include if the project has environment variables or config files to document
- **API Reference**: Only for libraries/SDKs - key classes, functions, usage examples. Skip if not applicable
- **Project Structure**: Top-level directory structure with descriptions
- **Contributing**: Only include if there's a CONTRIBUTING.md or clear contribution guidelines
- **Changelog**: Only include if CHANGELOG.md exists in the repository
- **Roadmap**: 3-5 planned features or improvements (can be inferred or marked as TBD)
- **License**: License name and brief description (default to MIT if not specified)
- **Acknowledgments**: Only include if there are credits, related projects, or inspiration to mention
- **FAQ**: Only include if common questions can be identified from issues or docs

### Step 4: Adapt to Project Type

Based on the project type, adjust the README content:

1. **Library/SDK**: Focus on API, installation, usage examples, migration guides
2. **CLI Tool**: Show command examples, configuration options, terminal output
3. **Web Application**: Include deployment instructions, environment variables, screenshots
4. **Framework**: Highlight getting started, plugins/extensions, comparison with alternatives
5. **Infrastructure/DevOps**: Emphasize configuration, Kubernetes manifests, docker-compose

### Step 5: Write or Update README

**Generate BOTH English and Chinese README files.**

If README already exists and doesn't need updates:
- Tell user: "README.md and README_zh.md are already up-to-date with current project state. No significant changes detected."

If updates are needed or no README exists:
- Write README.md (English version) to the repository root
- Write README_zh.md (Chinese version) to the repository root
- Use clear markdown formatting
- Add table of contents for long READMEs
- **Image Placeholders**: Only add text placeholders like `[TODO: Add screenshot]` in sections that would genuinely benefit from images (UI screenshots, architecture diagrams, demo GIFs). Do not add placeholders for sections that don't need visuals.
- **Include images with descriptions**: If images are found in figures/, images/, etc., include them in BOTH versions with appropriate descriptions in each language

### Step 6: Post-Generation Validation

After writing the README, verify the output:

1. **Read the generated README.md** to confirm it was written correctly
2. **Check for completeness**:
   - All required sections are present
   - No empty sections without meaningful content
   - Placeholders are appropriate (only where needed)
3. **Verify accuracy** (CRITICAL):
   - Project name matches package.json/Cargo.toml/directory
   - Commands in Quick Start are valid and complete
   - **ALL directories listed in Project Structure MUST exist** - verify by listing them
   - **ALL features listed must be verifiable** - do not claim features that don't exist
   - **License information must match actual license file**
   - For documentation repos: verify docs/ subdirectories by actually listing them
   - For image references: verify image files exist before using them in Markdown

## Content Guidelines

**Generate both English (README.md) and Chinese (README_zh.md) versions.** Both versions should have the same sections with appropriate translations.

Only include sections that have relevant content from the repository analysis:

1. **Title**: Use project name from package.json, Cargo.toml, or derive from directory name
2. **Badges**: Add shields.io badges for build status, version, license, downloads - only if applicable
3. **Description**: 2-3 sentences, state what the project does, who it's for
4. **Core Challenges**: 3-5 bullet points on key problems solved
5. **Features**: List 5-10 key features with brief descriptions
6. **Demo / Screenshots**: Check for existing images in figures/, images/, docs/images/ directories. Use actual images if found. **Every image must have a detailed description** (2-4 sentences) explaining what the image shows, key elements visible, and how it helps users understand the project. If no images exist but the project would benefit from visuals, add placeholder with descriptive text. Include the same images in both English and Chinese README versions with language-appropriate descriptions.
7. **Quick Start**: Provide copy-pasteable commands
8. **Configuration**: Document env vars, config files, settings - only if applicable
9. **API Reference**: For libraries - key classes, functions, usage examples - skip if not a library
10. **Structure**: Show top-level directory structure with descriptions
11. **Contributing**: Include only if CONTRIBUTING.md exists or guidelines are clear
12. **Changelog**: Include only if CHANGELOG.md exists in repository
13. **Roadmap**: Include 3-5 planned features or improvements (can be inferred or marked as TBD)
14. **License**: Default to MIT if not specified, or state "See LICENSE file"
15. **Acknowledgments**: Include only if there are credits, related projects (optional)
16. **FAQ**: Include only if common questions can be identified (optional)

## Language Requirements

Write in a professional, substantive style that avoids generic AI-generated language:

1. **Avoid overused phrases** such as:
   - "seamlessly", "effortlessly", "powerful", "robust", "cutting-edge"
   - "revolutionize", "game-changing", "state-of-the-art"
   - "simple", "easy", "just", "basic" (when describing complex things)
   - Generic superlatives without evidence

2. **Use concrete descriptions**: Replace generic claims with specific technical details
   - Instead of: "Powerful CLI tool for X"
    Write: "Command-line interface supporting subcommands for X operations"
   - Instead of: "Seamlessly integrates with X"
    Write: "Provides adapter interface for X with connection pooling and retry logic"

3. **Provide substantive information**: Each section should contain meaningful details
   - Description section: specific use cases, target users, problem domain
   - Features section: what each feature does and why it matters
   - Quick Start section: complete working commands with expected outputs

4. **Be specific about capabilities**: Don't use vague language
   - Avoid: "Supports multiple formats"
   - Write: "Supports CSV, JSON, and Parquet formats with automatic schema inference"

## Markdown Format Requirements

Ensure the output strictly follows Markdown best practices:

1. **Headings**: Use ATX-style (# ## ###) with proper nesting
   - Single H1 (title) at top
   - H2 for major sections
   - H3 for subsections
   - No skipping heading levels

2. **Lists**: Use consistent formatting
   - Unordered lists: use hyphen (-) not asterisk (*)
   - Ordered lists: use period (1. 2. 3.) not parentheses
   - Indent subordinate items with 2 spaces
   - Add blank line before and after lists

3. **Code blocks**: Properly format all code
   - Use fenced code blocks (```) with language identifier
   - Use inline code (`) for commands, paths, short values
   - Add blank line before and after code blocks
   - Use consistent indentation (2 or 4 spaces)

4. **Links**: Use proper Markdown link syntax
   - `[text](url)` for external links
   - `[text](#anchor)` for internal links
   - Use descriptive link text, avoid "click here"

5. **Tables**: Use proper table syntax with alignment
   - Include header row with dashes
   - Use pipe (|) as column separator
   - Ensure columns align properly

6. **Emphasis**: Use appropriate emphasis
   - **Bold** for UI elements, directory names, important terms
   - *Italic* for book titles, new concepts, emphasis
   - `Code` for file paths, commands, technical values

## Final Checklist

Before completing, verify all of the following:

1. **Content Completeness**
   - [ ] Title section present and accurate (in both English and Chinese)
   - [ ] Description provides clear project overview (2-3 sentences minimum) in both languages
   - [ ] Core Challenges section addresses real user problems (consider using bug reports from Issues)
   - [ ] Core Features section lists actual features with descriptions (consider using feature requests from Issues)
   - [ ] Quick Start includes working commands
   - [ ] Project Structure reflects actual directory layout
   - [ ] Issues/feature requests have been considered for Roadmap section
   - [ ] Both README.md (English) and README_zh.md (Chinese) are generated

2. **Markdown Quality**
   - [ ] All headings use ATX-style (#)
   - [ ] Lists use consistent bullet characters (- or 1.)
   - [ ] Code blocks have language identifiers
   - [ ] No bare URLs (use link syntax)
   - [ ] Tables properly formatted

3. **Language Quality**
   - [ ] No generic AI phrases detected
   - [ ] Descriptions are specific and technical
   - [ ] Feature descriptions explain what and why
   - [ ] Commands produce expected outputs

4. **Accuracy**
   - [ ] Project name matches package.json/Cargo.toml/directory
   - [ ] Installation commands are valid and complete
   - [ ] File paths in structure section exist
   - [ ] License information correct

5. **User Experience**
   - [ ] Table of contents added for long READMEs (>200 lines)
   - [ ] Placeholders only where images genuinely needed
   - [ ] Sections ordered logically
   - [ ] All images have detailed descriptions (2-4 sentences explaining what they show)
   - [ ] Images included in both English and Chinese versions with appropriate descriptions
   - [ ] Both README.md and README_zh.md have consistent sections

## Edge Cases

- If repository has extensive docs already: Create a summary README that links to them
- If project is a monorepo: Create separate READMEs for each package or one overview README
- If project is private/enterprise: Omit sensitive URLs, use placeholder descriptions
- If no clear project identity: Use directory name as project name with generic description

## Tools

Use these tools as needed:
- glob: Find relevant files (package.json, README.md, source directories)
- grep: Search for key information in files
- read: Read existing documentation and key source files
- write: Create both README.md and README_zh.md files

## Report to User

After completion, report:
- "README.md and README_zh.md have been successfully generated/updated at [path]"
- List the sections included in the README
- Mention any placeholder areas that need manual completion (e.g., `[TODO: Add screenshot]`)
- Note any assumptions made during generation
- List images included and their descriptions