---
name: aet-creating-agent-dev-plan
description: Agent Development Plan - use only when an approved Agent design, or a sufficiently grounded AtomGit issue, must be converted into executable implementation tasks for building or updating an Agent / Agent suite in a target repository. Do not use this skill for work whose final deliverable is not an Agent.
---

# S3 Agent Development Plan

Based on the approved agent requirements design document, or a sufficiently grounded AtomGit issue when no formal design exists yet, produce an **execution-ready development plan** for implementing a new or updated **agent suite**. In repositories like AET, “开发 Agent” often means delivering a coordinated surface across runtime `agents/`, prompts, companion `skills/`, `commands/`, runtime support modules, `.opencode/` / `.codex/` / `.claude-plugin/` adapters, install / bootstrap docs, and end-to-end verification—not just changing one folder.

This skill is only for repository changes whose primary outcome is a new or changed Agent / Agent suite.

The output must be concrete enough that a downstream implementation agent can execute it step by step without guessing.

## Core Principles

| Principle                                      | Practice                                                                                                                                                                                                            | Anti-pattern                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Facts First**                                | Use the approved design doc, issue context, and live repository as the only planning basis                                                                                                                          | ❌ Plan from abstract assumptions                                                                 |
| **Execution-ready**                            | Every task names exact files, change points, and verification steps                                                                                                                                                 | ❌ “Update relevant logic”                                                                        |
| **Repo-topology Aware**                        | Split work by the actual carriers that exist in the target repository                                                                                                                                               | ❌ Force every repo into the same folder model                                                    |
| **Agent Suite Delivery**                       | When the goal is to build an agent capability for a repository family, plan the full deliverable surface: runtime definitions, prompts, skills, command entry, core logic, adapters, install docs, and verification | ❌ Treat “develop an Agent” as only creating `agents/...` or only adding one prompt / skill       |
| **Carrier Semantics Before Code**              | For `agents/`, `commands/`, `skills/`, and similar carriers, determine whether they are platform-native definitions or runtime code modules before assigning file formats or languages                              | ❌ See `agents/` / `commands/` / `skills/` and immediately create Python packages                 |
| **Proven Artifacts Over Invented Scaffolding** | If repository evidence is incomplete, first plan discovery / confirmation tasks and use proven anchors; do not fabricate package trees, class files, or module skeletons just to make the plan look concrete        | ❌ Fill gaps with `__init__.py`, `agent.py`, `skill.py`, `pyproject.toml`, or similar scaffolding |
| **Control-path Fidelity**                      | Preserve approval, retry, rollback, audit, and recovery behavior in the plan when required                                                                                                                          | ❌ Plan only happy-path implementation                                                            |
| **Adapter Parity**                             | If the repo exposes capabilities through `.opencode/`, `.codex/`, `.claude-plugin/`, or equivalent adapters, plan both adapter generation / update work and adapter-specific verification                           | ❌ Assume core logic changes automatically cover platform adapters                                |
| **Implementation-friendly Format**             | Use checkbox tasks that can be consumed directly by the implementation workflow                                                                                                                                     | ❌ Output a high-level roadmap with no actionable steps                                           |
| **Small, Verifiable Tasks**                    | Each task should be independently testable and handoff-safe                                                                                                                                                         | ❌ Giant task blocks that hide multiple risks                                                     |

## Stage Objectives

Complete the following five analysis and confirmation items, then generate the plan:

1. Validate design inputs and current repository context
2. Derive artifact-level task slices and dependency order
3. Target exact repository files and change locations
4. Define Agent verification, platform adapter generation / update, install / discovery synchronization, and acceptance evidence per task
5. Produce a plan file that can directly guide implementation work

**This stage has 2 Step nodes. Follow the [S] sequence below strictly — no skipping.**

---

## [S1] Plan Exploration

### [A1.1] Confirm Plan Materials

**Before planning, confirm all required materials in one batch:**

```text
Agent 开发计划需要以下材料，请补充缺少的部分：

1. 已评审通过的 Agent 设计文档（强烈建议）
   - [设计文档路径 / reviewed conclusion]

2. 需求来源（至少一种，必须）
   - AtomGit issue URL / issue 正文 / feature 目录 / issue.md

3. 当前仓库上下文（必须）
   - 相关 agent / prompt / skill / command / runtime module / registration-config / adapter / doc / test 文件路径

4. 验证约束（建议）
   - 可执行测试命令
   - 需要保留的审批或人工确认节点
   - 平台、环境、权限或工具链限制
```

**Planning rules:**

- If no approved design exists, prefer the design stage first.
- If the primary deliverable is not an Agent or Agent suite, this skill is not applicable.
- If the user explicitly asks for a provisional plan, label it as provisional and list the assumptions.
- If local repository context is incomplete, provisional file targeting is allowed, but confidence and basis must be stated clearly.
- If the issue or repository references OpenCode / Claude Plugin / Codex conventions, inspect the actual file formats those platforms recognize before planning `agents/`, `commands/`, or `skills/` work.
- Do not plan `__init__.py`, `agent.py`, `skill.py`, package manifests, or language classes inside carrier directories unless the live repository or approved design explicitly proves those carriers are code modules.
- If carrier semantics or repository conventions are still unverified, the first plan tasks must be confirmation / discovery tasks rather than speculative file creation.
- If the capability is really “ship a usable agent suite”, the plan must explicitly decide which of these layers are in scope: runtime agent definitions, prompts, reusable skills, command surface, core runtime modules, platform adapters, install / bootstrap docs, and verification evidence.

### [A1.2] Codebase Targeting Analysis

**Analyze the repository and locate exact change points before writing any task:**

Before targeting files, read `references/implementation-targeting-guide.md` to understand common repository landing zones and easy-to-miss integration points for agent-related changes.

| Analysis Dimension                  | What to Do                                                                                                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design Targets**                  | Extract required carriers, artifacts, contracts, and acceptance scenarios from the design or grounded issue conclusions                                                                               |
| **Repository Landing Zones**        | Determine which agent runtime folders, prompt locations, skill packages, command surfaces, runtime support modules, registration/config files, docs, or tests are the real landing zones in this repo |
| **Carrier Semantics & Recognition** | Determine which artifacts are platform-native definitions (such as `agents/*.md`, `commands/*.md`, `skills/*/SKILL.md`, plugin metadata) versus runtime source modules, and who consumes them         |
| **Agent Product Surface**           | Determine which delivery layers the repository uses for agent capabilities: runtime `agents/`, prompts, `skills/`, `commands/`, runtime core, platform adapters, install docs, and verification       |
| **Platform Adapters**               | Determine whether `.opencode/`, `.codex/`, `.claude-plugin/`, install docs, plugin manifests, or bootstrap scripts must be created, updated, or explicitly left untouched                             |
| **Domain Logic Changes**            | Determine what logic, schema, rules, or orchestration behavior must change                                                                                                                            |
| **Control Surface Changes**         | Determine whether approval, rollback, retry, audit, or agent execution guardrails need changes                                                                                                        |
| **Docs & Enablement**               | Determine which docs, examples, fixtures, or operator guidance must change                                                                                                                            |
| **Verification Layer**              | Determine the minimal but sufficient tests / walkthroughs / evidence to prove the feature works                                                                                                       |

### [A1.3] Task Grouping & Ordering Rules

Group tasks in dependency order. Use the following default wave logic, then simplify or merge when appropriate:

```text
Wave 0 (Scaffold / Baseline)
├── Confirm target carriers and create empty structure if needed
├── Prepare schemas, prompts, config stubs, or fixtures
└── Capture baseline docs or evidence targets if needed

Wave 1 (Core Capability Logic)
├── Implement main agent runtime / prompt / command / support-module behavior
├── Implement agent contracts, schemas, registration, or configuration rules
└── Implement approval / recovery / rollback / retry behavior if required

Wave 2 (Integration)
├── Wire the capability into trigger entry or runtime loading
├── Update config / registration / platform adapter surfaces
├── Sync install / bootstrap / discovery surfaces when the agent must be consumable after merge
└── Ensure compatibility with current architecture direction

Wave 3 (Verification & Documentation)
├── Automated tests / walkthrough verification
├── Adapter discovery / load / install / invoke verification when applicable
├── Happy-path and non-happy-path scenarios
├── Usage / operator documentation updates
└── Final acceptance evidence
```

**Additional rules:**

- Reuse existing repository carriers whenever the design says reuse is preferred.
- If the design intentionally avoids a new `agents/` directory, the plan must not quietly add one.
- If `agents/`, `commands/`, or `skills/` are platform-native carriers in this repository family, plan their real artifact formats first; do not silently convert them into Python / TypeScript packages.
- In greenfield or docs-only contexts, do not fabricate detailed runtime file trees merely to satisfy “exact file path” output; instead, anchor the first tasks on convention confirmation, platform examples, or proven repository touchpoints.
- If the repository contains platform adapters such as `.opencode/`, `.codex/`, `.claude-plugin/`, or equivalents, and the capability changes agent / skill / command exposure, the plan must include explicit generation or update tasks for each affected adapter.
- If the target deliverable is a full agent suite, the task set should normally cover every required layer of the suite; explicitly mark layers as “not involved” instead of silently omitting them.
- When platform adapters are in scope, the verification matrix must include discovery, load, install, or invocation checks through each affected adapter rather than relying only on core-module tests.
- If the capability includes approvals, recovery, or rollback, at least one task must explicitly implement and verify them.
- If the capability begins from issue input, report input, or event payload, at least one task must cover entry preconditions and contract validation.

---

## [S2] Development Plan Generation

### [A2.1] Task Writing Principles

#### Mandatory Output Format

The implementation workflow expects **checkbox-based task blocks**. Therefore the generated plan **must** use task sections in the format below.

#### Required Fields Per Task

Each task **must include**:

| Required Field     | Description                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Traceability       | Which design section / capability / scenario this task implements                                                                 |
| Files              | Exact file paths to create / modify / verify                                                                                      |
| Artifact Semantics | Whether the task edits platform-native definitions, runtime code, adapter metadata, or another artifact type, and who consumes it |
| Dependencies       | Which earlier tasks or existing modules it depends on                                                                             |
| Confidence         | If file targeting is provisional, state confidence and basis                                                                      |
| Checkbox Steps     | Executable, ordered steps using `- [ ]` syntax                                                                                    |
| Verification       | Automated or manual verification actions                                                                                          |
| QA Scenarios       | At least 2 scenarios when applicable                                                                                              |
| Acceptance         | Concrete pass conditions or commands                                                                                              |

#### Agent-specific Planning Rules

- A task that changes user entry behavior must name the exact command, slash-command, chat trigger, bootstrap entry, or equivalent Agent invocation surface.
- A task that changes prompts, skills, or agents must name the corresponding files explicitly.
- A plan for “developing an Agent” should explicitly map which tasks own agent runtime definitions, prompt assets, skill packages, command surfaces, adapter metadata, install / bootstrap docs, and verification evidence when those layers are required by the target repository family.
- A task that changes `agents/`, `commands/`, or `skills/` must state the file format and the discovering platform/runtime explicitly.
- A task that changes runtime registration or config must name all registry / config files explicitly.
- A task that changes platform exposure must name the exact adapter files explicitly, such as `.opencode/` plugin files, `.codex/` bootstrap scripts, `.claude-plugin/` metadata, install docs, or equivalent repository-specific artifacts.
- Runtime implementations should land in `src/`, `lib/`, `pkg/`, `internal/`, `scripts/`, or repository-proven module paths unless the repository clearly implements carriers as code.
- Do not invent `__init__.py`, `agent.py`, `skill.py`, CLI module files, or package manifests as placeholders. If such files are not proven, the plan should first verify the correct artifact layout.
- A task that changes approval, rollback, retry, audit, or recovery behavior must include corresponding verification.
- A task that only updates docs is allowed **only** if implementation work is already covered elsewhere.
- Do not produce vague tasks such as “完善 Agent 逻辑”, “处理边界情况”, or “补充配置”. Expand them into concrete work.

When task boundaries are unclear, re-read `references/implementation-targeting-guide.md` and verify the intended landing zone against the live repository or AtomGit repository pages.

### [A2.2] Report Structure

**ALWAYS use this exact structure:**

Before generating, load the template `assets/agent-development-plan-template.md`. After generating, use `references/agent-development-plan-review-checklist.md` and `references/reviewer.md` for formal review.

```markdown
# [Agent / Workflow Name] Development Plan

## 1. Scope and Assumptions

- Design document path or issue grounding
- Target repository
- In-scope carriers
- Out-of-scope items
- Confidence / assumptions summary if context is incomplete

## 2. Delivery Strategy

- Dependency order
- Why tasks are grouped this way
- Key risks to burn down early
- Which parts of the agent product surface are delivered in each wave

## 3. Repository Artifact Map

| Artifact | Action | Format / Consumer | Why | Validation |
| -------- | ------ | ----------------- | --- | ---------- |

## Task 1: T-101 [Task Title]

**Traceability:** [Design section / capability / scenario]

**Files:**

- Create: `path/to/file`
- Modify: `path/to/file`
- Verify: `path/to/file`

**Dependencies:**

- Existing module / prior task / none

**Artifact Semantics:** [platform-native definition / runtime module / adapter metadata / other, and consuming platform/runtime]

**Confidence:** [High / Medium / Low if provisional]

- [ ] Step 1: [first executable action]
- [ ] Step 2: [second executable action]
- [ ] Step 3: [verification or review action]
- [ ] Step 4: [update docs / wiring / registration / adapter files if needed]
- [ ] Step 5: [final validation for this task]

**QA Scenarios:**

1. [happy path]
2. [error / approval / rollback / recovery path]

**Acceptance:**

- [ ] [clear pass condition or command]
- [ ] [clear pass condition or observed behavior]

---

## Task 2: T-102 [Task Title]

...

## 5. Verification Matrix

- Acceptance scenario → verification task mapping
- Happy path and non-happy-path coverage
- Evidence to collect

## 6. Risks, Dependencies, and Rollback Notes

- Known risks
- External dependencies
- Rollback / migration / approval / audit notes if needed

## 7. Final Handoff Summary

- Recommended execution order
- Highest-risk tasks
- What must be verified before merge
```

### [A2.3] Quality Self-Check Checklist

- [ ] Every design capability maps to at least one task
- [ ] Every task names exact repository files, or clearly marks provisional paths with confidence
- [ ] If the target is an agent suite, the task set covers the required product surface instead of shrinking the work to a single directory
- [ ] `agents/`, `commands/`, and `skills/` are not turned into language packages unless repository evidence explicitly proves that structure
- [ ] The plan does not fabricate scaffolding files merely to appear concrete; where evidence is missing, it starts with discovery / confirmation tasks
- [ ] The plan covers the correct carriers only; no silent scope expansion
- [ ] When platform adapters are part of the repository surface, the plan contains explicit adapter generation / update tasks and adapter-specific verification
- [ ] Install / bootstrap / discovery docs are updated or explicitly marked not in scope when the agent capability must be distributed through platform adapters
- [ ] Approval / rollback / audit / recovery tasks are represented when required
- [ ] Verification includes both happy path and at least one non-happy path where applicable
- [ ] The plan format uses checkbox syntax exactly so it can be executed later
- [ ] No task depends on undocumented assumptions
- [ ] Documentation / configuration / runtime / adapter changes are not omitted when the design requires them
