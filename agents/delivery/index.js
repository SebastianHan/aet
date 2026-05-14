/**
 * AET Delivery Agent - Handles post-test delivery including PR submission
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const deliveryDefinition = {
  name: "aet-delivery",
  description: "Delivery phase Agent - responsible for PR submission and feature delivery",
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
