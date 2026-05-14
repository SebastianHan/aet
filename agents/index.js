/**
 * AET Agents Index
 *
 * Exports all available agents for the AET workflow system.
 */

import { routerDefinition } from "./router/index.js";
import { designDefinition } from "./design/index.js";
import { implementationDefinition } from "./implementation/index.js";
import { testDefinition } from "./test/index.js";
import { deliveryDefinition } from "./delivery/index.js";
import { bugfixDefinition } from "./bugfix/index.js";
import { aetPRDDefinition } from "./prd/index.js";

export const AGENTS = [
  routerDefinition,
  designDefinition,
  implementationDefinition,
  testDefinition,
  deliveryDefinition,
  bugfixDefinition,
  aetPRDDefinition,
];

export function getAgentByName(name) {
  return AGENTS.find(agent => agent.name === name);
}

export function getAllAgentNames() {
  return AGENTS.map(agent => agent.name);
}
