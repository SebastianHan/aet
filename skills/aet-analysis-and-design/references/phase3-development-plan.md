---
name: aet-analysis-and-design
description: SDD Development Plan - transforms design specs into executable development tasks
metadata:
  pattern: pipeline
  stages: 2
  sub_patterns: generator
---

# Phase3 Development Plan (SDD)

Based on the requirements design specification, complete task decomposition and plan scheduling, producing the **Development Plan (SDD)**. This provides an unambiguous, directly executable task sequence for development agents (e.g., Claude Code).

## Core Principles

| Principle | Practice | Anti-pattern |
|-----------|----------|--------------|
| **Framework First** | Greenfield projects must scaffold the skeleton before writing business logic | ❌ Dive straight into business code |
| **Coupling Priority** | Group tasks by functional coupling, not mechanically by AR | ❌ One plan per AR |
| **Right-sized Workload** | Each plan is 2–5 person-days; total plan count ≤ 3 | ❌ Plans too granular or too heavy |
| **Test First** | Define test scenarios for each task before implementing features | ❌ Write implementation first, then add tests |
| **Traceable** | Every task traces back to an AR and its capability points | ❌ Freelance beyond the design |
| **Explicit Locations** | Every task specifies exact files, line numbers, function names to modify | ❌ Vague "modify related code" |

## Key Concepts

### IR (Initial Requirement)

**Definition:**
A structured and standardized restatement of RR from the customer or market perspective. It serves as the resource pool for subsequent system feature extraction.

**Purpose:**
Transform raw expressions into requirements that are:

- Contextually clear
- Goal-oriented
- Precisely articulated
- Semantically unambiguous
- Formatted in a standardized manner

**Key Principles:**

- **ONLY** restate and clarify the original intent.
- **ALWAYS** maintain the customer/market perspective.
- Some important IRs may later evolve into product value propositions.
- **NEVER** extract system features at this stage.
- **DO NOT** convert them into system requirements.

### SR (System Requirement)

**Definition:**  
Concrete requirements that support System Features. They form the complete, externally visible, and testable requirement set of the system. This includes both customer-facing needs and internal constraints or capability requirements that reflect competitiveness.

**Characteristics:**

- Represent major capabilities required to solve customer problems (challenges, opportunities, strategies, pain points).
- Provide end-to-end solutions that deliver specific business value.
- Form the core selling points of the product package.

**Essence:**  
All verifiable requirements the system **MUST** satisfy to realize a specific system feature, including:

- Functional Requirements
  - Clearly define what the system **MUST** do.
  - Scenario-based and testable.
  - May describe external or internal system behaviors.

- Non-Functional Requirements, including, but not limited to:
  - Performance (response time, throughput)
  - Cost objectives (cost reduction targets)
  - DFX (usability, security, testability, etc.)
  - Technical constraints and limitations
  - Performance indicators (e.g., memory size, processing capability)

All SRs **MUST** be testable and verifiable.

### AR (Allocated Requirement)

**Definition:**  
Requirements decomposed from SR and allocated to specific subsystems, modules, or development teams.

**Essence:**

- Organizational-level decomposition of SR.
- Focused on the scope that a single development team can implement.

**Characteristics:**

- Describe specific functional or performance requirements of a module.
- Clearly define interfaces, resource usage, and constraints.
- **NEVER** restate system-level business value.
- Focus strictly on implementation-level obligations.

## Stage Objectives

Complete the following four analysis and confirmation items, then generate the document:

1. Understanding of the requirements design specification & codebase
2. Task decomposition plan (AR → development task mapping, grouping, and ordering)
3. Modification location targeting (specific files and change points for each task)
4. Test & acceptance strategy (TDD test checklist, QA scenarios, acceptance workflow)

**This stage has 2 Action nodes. Follow the [A] sequence below strictly — no skipping.**

---

## [A1] Plan Exploration

### [1.1] Confirm Plan Materials

**Confirm whether the following materials are available.** Request all missing items from the user in a single batch:

- **Requirements Analysis Specification (Mandatory)**：The output from the previous phase.
- **Requirements Design Specification (Mandatory)**：The output from the previous phase, which should be thoroughly reviewed to understand the design decisions and their rationale.
- **Current Project Codebase (Mandatory)**：Need to analyze the project's existing code to proceed with the design.
- **Current Project Codebase Analysis Document (Recommended)**：The entry path is usually located at `<projectDir>/.aet/project-analysis/SKILL.md`. If available, this must be read to deepen understanding and align with the project's "Golden Development Principles."
- **Reference Project Codebase (Optional)**：External codebase that can be referenced to assist with the design.
- **Reference Project Codebase Analysis Document (Optional)**：Similarly located at `<reference projectDir>/.aet/project-analysis/SKILL.md`. If available, this must be read to accelerate the exploration process.
- **Domain Materials (Optional)**：Domain architecture analysis / Compliance requirements / Specific domain needs.
- **Design References (Optional)**：Existing system design specifications / Modules.

Confirm with the user what you discovered:

> "我找到了：_**。必须文件缺少：**_。建议文件缺少：___。是否有补充？"

**No codebase**: After confirming "greenfield project," skip the existing-system analysis in 1.2 and proceed directly to design.
**Reference codebase**:  ALWAYS start by reviewing the feature-level design/implementation that is relevant to the requested capability. Use them to inform and guide the current project’s design.

---

## [A2] Development Plan Generation

### [2.1] Task Writing Principles

> **Do NOT generate any task before the facts are clear.**

- Treat the current codebase as the single source of truth
- Do not blindly trust documents or analysis files
- When uncertain, explore first

### [2.2] Generation Workflow

1. Load the document template `assets/development-plan-template.md`
2. Populate the template structure with content; generate the document to the designated location
3. Output a document summary for the user to review quickly

### [2.3] Quality Self-Check Checklist

**Task Completeness**:

- [ ] Every AR corresponds to at least one development task
- [ ] Each task's capability point checklist comes directly from AR capability points
- [ ] Each task has explicit target file paths and locations
- [ ] Each task has a test checklist (test file paths, scenario coverage)
- [ ] Task dependencies are fully annotated
- [ ] Modification fences are reflected in the execution instructions

**Plan Structure**:

- [ ] Tasks are ordered by dependency relations and technical layers (not mechanically by AR)
- [ ] Coupled ARs are merged into the same phase
