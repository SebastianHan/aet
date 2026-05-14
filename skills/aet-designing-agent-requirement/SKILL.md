---
name: aet-designing-agent-requirement
description: Agent Requirements Design - use only when the user provides an AtomGit issue URL or copied issue content whose primary goal is to add, extend, route, expose, or otherwise develop an Agent or Agent suite in a repository. Do not use this skill for work whose final deliverable is not an Agent.
---

# S2 Agent Requirements Design

Based on issue requirements and repository context, produce an **Agent Requirements Design Specification** for the target repository’s **agent product surface**. In repositories like AET, “开发 Agent” usually does **not** mean creating one isolated folder; it means deciding how agent runtime definitions, prompts, companion skills, command entry points, runtime support modules, platform adapters, install / discovery materials, and verification artifacts fit together into one deliverable system.

This stage is **only** for AtomGit issues whose primary outcome is a new or changed **Agent / Agent suite**.

## Core Principles

| Principle                                | Practice                                                                                                                                                                                                                                                 | Anti-pattern                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Issue-first, Repo-grounded**           | Start from the AtomGit issue, then verify assumptions against live repository artifacts                                                                                                                                                                  | ❌ Design from issue text alone when repository evidence exists                                            |
| **Agent Responsibility Before Carrier**  | First define the Agent’s responsibility, collaboration boundary, and user-facing outcome, then choose carriers such as `agents/`, prompts, `skills/`, `commands/`, runtime support modules, or adapters                                                  | ❌ Start with folder names before understanding what the Agent itself must do                              |
| **Agent Is a Product Surface**           | When the request is to “develop an Agent”, reason across the whole deliverable surface: agent definitions, prompts, skills, commands, runtime modules, adapters, install/discovery docs, and verification evidence                                       | ❌ Reduce “develop an Agent” to editing only one directory such as `agents/` or only one prompt file       |
| **Carrier Semantics Before Language**    | For `agents/`, `commands/`, `skills/`, and similar carriers, identify the artifact format and consuming platform/runtime first (such as Markdown, `SKILL.md`, YAML, JSON, JS metadata, or source code) before discussing implementation language         | ❌ Treat every carrier directory as a Python / TypeScript package by default                               |
| **Requirements Before Scaffolding**      | In the requirements-design stage, define capability boundaries, carrier families, recognition rules, and proven artifact anchors first; defer speculative class / package / file scaffolding to later stages unless repository evidence already fixes it | ❌ Jump from high-level capability directly to `__init__.py`, `agent.py`, `skill.py`, or package skeletons |
| **Contracts Before Internals**           | Clarify upstream inputs, downstream outputs, and integration contracts before deep internal design                                                                                                                                                       | ❌ Focus on internal structure while leaving interface contracts vague                                     |
| **Agent Safety Boundaries Are Explicit** | If the Agent executes actions, edits files, hands off work, or requires approval, define execution boundary, approval gate, rollback, and audit explicitly                                                                                               | ❌ Assume Agent execution and recovery details can be filled in later                                      |
| **Workflow Optional, Not Assumed**       | Model human review loops, approvals, resume, or idempotency only when the target system actually needs them                                                                                                                                              | ❌ Force AET-style claim / checkpoint / review loops into every design                                     |
| **Platform Exposure Is Intentional**     | If the capability must be surfaced through `.opencode/`, `.codex/`, `.claude-plugin/`, or equivalent adapters, design the exposure contract, packaging boundary, and validation path explicitly                                                          | ❌ Treat platform adapters as an implementation afterthought                                               |
| **Traceable Boundaries**                 | State what must change, what may change, and what must remain untouched                                                                                                                                                                                  | ❌ “Adjust related files as needed”                                                                        |

## Stage Objectives

Complete the following five analysis and confirmation items, then generate the document:

1. Issue and repository context grounding
2. Domain capability model and agent product-surface selection
3. Agent integration contracts, platform exposure, and artifact boundaries
4. Agent safety / approval / recovery / observability strategy
5. Verification and development handoff strategy

**This stage has 3 Step nodes. Follow the [S] sequence below strictly — no skipping.**

---

## [S1] Design Exploration

### [A1.1] Confirm Design Materials

**Before starting, confirm the following materials in one batch.** If any item is missing, ask for it together:

```text
Agent 需求设计需要以下材料，请补充缺少的部分：

1. 需求来源（至少一种，必须）
   - AtomGit issue URL / issue 正文 / 已整理的问题说明

2. 目标仓库上下文（至少一种，必须）
   - 本地代码仓 / 当前 workspace
   - AtomGit 仓库主页 / README / analysis 页面
   - 关键目录、关键模块、关键文档路径

3. 已有设计输入（可选但强烈建议）
   - 已完成的需求分析文档
   - 相关架构设计、领域说明、运行约束

4. 运行与集成约束（建议）
   - 平台、运行时、工具链、权限、审批或安全要求
   - 是否存在人工审批、回滚、审计、幂等等控制要求

5. 参考材料（如有）
   - README、设计文档、实现示例、测试用例、相关 PR / issue
```

**Important grounding rules:**

- If the user provides an AtomGit issue URL, first read the issue page, then read the target repository homepage / README / analysis page or equivalent context.
- If the target repository is available locally, live code and local docs are the source of truth over AtomGit snippets.
- If the issue’s final deliverable is not an Agent or Agent suite, this skill is not applicable.
- If only web context is available, you may produce a **provisional design**, but you must mark uncertain file locations and unresolved repository assumptions explicitly.
- Do not assume every repository uses `agents/`, `skills/`, `commands/`, or checkpoint logic. Discover the actual carriers from the target repository first.
- If the issue or repository mentions OpenCode, Claude Plugin, Codex, or “参考某目录结构”, inspect the actual carrier formats and discovery rules first.
- Do not treat `agents/`, `commands/`, or `skills/` as Python / TypeScript packages unless live repository evidence, platform documentation, or an approved upstream design explicitly proves those carriers are implemented as code modules.
- In this stage, do not invent runtime package scaffolding such as `__init__.py`, `agent.py`, `skill.py`, CLI modules, or package manifests unless the target repository or platform convention already proves those artifacts are required.
- If the target capability is “开发一套 Agent / Agent 套件 / 多平台 agent 能力”, inspect whether the repository family expects a combined surface of runtime agent definitions, prompt assets, command entry points, reusable skills, adapter metadata, install docs, and verification evidence.

### [A1.2] Repository & Architecture Analysis

**Must analyze the current repository from the following dimensions:**

Before analyzing, read `references/repository-touchpoints.md` as a repository navigation aid for AtomGit issues and common repository structures. Treat it as an accelerator, not as a substitute for inspecting live files or repository pages.

| Analysis Dimension           | What to Do                                                                                                                                                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Issue Scope**              | Extract the problem statement, required capability, constraints, acceptance criteria, and any linked artifacts from the AtomGit issue                                                                                                                                            |
| **Repository Topology**      | Inspect the target repository’s actual folders, modules, runtime entry points, documentation, and testing surface                                                                                                                                                                |
| **Carrier Options**          | Identify what carriers exist in this repo for Agent delivery: `agents/`, prompts, `skills/`, `src/` / `lib/`, `commands/`, agent registration / config files, `docs/`, `tests/`, and platform adapter folders such as `.opencode/`, `.codex/`, `.claude-plugin/`, or equivalents |
| **Carrier Semantics**        | Determine which carriers are platform-native definitions versus runtime source modules, what file formats they use, and which platform/runtime actually discovers or consumes them                                                                                               |
| **Agent Product Surface**    | Determine whether this repository family expresses an agent system through a mixed delivery surface such as runtime `agents/` definitions + prompts + `skills/` + `commands/` + platform adapters + install / bootstrap docs + verification                                      |
| **Platform Adapters**        | Determine whether this capability must be exposed through adapter manifests, plugin metadata, bootstrap scripts, install guides, or platform discovery flows                                                                                                                     |
| **Integration Contracts**    | Identify upstream inputs, downstream outputs, trigger points, agent handoff contracts, registration points, and adapter discovery boundaries                                                                                                                                     |
| **Execution & Safety**       | Identify whether the Agent executes actions, changes state, requires approval, needs rollback, or must emit audit trails                                                                                                                                                         |
| **Observability & Evidence** | Identify logs, reports, metrics, result artifacts, or traces that prove the capability works                                                                                                                                                                                     |
| **Verification Surface**     | Identify how the capability can be validated: design review, walkthrough, unit/integration/E2E tests, fixture replay, or manual scenarios                                                                                                                                        |

### [A1.3] Agent Capability Mapping

Map the issue and repository context into a concrete agent capability design:

1. **User Journey**
   - What triggers the capability?
   - Who or what provides the input? (user, upstream agent, command invocation, platform adapter)
   - What intermediate and final outputs are required?
   - Are there approval, review, pause, or resume points? If yes, how do they work?

2. **Capability Chain**
   - Which capability slices belong to agent roles, prompt assets, companion skill packages, command definitions, runtime support modules, registration/config files, or adapter wiring?
   - Which slices are platform-recognized carrier artifacts, and which are runtime implementation modules?
   - What data or contracts flow between those slices?
   - Which existing modules should be reused or extended?

3. **Carrier Decision**
   - Is the capability best implemented as:
     - a new agent,
     - an extension to an existing agent,
   - companion prompts / skills / command surfaces for that agent,
   - a runtime support module plus agent integration,
     - a platform adapter layer or adapter update,
   - an install / discovery update for that agent,
     - or a combination?
   - A standalone `agents/` addition is **optional**, not the default. Justify it explicitly based on the target repository.
   - If the issue is effectively asking to “build an agent suite like this repository”, explicitly judge whether the design needs a coordinated set of: agent runtime definitions, prompt files, reusable skills, command surfaces, runtime wiring, adapter metadata, install/discovery docs, and verification assets.

4. **Artifact Impact**
   - Which repository artifacts must be created or modified?
   - For each affected artifact, what is its format and who discovers / consumes it?
   - Which artifacts together form the final **agent product surface** seen by users or platforms?
   - Which items are stable carrier families or proven anchor artifacts, versus implementation details that should be deferred to the development plan?
   - If the capability must be discoverable from OpenCode / Codex / Claude or similar platforms, which adapter manifests, plugin descriptors, bootstrap scripts, or install docs must change?
   - Which modules are integration points only?
   - Which modules must remain unchanged?

5. **Agent Suite Blueprint**
   - Does the design require a router / orchestrator agent or only a specialized execution agent?
   - Which prompt assets or reusable skill packages must exist for the agent to do its job reliably?
   - Which command or invocation surfaces must exist so humans or upstream systems can trigger the capability?
   - Which platform adapters and install / discovery documents must be updated so the capability is actually usable after merge?
   - What verification evidence proves the suite works end-to-end instead of only one layer working in isolation?

6. **Operational Behavior**
   - Agent trigger and preconditions
   - Agent execution boundary, approval gate, or human-in-the-loop behavior if applicable
   - Retry / rollback / recovery behavior if applicable
   - Idempotency or duplicate-trigger handling if applicable
   - Platform discovery / loading / installation expectations if applicable
   - Failure feedback, audit, or observability requirements

---

## [S2] Design Confirmation

> **Iron Rule**: Do **NOT** generate the design document until carrier selection, workflow, and boundaries are confirmed.

### [A2.1] Carrier & Workflow Confirmation

Present your complete design judgment and ask the user to confirm **in a single batch**:

> **Q1**："我建议本次能力主要落在 **_（agent runtime / prompts / companion skills / commands / runtime support modules / agent registration-config / platform adapters / install-discovery docs / verification artifacts），其中新增 _**、复用 **_、不改动 _**，这个划分是否合理？"
>
> **Q2**："我建议的端到端流程为：\_\_\_（触发输入 → 关键处理阶段 → 可选审批/评审 → 输出结果 / 接入下游），这个状态机与暂停/恢复点是否准确？"
>
> **Q3**："我识别到的关键输入输出为：输入 **_，中间文档 _**，最终交付 **_；失败与恢复策略为 _**，这些约定是否需要调整？"

### [A2.2] Artifact & Boundary Confirmation

Present the repository impact and confirm **in a single batch**:

> **Q1**："我建议本次变更涉及的仓库产物为：新增 **_、修改 _**、只读参考 **_、禁止修改 _**，这个边界划分是否合理？"
>
> **Q2**："关键集成点为：\_\_\_（上游输入 / 中间契约 / 下游消费 / agent runtime / registration / adapter 接入点），这条链路是否接受？"
>
> **Q3**："我识别到的设计风险为：\_\_\_（如契约不清、执行风险、审批与回滚缺失、平台兼容性、现有架构方向冲突），是否有遗漏？"

### [A2.3] Inversion Completion Criteria

All of the following conditions must be met before document generation:

- [ ] Carrier selection is confirmed
- [ ] End-to-end workflow and any required approval / review / resume behavior are confirmed
- [ ] Repository artifact boundaries are confirmed
- [ ] Safety / retry / rollback / idempotency strategy is confirmed when applicable
- [ ] No unresolved ambiguity remains about critical contracts or development handoff outputs

---

## [S3] Document Generation

### [A3.1] Generation Workflow

1. Load the template `assets/agent-requirements-design-template.md`
2. If any carrier, contract, safety, workflow, or boundary item remains unconfirmed, complete confirmation before generating
3. If repository touchpoints are still ambiguous, re-read `references/repository-touchpoints.md` and inspect the live repository or AtomGit pages again
4. Generate the design document only after all confirmations are complete
5. Keep the document grounded in actual repository artifacts and integration points
6. Use natural language + Mermaid diagrams; do not write implementation code
7. In `Repository Artifact Change Plan`, stay at carrier-family / proven-anchor granularity unless exact artifact paths are already fixed by live repository evidence or platform conventions
8. When the repository is developing an agent suite rather than a single helper, explain the whole product surface explicitly: agent definitions, prompt/skill layer, command surface, runtime modules, adapters, install docs, and verification evidence
9. For formal review, use `references/agent-requirements-design-review-checklist.md` together with `references/reviewer.md`
10. If only AtomGit web context is available, explicitly label provisional file targeting and unresolved repository assumptions
11. End with a concise summary so the user can review quickly

### [A3.2] Report Structure

**ALWAYS use this exact structure:**

```markdown
# [Agent / Workflow Name] Requirements Design Specification

## 1. Background and Goals

- Issue / feature context
- Target repository and domain context
- User value
- Success criteria

## 2. Repository and Issue Grounding

- Issue summary
- Repository topology summary
- Existing relevant agents / prompts / skills / commands / runtime modules / carrier semantics
- Key assumptions and confidence level

## 3. Design Conclusion Summary

- One-paragraph conclusion
- Chosen carrier(s)
- Why this choice fits the current repository

## 4. Domain Capability Model

- Trigger and preconditions
- Inputs / outputs / contracts
- Capability decomposition
- Agent product-surface blueprint when the target is an agent suite
- Platform exposure requirements if applicable
- Human approval or review points if applicable

## 5. Carrier Decision and Scope Boundaries

- What will be added
- What will be modified
- What will remain unchanged
- Format and consuming platform/runtime for each changed carrier
- Why other carrier options were not chosen

## 6. End-to-End Flow and State Model

- Main flow
- Optional approval / review / resume flow
- Failure / retry / rollback flow
- Mermaid flowchart

## 7. Integration Points and Contracts

- Upstream input contract
- Downstream output contract
- Runtime / command / registration / adapter integration points
- Platform adapter / discovery / install contract if applicable
- Compatibility notes

## 8. Safety, Execution Boundaries, and Observability

- Approval rules / risk levels if applicable
- Rollback / compensation strategy if applicable
- Audit / logging / metrics / evidence strategy

## 9. Repository Artifact Change Plan

| Artifact | Action | Format / Consumer | Reason | Notes |
| -------- | ------ | ----------------- | ------ | ----- |

## 10. Verification and Acceptance Scenarios

- Happy path
- Error path
- Approval / review path if applicable
- Recovery / idempotency path if applicable

## 11. Non-goals, Open Questions, and Handoff Notes

- Explicit non-goals
- Open questions
- Notes for downstream planning / implementation
```

### [A3.3] Quality Self-Check Checklist

- [ ] The design is grounded in actual repository files and current architecture
- [ ] Carrier choice is explicitly justified; no implicit repository-shape assumption is made
- [ ] If the issue is effectively asking for an agent suite, the design covers the required product surface instead of shrinking the problem to a single folder or prompt
- [ ] `agents/`, `commands/`, `skills/`, and similar carriers are not described as source-code modules unless repository evidence proves their runtime semantics
- [ ] The requirements design does not jump ahead into speculative implementation scaffolding such as `__init__.py`, `agent.py`, `skill.py`, CLI module files, or package manifests
- [ ] Agent contracts, execution boundaries, and safety controls are explicit when relevant
- [ ] Platform adapter surfaces are covered explicitly when the repository exposes agents / skills / commands through `.opencode/`, `.codex/`, `.claude-plugin/`, or equivalents
- [ ] The document explains how users or platforms will actually discover, trigger, install, or consume the final agent capability when those surfaces are part of the target repository family
- [ ] Artifact change plan covers only the carriers that actually exist or are needed in the target repository
- [ ] Main flow and all required non-happy paths are covered
- [ ] Non-goals are explicit, preventing scope creep
- [ ] The document contains no implementation code or vague placeholders like “modify related files”
