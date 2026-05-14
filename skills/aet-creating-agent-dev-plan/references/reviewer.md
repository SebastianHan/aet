# Agent 开发计划 Reviewer 方法指南

本文档定义 Agent 开发计划的评审方法。一个好的 Agent 开发计划，不只是“把设计分点列出来”，而是要让后续实现阶段可以**直接拿来执行**，并且不会遗漏 approval、rollback、audit、recovery、runtime 接线等关键工作。

## 评审重点

1. **是否可执行**：任务是否足够具体，能直接开始做。
2. **是否精确定位文件**：必须指出具体路径，而不是“修改相关逻辑”。
3. **是否覆盖设计能力**：所有设计中的能力、场景、边界都要有任务映射。
4. **是否区分 carrier 语义**：是否明确区分平台定义载体与运行时代码，避免把 `agents/` / `commands/` / `skills/` 误写成语言 package。
5. **是否覆盖完整产品面**：若目标是“开发 Agent / 开发一套 agent 能力”，计划是否覆盖 runtime agent、prompt、skill、command、adapter、install / discovery、verification 等必要层，而不是只写一层。
6. **是否避免臆造脚手架**：缺少 live repo 证据时，是否先规划确认任务，而不是直接编造包结构和实现文件名。
7. **是否覆盖非 happy path**：审批、回滚、恢复、重复触发、失败反馈不能漏。
8. **是否覆盖平台适配层**：若仓库通过 `.opencode/`、`.codex/`、`.claude-plugin/` 或等价适配层暴露能力，计划是否包含生成 / 更新与发现 / 加载 / 安装 / 调用验证。
9. **是否适合实现阶段消费**：checkbox 结构、依赖顺序、验证动作必须清晰。

## 评审流程

### [1] 确定评审对象

```text
评审文档: {document-path}
对应检查表: agent-development-plan-review-checklist.md
```

### [2] 对照设计与仓库事实

评审前至少核对：

- 批准的设计文档或 grounded issue conclusion
- 涉及的 agent / prompt / skill / command / runtime module / registration-config / docs / tests 文件
- 当前仓库的实现与验证方式

若开发计划与设计结论不一致，或没有体现真实仓库接线点，应判为 **ERROR**。

### [3] 做逐项评审

重点问这些问题：

- 每个任务是否真的能落地执行？
- 任务里有没有精确文件路径？
- 关键 carrier 是否都被覆盖？
- 如果设计目标是交付完整 agent 套件，runtime / prompt / skill / command / adapter / install / verification 是否都被覆盖，或被明确声明不涉及？
- 是否把平台识别的 `agents/` / `commands/` / `skills/` 误规划成 `__init__.py`、`agent.py`、`skill.py` 一类语言包结构？
- 如果证据其实不够，计划有没有先停下来做格式 / 约定确认，而不是硬编具体文件树？
- 如果设计要求跨平台暴露，是否真的把适配层文件和验证动作拆成了任务，而不是藏在“补充配置”里？
- approval、rollback、retry、audit、恢复、输入前置条件是否转化成了实现任务？
- 验证矩阵是否覆盖正常与非正常路径？

## 严重程度分类

### ERROR（必须修复）

通常包括：

- 缺少设计能力到任务的映射
- 任务没有精确文件定位
- 无依据地把 carrier 目录写成语言 package 或 class/module 结构
- 任务不包含验证步骤
- 需要跨平台暴露却没有适配层生成 / 更新与验证任务
- 没有覆盖 approval / rollback / retry / failure 等关键非 happy path
- 输出格式不适合实现阶段直接消费

### WARNING（建议修复）

- 依赖关系说明不足
- 验证方法偏粗略
- 风险与缓解措施不够完整
- 暂定落点的置信度说明不足

### INFO（可选优化）

- 可补更多证据归档建议
- 可优化任务排序说明
- 可补更多回归范围说明

## 评分标准

| 分数 | 描述 | 结论 |
| ------ | ------ | ------ |
| 90-100 | 可直接指导实现、任务清晰完整 | ✅ 通过 |
| 75-89 | 基本可执行，但仍需补若干关键细节 | ⚠️ 条件通过 |
| 0-74 | 无法直接指导实现或关键覆盖缺失 | ❌ 不通过 |

**评分计算方法**：

```text
基础分 = 100
扣分 = ERROR × 10 + WARNING × 3 + INFO × 1
最终分 = max(0, 基础分 - 扣分)
```

## 建议输出格式

```markdown
## 评审结论
- 结论：通过 / 条件通过 / 不通过
- 得分：XX

## 关键问题
1. [问题]
   - 严重程度：ERROR / WARNING / INFO
   - 证据：[...] 
   - 建议：...

## 是否可进入实现阶段
- [Yes / No]
- 原因：...
```
