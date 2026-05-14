/**
 * AET Implementation Agent Definition
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const implementationDefinition = {
  name: "aet-implementation",
  description: "Implementation phase Agent - responsible for implementing features based on design documents",
  mode: "primary",
  hidden: true,
  permission: {
    "workflow_*": "deny",
    "checkpoint_*": "allow",
    "agent_handover": "allow",
    "step_handover": "allow",
  },
  prompt: readFileSync(join(__dirname, "prompts", "main.md"), "utf-8"),
};
