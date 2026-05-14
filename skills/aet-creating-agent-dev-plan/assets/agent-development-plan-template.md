# Agent 开发计划模板

<!-- instruction: Keep the document structure unchanged unless the input clearly requires adjustments. Fill placeholders like [ ... ] with concrete project-specific content. Do not output instruction comments in the final document. -->

````markdown
## §1 范围与假设

| 项目 | 内容 |
|------|------|
| **计划名称** | [Agent / Agent Suite Name] |
| **设计来源** | [Approved design document path / grounded issue conclusion] |
| **需求来源** | [AtomGit issue URL / issue summary / requirements analysis path] |
| **目标仓库** | [Target repository / local workspace path / AtomGit repo] |
| **涉及载体** | [agents / prompts / skills / runtime modules / commands / registration-config / docs / tests / `.opencode/` / `.codex/` / `.claude-plugin/` / equivalent adapters] |
| **载体语义** | [Which carriers are platform-native definitions, which are runtime code modules, and who consumes each one] |
| **Agent 产品面** | [Which layers are in scope: runtime agent definitions, prompts, skills, command entry, runtime core, adapters, install/bootstrap docs, verification artifacts] |
| **证据充分性** | [What is proven by live repo / docs, and what still requires confirmation before file-level breakdown] |
| **不在范围内** | [Explicit out-of-scope items] |
| **上下文置信度** | [High / Medium / Low with reason] |

**实施范围摘要**：[2-3 sentences summarizing delivery scope, major files, and key outcomes]

---

## §2 交付策略

### 2.1 拆分原则

```text
- [Why tasks are grouped by carrier / dependency / risk]
- [Which risks should be burned down first]
- [Which slices can be delivered independently]
```

### 2.2 波次与依赖顺序

| 波次 | 目标 | 关键产物 | 备注 |
|------|------|----------|------|
| Wave 0 | [Scaffold / baseline] | [Artifacts] | [Note] |
| Wave 1 | [Core capability logic] | [Artifacts] | [Note] |
| Wave 2 | [Integration / registration / runtime / adapter wiring] | [Artifacts] | [Note] |
| Wave 3 | [Verification / adapter testing / docs / evidence] | [Artifacts] | [Note] |

### 2.3 Agent 产品面交付映射（当目标是开发 Agent 套件时必填）

| 交付层 | 对应任务 | 是否必须 | 备注 |
|--------|----------|----------|------|
| Agent runtime definitions | [T-xxx] | [是/否] | [Note] |
| Agent prompts / references | [T-xxx] | [是/否] | [Note] |
| Reusable skills / guidance packs | [T-xxx] | [是/否] | [Note] |
| Command / trigger surface | [T-xxx] | [是/否] | [Note] |
| Runtime modules / orchestration core | [T-xxx] | [是/否] | [Note] |
| Platform adapters | [T-xxx] | [是/否] | [Note] |
| Install / bootstrap / discovery docs | [T-xxx] | [是/否] | [Note] |
| Verification / evidence artifacts | [T-xxx] | [是/否] | [Note] |

### 2.4 修改围栏

```text
⚠️ 禁止修改：
- [Path]（原因：[Description]）

✅ 允许修改：
- [Path]（范围：[Description]）

🟡 条件修改：
- [Path]（条件：[Description]）
```

---

## §3 仓库产物映射

| 产物 | 所属产品面 | 动作 | 格式 / 被谁识别 | 原因 | 验证方式 |
|------|------------|------|----------------|------|----------|
| `[Path or artifact, including adapter file if applicable]` | [agent runtime / prompt / skill / command / runtime core / adapter / install-doc / verification] | [新增/修改/不涉及] | [Markdown / SKILL.md / YAML / JSON / JS / Python / other, and the consuming platform/runtime] | [Reason] | [Validation / confidence if provisional] |

---

## §4 开发任务列表

### Task 1: T-101 [Task Title]

**Traceability:** [Design section / capability / scenario]

**Files:**
- Create: `path/to/file`
- Modify: `path/to/file`
- Verify: `path/to/file`

**Dependencies:**
- [None / existing module / prior task]

**Artifact Semantics:** [platform-native definition / runtime module / adapter metadata / other, and consuming platform/runtime]

**Product Surface:** [agent runtime / prompt / skill / command / runtime core / adapter / install-doc / verification]

**Confidence:** [High / Medium / Low if provisional]

**Task Goal:** [What this slice delivers]

- [ ] Step 1: [First executable action]
- [ ] Step 2: [Second executable action]
- [ ] Step 3: [Integrate with adjacent carrier or workflow]
- [ ] Step 4: [If platform adapters are in scope, generate / update `.opencode/`, `.codex/`, `.claude-plugin/`, or equivalent adapter artifacts and sync related install docs]
- [ ] Step 5: [Run verification or walkthrough]
- [ ] Step 6: [Record evidence / finalize task]

<!-- instruction: If file layout is not yet proven, make the first task a discovery / confirmation task. Do not invent scaffolding files such as `__init__.py`, `agent.py`, `skill.py`, or package manifests only to increase concreteness. -->

**QA Scenarios:**
1. [Happy path]
2. [Error / approval / rollback / recovery / duplicate-trigger / adapter-load path]

**Acceptance:**
- [ ] [Concrete pass condition or command]
- [ ] [Concrete pass condition or observed behavior]

---

### Task 2: T-102 [Task Title]

**Traceability:** [Design section / capability / scenario]

**Files:**
- Create: `path/to/file`
- Modify: `path/to/file`
- Verify: `path/to/file`

**Dependencies:**
- [None / existing module / prior task]

**Artifact Semantics:** [platform-native definition / runtime module / adapter metadata / other, and consuming platform/runtime]

**Product Surface:** [agent runtime / prompt / skill / command / runtime core / adapter / install-doc / verification]

**Confidence:** [High / Medium / Low if provisional]

**Task Goal:** [What this slice delivers]

- [ ] Step 1: [First executable action]
- [ ] Step 2: [Second executable action]
- [ ] Step 3: [Integrate with adjacent carrier or workflow]
- [ ] Step 4: [If platform adapters are in scope, generate / update `.opencode/`, `.codex/`, `.claude-plugin/`, or equivalent adapter artifacts and sync related install docs]
- [ ] Step 5: [Run verification or walkthrough]
- [ ] Step 6: [Record evidence / finalize task]

<!-- instruction: If file layout is not yet proven, make the first task a discovery / confirmation task. Do not invent scaffolding files such as `__init__.py`, `agent.py`, `skill.py`, or package manifests only to increase concreteness. -->

**QA Scenarios:**
1. [Happy path]
2. [Error / approval / rollback / recovery / duplicate-trigger / adapter-load path]

**Acceptance:**
- [ ] [Concrete pass condition or command]
- [ ] [Concrete pass condition or observed behavior]

---

### Task 3: T-103 [Task Title]

<!-- instruction: Continue in the same format. Add as many tasks as needed, but keep each task independently executable and verifiable. -->

---

## §5 验证矩阵

| 任务 / 范围 | 验证类型 | 场景 | 验证方式 / 命令 | 证据 |
|-------------|----------|------|-----------------|------|
| T-101 | [Doc walkthrough / unit / integration / manual] | [Scenario] | `[Command or method]` | `[evidence path]` |
| T-102 | [Doc walkthrough / unit / integration / manual] | [Scenario] | `[Command or method]` | `[evidence path]` |

### 5.1 必测路径

```text
- 正常路径：[Description]
- 审批 / Review 路径：[Description]
- 平台适配发现 / 加载 / 安装路径：[Description]
- Recovery / Retry / Rollback 路径：[Description]
- 异常 / 重复触发路径：[Description]
```

### 5.2 回归范围

| 范围 | 原因 | 验证方式 |
|------|------|----------|
| [Existing agent / prompt / skill / command / runtime module / adapter] | [Why regression is needed] | `[Command or manual method]` |

---

## §6 风险与执行注意事项

### 6.1 风险清单

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| [Risk] | [High/Medium/Low] | [Mitigation] |

### 6.2 外部依赖与约束

```text
- [External service / environment / permission / dependency]
- [Compatibility or migration constraint]
```

### 6.3 回退 / 补偿 / 审计说明

```text
- [Rollback note]
- [Compensation / migration note]
- [Approval / audit / evidence note if applicable]
```

---

## §7 最终交接摘要

```text
- 推荐执行顺序：
- 高风险任务：
- 合并前必须验证：
- 暂定落点 / 未决问题：
```
````
