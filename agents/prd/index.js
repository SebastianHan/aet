/**
 * PRD Orchestrator Agent Definition
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const aetPRDDefinition = {
  name: "aet-prd",
  description: "PRD generation orchestrator - coordinates PRD generation workflow with stage reviews",
  mode: "primary",
  hidden: true,
  permission: {
    "workflow_*": "deny",
    "agent_handover": "allow",
    "step_handover": "allow",
    "task": "allow",
  },
  prompt: readFileSync(join(__dirname, "prompts", "main.md"), "utf-8"),
};
