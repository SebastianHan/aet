# Installing AET (Agentic Engineering Team) for Codex

## Installation from Repository (For AI Assistants)

When instructed to install AET (Agentic Engineering Team), fetch this file and follow these instructions to install from the Git repository:

1. **Clone the repository**:
   ```bash
   mkdir -p ~/.codex/aet
   cd ~/.codex/aet
   git clone https://atomgit.com/leon-wang2021/agent-dev-team.git .
   ```

2. **Update your AGENTS.md file**:
   Add the following section to your `~/.codex/AGENTS.md`:

   ```markdown
   ## aet (Agentic Engineering Team)

   <EXTREMELY_IMPORTANT>
   You have access to aet (Agentic Engineering Team). RIGHT NOW run: `~/.codex/aet/.codex/aet-codex bootstrap` and follow instructions.
   </EXTREMELY_IMPORTANT>
   ```

## Verification
```bash
~/.codex/aet/.codex/aet-codex bootstrap
```

You should see skill listings and bootstrap instructions.

**Note:** After installation, you may need to restart your Codex application for changes to take effect.
