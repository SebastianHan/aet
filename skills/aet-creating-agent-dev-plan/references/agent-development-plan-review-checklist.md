# Agent 开发计划检查表

本检查表用于评审 Agent 开发计划的质量。检查项直接对应模板 `assets/agent-development-plan-template.md`，重点检查是否能指导后续实现阶段在 **任意目标仓库** 中直接落地。

---

## §1 范围与假设

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 计划名称是否明确 | WARNING | 能唯一标识本次能力 |
| 设计来源是否标注 | ERROR | 必须指向已批准设计文档或已说明的 grounded issue conclusion |
| 需求来源是否标注 | WARNING | AtomGit issue / feature / analysis 可追溯 |
| 涉及载体是否完整 | ERROR | 实际相关的 agent / prompt / skill / runtime module / registration-config / docs / tests / platform adapters 已识别 |
| 载体语义是否明确 | ERROR | 必须说明哪些是平台定义载体，哪些是运行时代码模块，以及谁识别它们 |
| Agent 产品面是否明确 | ERROR | 若目标是开发 Agent 套件，需明确 runtime agent、prompt、skill、command、adapter、install/docs、verification 哪些在范围内 |
| 不在范围内是否明确 | WARNING | 防止 scope creep |
| 上下文置信度是否说明 | WARNING | 暂定路径和假设需有置信度 |

---

## §2 交付策略

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 拆分原则是否说明 | WARNING | 为什么按这些任务切分 |
| 是否有波次与依赖顺序 | ERROR | 不是平铺任务，而是有依赖与风险顺序 |
| 修改围栏是否明确 | ERROR | 禁止修改 / 允许修改 / 条件修改已说明 |
| 风险是否前置消减 | WARNING | 优先暴露高风险集成点 |

---

## §3 仓库产物映射

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 产物映射是否完整 | ERROR | 关键受影响产物均已列出，包括适配器清单、bootstrap、安装说明等平台文件（如适用） |
| 动作是否明确 | ERROR | 新增 / 修改 / 不涉及 / 暂定清晰 |
| 验证方式是否可执行 | WARNING | 不是泛泛“后续验证” |

---

## §4 开发任务列表

### 任务整体检查

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 任务是否覆盖所有设计能力 | ERROR | 每个设计能力至少有一个任务映射 |
| 适配层任务是否存在 | ERROR | 若设计要求跨平台暴露，必须有 `.opencode/` / `.codex/` / `.claude-plugin/` / equivalent 的生成或更新任务 |
| 产品面任务是否完整 | ERROR | 若设计要求交付整套 Agent 能力，任务应覆盖必要的 runtime / prompt / skill / command / adapter / install / verification 层，或明确写不涉及 |
| 是否避免语言幻觉 | ERROR | 不能无依据地把 `agents/` / `commands/` / `skills/` 规划成 Python / TypeScript package |
| 是否避免臆造脚手架 | ERROR | 在证据不足时不得为了“具体”而编造 `__init__.py`、`agent.py`、`skill.py`、包管理文件等 |
| 任务编号是否规范 | WARNING | `T-101`、`T-102` 等格式 |
| 任务粒度是否合适 | ERROR | 任务应独立可执行、可验证，避免过大或过虚 |
| 任务顺序是否符合依赖 | ERROR | 依赖方向合理，未跳过前置工作 |

### 单任务内容检查

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| Traceability 是否明确 | ERROR | 对应设计章节 / 能力 / 场景 |
| Files 是否精确 | ERROR | 创建 / 修改 / 验证文件路径具体 |
| Artifact Semantics 是否明确 | ERROR | 需说明该任务编辑的是平台定义、运行时代码还是适配器元数据，以及由谁消费 |
| Product Surface 是否明确 | ERROR | 该任务属于 agent runtime、prompt、skill、command、runtime core、adapter、install-doc、verification 中哪一层必须清楚 |
| Dependencies 是否明确 | WARNING | 写明 existing module / prior task / none |
| Confidence 是否说明 | WARNING | 暂定落点必须说明依据和置信度 |
| 缺证据时是否先做确认任务 | ERROR | 若 file layout 未被证明，首批任务应是约定确认，而不是直接创建猜测文件 |
| Task Goal 是否清晰 | WARNING | 能说明该任务交付什么 |
| Checkbox 步骤是否可执行 | ERROR | 不是泛泛而谈，步骤可直接执行 |
| 是否包含验证步骤 | ERROR | 每个任务内至少有一条验证 / walkthrough / 命令执行步骤 |
| 适配器验证是否明确 | ERROR | 若任务涉及平台暴露，必须包含 discovery / load / install / invoke 验证 |
| QA 场景是否至少 2 个 | ERROR | 至少 happy path + 非 happy path |
| Acceptance 是否可判定 | ERROR | 通过条件可执行或可观察 |

---

## §5 验证矩阵

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 验证矩阵是否覆盖所有关键任务 | ERROR | 关键任务均有验证方式 |
| 必测路径是否完整 | ERROR | 正常、审批 / review、recovery / rollback、异常 / 重复触发 |
| 平台适配路径是否完整 | ERROR | 若存在适配层，验证矩阵中应覆盖 adapter discovery / load / install / invoke |
| 回归范围是否定义 | WARNING | 对现有 agent / prompt / command / skill / runtime module / adapter 的回归验证 |
| 命令或方法是否具体 | WARNING | 不是“进行测试”，而是具体方法或命令 |
| 证据位置是否明确 | INFO | 日志 / 文档 / evidence 路径明确 |

---

## §6 风险与执行注意事项

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 风险是否列出 | WARNING | 至少识别主要集成 / 兼容 / 权限 / 进度风险 |
| 缓解措施是否具体 | WARNING | 有对应动作 |
| 外部依赖是否说明 | WARNING | 环境、权限、第三方依赖、迁移约束、平台安装 / bootstrap 约束明确 |
| 是否强调非 happy path | ERROR | approval / rollback / retry / audit / failure 不能遗漏 |

---

## §7 最终交接摘要

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 执行顺序是否清楚 | WARNING | 实现者能按顺序开始执行 |
| 高风险任务是否单独标识 | WARNING | 便于优先验证和降风险 |
| 合并前必须验证是否明确 | ERROR | Merge gate 清晰，且包含适配层发现 / 加载 / 安装 / 调用验证（如适用） |
| 暂定落点 / 未决问题是否说明 | WARNING | 避免实现阶段误把假设当事实 |

---

## 文档格式检查

| 检查项 | 严重程度 | 检查要点 |
| -------- | ---------- | ---------- |
| 是否保留模板结构 | ERROR | 结构不变，仅填充占位符 |
| instruction 注释是否移除 | ERROR | 最终文档不应输出 instruction 注释 |
| checkbox 语法是否正确 | ERROR | 实现阶段依赖 `- [ ]` 语法进行执行追踪 |
| 是否存在含糊任务 | ERROR | 如“完善逻辑”“补充边界情况”这类描述应展开 |

---

## 评审汇总

| 维度 | ERROR 数 | WARNING 数 | INFO 数 |
| ------ | ---------- | ------------ | --------- |
| §1 范围与假设 | | | |
| §2 交付策略 | | | |
| §3 仓库产物映射 | | | |
| §4 开发任务列表 | | | |
| §5 验证矩阵 | | | |
| §6 风险与执行注意事项 | | | |
| §7 最终交接摘要 | | | |
| 文档格式 | | | |
| **合计** | | | |

**评分计算**: 基础分 100 - ERROR×10 - WARNING×3 - INFO×1 = ______ 分

**评审结论**: □ 通过(≥90) □ 条件通过(75-89) □ 不通过(<75)
