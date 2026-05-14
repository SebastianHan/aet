---
name: aet-setup-config
description: Initialize project configuration for AET. Creates .aet/config.json with repository information (upstream/fork). Token is configured in global config (~/.aet/config.json). Use when setting up a new project or when project configuration is missing.
---

# Configuration Setup

Initialize project configuration for AET system. Creates project-level configuration (.aet/config.json) with repository information (upstream/fork). Token and platform credentials are configured in global config (~/.aet/config.json) during AET installation.

## Language Detection and Response

### Language Detection
- Automatically detect the language of user input

### Response Language Matching
- Respond in the same language as the user input

## When to Use

Use this skill when:
- Setting up a new project for aet development
- Project configuration (.aet/config.json) is missing or needs to be recreated
- Have already forked the repository and cloned it locally
- Global config (~/.aet/config.json) already exists with Token configured

## Workflow Execution Steps

When executing this skill, follow these steps precisely:

### 1. Check Global Configuration
- Check if global config exists at `~/.aet/config.json`:
  ```bash
  ls -la ~/.aet/config.json
  ```
- If global config does NOT exist:
  - Exit with message: "Global configuration not found. Please run AET installation first to initialize global config (~/.aet/config.json)."
  - Suggest: "Run: bash scripts/install.sh or scripts/init-global-config.sh"

### 2. Check Existing Project Configuration
- Check if `.aet/config.json` exists in current project:
  - **Important**: Use `ls -la .aet/config.json` or `test -f .aet/config.json` command. DO NOT use Glob tool.
- If project configuration exists, ask if user wants to overwrite:
  - Question: "Project configuration file already exists. Overwrite?"
  - Options: "Overwrite existing configuration", "Keep existing configuration and exit"
- If user chooses to keep existing configuration, exit the skill with a message.

### 3. Check Git Repository and Get Fork Information
- Check if current directory is a git repository:
  - If not a git repository, exit with error message: "Current directory is not a git repository. Please clone your fork first."
- Get origin remote URL:
  ```bash
  git remote get-url origin
  ```
  - If origin remote doesn't exist, exit with error message: "No 'origin' remote found. Please ensure you have cloned your fork repository."
- Parse origin URL to extract fork owner and repository name using JavaScript regex patterns:
  - SSH pattern: `git@[^:]+:([^/]+)/([^/.]+)(?:\.git)?`
  - HTTPS pattern: `https?://[^/]+/([^/]+)/([^/.]+)(?:\.git)?`
- If parsing fails, ask user to enter fork owner and repository name manually.
- Auto-detect platform type from origin URL:
  - Extract hostname from URL (e.g., gitcode.com, github.com, gitlab.com)
  - Map to platform type: gitcode.com -> gitcode, github.com -> github, gitlab.com -> gitlab
  - Default to gitcode if hostname not recognized.

### 4. Upstream Repository Configuration
- Check if Token is configured for the detected platform in global config:
  ```bash
  cat ~/.aet/config.json | jq -r '.codePlatform.platforms.<platform>.token'
  ```
- If Token is configured (not empty):
  - Run the upstream resolver script (Token is read automatically from global config):
    ```bash
    node skills/config-setup/scripts/upstream-resolver.js \
      --platform "<platform>" \
      --owner "<fork-owner>" \
      --repo "<fork-repo>"
    ```
  - Parse the JSON output from the script.
  - If successful, display detected upstream info (is_fork, upstream_owner, upstream_repo).
  - If the repo is a fork, add upstream remote:
    ```bash
    git remote get-url upstream 2>/dev/null || git remote add upstream <upstream-url>
    ```
- If Token is NOT configured:
  - Skip upstream detection
  - Ask user to manually input upstream owner and repo name:
    - Question: "Enter upstream repository owner:"
    - Question: "Enter upstream repository name:"
  - Default to using origin as both upstream and fork (local development mode)

### 5. Branch Selection
- **If Token is configured** (upstream workflow):
  - From the upstream resolver output, extract the `branches` array.
  - For upstream branch, present branches to user as selection list.
  - Question: "Select the upstream repository's default branch:"
  - Default: Use `upstream_default_branch` from resolver output.

- **For local main branch** (always required):
  - Detect local branches using git:
    ```bash
    git branch -a
    ```
  - Ask for local main branch name:
    - Question: "Enter your local repository's default branch name:"
    - Default: Use detected branch name (e.g., "main", "master")

### 6. Prepare Script Arguments
Construct command-line arguments for the Node.js script:

**Note**: Token is NOT passed - it's read from global config based on platform type.

Arguments for project config:
- `--upstream-owner`: Upstream owner (from upstream resolver or manual input)
- `--upstream-repo`: Upstream repository name (from upstream resolver or manual input)
- `--fork-owner`: Extracted fork owner (from origin URL in step 3)
- `--platform`: Platform type (gitcode/github/gitlab) - determines which Token to use from global config
- `--local-main-branch`: User-selected local main branch name
- `--upstream-branch`: User-selected upstream branch name

### 7. Execute Node.js Script
- Run the script with the constructed arguments:
  ```bash
  node skills/config-setup/scripts/init-config.js \
    --upstream-owner "owner" \
    --upstream-repo "repo" \
    --fork-owner "owner" \
    --platform "gitcode" \
    --local-main-branch "main" \
    --upstream-branch "main"
  ```
- Note: Token is NOT passed - read from global config based on platform type.
- Capture output and check for errors.
- If script fails, display error message and ask user to verify parameters.

### 8. Verify Configuration
- Verify file creation:
  ```bash
  ls -la .aet/config.json
  ```
- If successful, display success message.

### 9. Post-Initialization Guidance
- The script has automatically added `.aet/` to `.gitignore`.
- Remind user: "Token is in global config (~/.aet/config.json platforms[<platform>].token)."
- Remind user: "Project config specifies platform.type, system uses corresponding Token."

### 10. Project Analysis Recommendation
- After configuration is complete, recommend the user to analyze the project context:
  - Question: "Would you like to analyze this project's architecture and generate documentation?"
  - Options: "Yes, analyze project (Recommended)", "Skip for now"
- If user chooses to analyze:
  - Use the Skill tool to invoke `aet-analyzing-project` skill
  - Guide the user through the project analysis process
  - Output will be saved to `<projectDir>/.aet/project-analysis/`
