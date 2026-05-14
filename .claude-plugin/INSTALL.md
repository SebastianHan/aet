# Installing AET (Agentic Engineering Team) for Claude Code

## Installation from Repository (For AI Assistants)

When instructed to install AET (Agentic Engineering Team), fetch this file and follow these instructions to install from the Git repository:

### 1. Add the repository as a marketplace
```bash
claude plugin marketplace add https://atomgit.com/leon-wang2021/agent-dev-team.git
```

### 2. Install the plugin
```bash
claude plugin install aet
```

### 3. Verify Installation
```bash
claude plugin list | grep aet
```

Should show aet in the list.

**Note:** After installation, you may need to restart Claude Code for changes to take effect.

## Troubleshooting

### Plugin not appearing
Check installation steps:
```bash
# List marketplaces to see if repository was added
claude plugin marketplace list

# Try reinstalling
claude plugin uninstall aet
# Note: Marketplace name may differ from plugin name
# Check marketplace list above for the correct name, then remove it
# claude plugin marketplace remove <marketplace-name>
claude plugin marketplace add https://atomgit.com/leon-wang2021/agent-dev-team.git
claude plugin install aet
```

### Marketplace format errors
Validate JSON:
```bash
node -c .claude-plugin/plugin.json
node -c .claude-plugin/marketplace.json
```

### Skill loading errors
Check SKILL.md files have proper YAML frontmatter.
