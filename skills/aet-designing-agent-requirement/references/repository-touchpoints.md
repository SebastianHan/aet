# AtomGit 仓库触点参考

本参考用于帮助 Agent 需求设计阶段快速定位 **任意 AtomGit issue 所对应仓库** 的关键触点。**当前 live code、live docs、Issue 原文、仓库主页 / README 是事实来源**，本文件只是通用导航图。

---

## 1. 最低上下文获取顺序

处理任意 AtomGit issue 时，优先按以下顺序获取事实：

1. **Issue 页面**

- 标题、背景、需求、约束、验收标准、评论补充

1. **仓库主页 / README**

- 项目目标、技术栈、核心模块、使用方式、运行环境

1. **仓库 analysis / 目录树 / 本地代码仓**

- 目录分布、语言、历史提交线索、活跃模块

1. **相关 docs / tests / examples / fixtures**

- 领域模型、接口契约、运行约束、已有用例

**判断原则：**

- 本地代码仓 > 仓库 README / docs > AtomGit 目录和页面摘录 > issue 文本
- 如果只有 web 上下文，没有本地代码仓，就要把文件落点标记为**暂定**并显式说明置信度

---

## 2. 常见目录与其设计意义

| 目录 / 触点 | 常见含义 | 设计时应关注 |
| ----------- | -------- | ------------ |
| `agents/` | Agent 定义、提示词、角色边界 | 是否真的需要新增 agent，还是扩已有 agent |
| `skills/` | Agent 的配套技能包、指导包、参考文档 | 哪些能力应沉淀成 Agent 可复用的 skill，而不是写死在单个 prompt 里 |
| `.opencode/` / `.codex/` / `.claude-plugin/` | 平台适配器、插件描述、启动脚本、安装说明 | 是否需要让能力被特定平台发现、加载、安装或分发 |
| `src/` / `lib/` / `pkg/` / `internal/` | 业务与运行时核心逻辑 | 真正的处理逻辑、契约、状态机通常落在这里 |
| `commands/` / CLI 入口 | 用户或系统触发入口 | 是否需要新增命令、参数、入口接线 |
| `config/` / agent registration files / `.env.example` | Agent 运行配置、注册、开关 | Agent 注册、执行边界、平台加载参数通常在这里 |
| `scripts/` / `bin/` | Agent 安装、bootstrap、桥接脚本 | 平台启动、分发、辅助接线通常在这里 |
| `docs/` | 设计说明、领域文档、操作说明 | 领域规则、现有架构和验收线索 |
| `test/` / `tests/` / `fixtures/` / `examples/` | 测试与样例 | 可验证场景、输入输出样本、E2E 路径 |

### 2.1 先判断“目录名是什么”，再判断“谁识别它”

很多 agent 项目里的 `agents/`、`commands/`、`skills/` 不是语言层 package 目录，而是**被平台识别的定义载体**。例如：

- `commands/*.md` 被命令系统识别
- `skills/<name>/SKILL.md` 被 skill loader 识别
- `agents/*.md` 或其他定义文件被 agent runtime 识别
- `.opencode/`、`.claude-plugin/`、`.codex/` 负责平台适配和发现

因此在设计阶段必须先回答：

1. 这个目录里的文件格式是什么？
2. 是谁识别它？OpenCode、Claude Plugin、Codex、CLI，还是 Python / Node 运行时？
3. 真正的运行时代码是否应该放在 `src/` / `lib/` / `scripts/` 等位置，而不是直接塞进 carrier 目录？

**常见误判：** 看到 issue 里有 `agents/` / `commands/` / `skills/`，就直接规划 `__init__.py`、`agent.py`、`skill.py`。这通常是把“平台 carrier”误判成“语言 package”。

### 2.2 再判断“是否在开发一整套 Agent 产品面”

在类似 AET 的仓库家族里，用户口中的“开发 Agent”常常意味着要交付一整套可被人和平台使用的表面，而不是只改一个目录。常见交付层包括：

- runtime `agents/` 定义（例如 JS / TS / Python agent definitions）
- agent prompts / references
- `skills/` 技能包
- `commands/` 或其他触发入口
- `src/` / `lib/` / `scripts/` 中的 orchestration 或 runtime logic
- `.opencode/` / `.codex/` / `.claude-plugin/` 等平台适配层
- `INSTALL.md`、README、bootstrap 文档
- tests / walkthrough / evidence artifacts

所以在需求设计阶段要先回答：

1. 用户最终拿到的是“一个 agent 文件”还是“一套可发现、可安装、可触发、可验证的 agent 系统”？
2. 哪些交付层是必须同步设计的？
3. 哪些层在当前仓库中根本不存在，因此不该被硬套进去？

---

## 3. 先问“能力是什么”，再问“落在哪”

对任意 AtomGit issue，先判断它更像哪一类变更：

### 模式 A：新增或扩展业务 Agent

适用：

- issue 明确要求新增 agent 角色或扩已有 agent 职责
- 存在上下游 agent 或 orchestrator

设计关注：

- 角色边界
- 上下游输入输出契约
- 是否需要独立 prompt / config / runtime 注册
- 是否还需要配套的 command、skill、adapter、install / discovery 面

### 模式 B：扩展已有 Agent 产品面

适用：

- issue 的核心不是新建独立 agent，而是补齐已有 Agent 的 prompts、skills、commands、adapters 或 install/discovery 面

设计关注：

- 哪些交付层属于该 Agent 的产品面
- 是否复用已有 agent runtime，而只补 companion assets
- 如何避免把 Agent 能力拆散到用户无法发现的零散文件

### 模式 C：补 Agent 触发入口与平台暴露

适用：

- issue 的核心是给 Agent 增加 command 入口、平台发现、安装分发、bootstrap 或 adapter 暴露

设计关注：

- command / slash-command / 平台调用契约
- 平台发现、加载、安装链路
- 幂等 / 恢复 / 去重

### 模式 D：补 Agent 运行时支撑模块

适用：

- issue 的核心是 Agent 所依赖的 runtime support module、registration、prompt loader、context builder、verification helper 等内部逻辑

设计关注：

- `src/` / `lib/` / `internal/` 中的模块边界
- 与 agent / prompt / skill / command / adapter 的集成方式

---

## 4. 对 Agent 类 issue 必查的通用触点

无论目标仓库是什么，只要 issue 涉及 Agent 开发，至少检查：

1. **触发来源**

- 用户输入、上游 agent、command 入口、平台适配器调用

1. **输入契约**

- 报告 schema、命令参数、事件载荷、上下文对象

1. **执行边界**

- 只读还是可写、是否有副作用、权限限制、环境依赖

1. **平台适配暴露**

- 是否需要通过 `.opencode/`、`.codex/`、`.claude-plugin/` 或其他平台适配层暴露
- 适配器入口、清单、安装说明、发现 / 加载行为在哪里定义
- 如果设计不需要改适配器，是否已经明确说明原因

1. **控制策略**

- 风险分级、审批、人工兜底、超时、重试、回滚

1. **输出与证据**

- 结果报告、日志、指标、审计记录、验证结果

1. **验证方式**

- 单测、集成测试、E2E、fixture replay、真实场景 walkthrough

---

## 5. 设计时常见遗漏点

### 漏洞 A：只看 issue，不看 repo

后果：carrier 决策和文件落点极易跑偏。

### 漏洞 B：默认“新增 agent = 新建 `agents/{name}`”

后果：可能忽略真正需要改的是 `prompts/`、`skills/`、`commands/`、`src/`、agent registration 或平台适配层。

### 漏洞 B3：把“开发 Agent”缩成单一载体改动

后果：最终只改了 `agents/` 或只补了一个 prompt / skill，却没有 command 入口、adapter 暴露、安装说明、验证证据，用户实际上无法发现或使用该能力。

### 漏洞 B1：把 `agents/` / `commands/` / `skills/` 直接当 Python/TypeScript 包

后果：会生成平台根本不识别的 `__init__.py`、`agent.py`、`skill.py`、`pyproject.toml` 等产物，导致需求分析和开发计划一起跑偏。

### 漏洞 B2：在需求分析阶段直接倒推出实现文件树

后果：本应输出能力边界、carrier 语义、格式与消费方，却提前滑到实现层，导致后续开发计划建立在错误脚手架之上。

### 漏洞 C：只设计 happy path

后果：审批、回滚、权限不足、目标不存在、重复触发等场景全部失真。

### 漏洞 D：把策略和执行混在一起

后果：风险分级、审批门禁、审计要求难以落地。

### 漏洞 E：没有区分“已证实事实”和“暂定假设”

后果：后续开发计划会建立在不稳的文件路径或模块判断上。

---

## 6. 输出前自检问题

在输出 Agent 需求设计文档前，建议至少回答：

1. 我是否已经基于 issue + repo 事实，而不是只基于 issue 文本？
2. 这个能力的上游输入和下游输出是什么？
3. 真的需要独立 agent 吗，还是更适合扩已有 agent，并补齐 prompts / skills / commands / runtime module / adapter？
4. 执行风险、审批、回滚、审计是否需要设计？
5. 文件落点是已证实还是暂定？
6. 后续开发计划能否直接消费这份设计？
