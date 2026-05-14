<EXTREMELY_IMPORTANT>
You have aet.

**Tool for running skills:**
- `~/.codex/aet/.codex/aet-codex use-skill <skill-name>`

**Tool Mapping for Codex:**
When skills reference tools you don't have, substitute your equivalent tools:
- `TodoWrite` → `update_plan` (your planning/task tracking tool)
- `Task` tool with subagents → Use Codex collab `spawn_agent` + `wait` when available; if collab is disabled, state that and proceed sequentially
- `Subagent` / `Agent` tool mentions → Map to `spawn_agent` (collab) or sequential fallback when collab is disabled
- `Skill` tool → `~/.codex/aet/.codex/aet-codex use-skill` command (already available)
- `Read`, `Write`, `Edit`, `Bash` → Use your native tools with similar functions

**Skills naming:**
- aet skills: `aet:skill-name` (from ~/.codex/aet/skills/)
- Personal skills: `skill-name` (from ~/.codex/skills/)
- Personal skills override aet skills when names match

**Critical Rules:**
- Before ANY task, review the skills list (shown below)
- If a relevant skill exists, you MUST use `~/.codex/aet/.codex/aet-codex use-skill` to load it
- Announce: "I've read the [Skill Name] skill and I'm using it to [purpose]"
- Skills with checklists require `update_plan` todos for each item
- NEVER skip mandatory workflows (planning before implementation, testing, quality assurance)

**Skills location:**
- aet skills: ~/.codex/aet/skills/
- Personal skills: ~/.codex/skills/ (override aet when names match)

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.
</EXTREMELY_IMPORTANT>
