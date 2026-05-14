# Installing AET (Agentic Engineering Team) for OpenCode

## Installation from Repository (For AI Assistants)

When instructed to install AET (Agentic Engineering Team), fetch this file and follow these instructions to install from the Git repository:

### 1. Clone Repository
```bash
git clone https://atomgit.com/leon-wang2021/agent-dev-team.git ~/.config/opencode/aet
```

### 2. Register the Server Plugin
```bash
mkdir -p ~/.config/opencode/plugins
ln -s ~/.config/opencode/aet/.opencode/plugins/aet.js ~/.config/opencode/plugins/aet.js
```

### 3. Configure OpenCode Permission
Add to your OpenCode config file (~/.config/opencode/opencode.json):
```json
{
  "plugins": ["aet"],
  "permission": {
    "tool": {
      "checkpoint_confirm": "ask"
    }
  }
}
```

### 4. Symlink Skills
```bash
mkdir -p ~/.config/opencode/skills
ln -s ~/.config/opencode/aet/skills ~/.config/opencode/skills/aet
```

### 5. Symlink Commands (Optional)
To enable AET commands in OpenCode:
```bash
mkdir -p ~/.config/opencode/commands
for cmd in ~/.config/opencode/aet/commands/*.md; do
  filename=$(basename "$cmd")
  name="${filename%.md}"
  ln -s "$cmd" ~/.config/opencode/commands/"aet:$filename"
done
```

## Verification
```bash
# Check plugin is registered
ls -la ~/.config/opencode/plugins/aet.js

# Check skills are linked
ls -la ~/.config/opencode/skills/aet

# Check commands are linked
ls -la ~/.config/opencode/commands/ | grep 'aet:'
```

**Note:** After installation, you may need to restart OpenCode for changes to take effect.

## Troubleshooting

### Plugin not loading
Check OpenCode logs for errors:
```bash
journalctl -u opencode.service -f  # systemd
# or check ~/.config/opencode/logs/
```

### Skills not showing up
Verify symlinks:
```bash
ls -la ~/.config/opencode/skills/aet
```

Should show link to repository skills directory.
