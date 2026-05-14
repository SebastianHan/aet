# Agent/Skill 列表说明

本文档详细介绍 AET 提供的所有 Agent 和 Skill，帮助用户了解每个组件的功能和使用场景。

## Agent 概述

Agent 是 AET 中专门负责开发流程特定阶段的 AI 智能体，通过多智能体协作完成完整开发流程。

| Agent | 职责 | 目录位置 |
|-------|------|----------|
| **Aet-Router** | 核心协调者 - 理解需求、认领 Feature、路由工作流 | `agents/router/` |
| **Aet-PRD** | PRD 协调者 - PRD 生成、UX 设计、原型、FR 管理 | `agents/prd/` |
| **Aet-Design** | 设计智能体 - 需求分析、架构设计、开发计划 | `agents/design/` |
| **Aet-Implementation** | 实现智能体 - TDD 驱动开发、代码实现 | `agents/implementation/` |
| **Aet-Test** | 测试智能体 - 验证功能、编写测试用例 | `agents/test/` |
| **Aet-Delivery** | 交付智能体 - PR 创建、版本发布 | `agents/delivery/` |
| **Aet-Bugfix** | 修复智能体 - Bug 诊断、修复规划 | `agents/bugfix/` |

## Agent 详细说明

### Aet-Router（路由智能体）

**职责**：智能体开发团队的核心协调者

**功能**：

- **理解用户需求**：分析用户想要完成的任务
- **认领 Feature**：在使用任何工作流之前，必须先认领 Feature
- **路由到合适的工作流**：根据用户需求定向到相应工作流
- **协调工作流执行**：帮助用户执行多阶段开发工作流

**工作流协调**：
```
设计阶段 → 实现阶段 → 验证阶段 → 完成阶段
```

**Checkpoint 管理**：

- 支持断点恢复，检查 `checkout.json` 状态
- 询问用户是继续还是重新开始

---

### Aet-PRD（PRD 协调智能体）

**职责**：负责 PRD 生成工作流程的协调和执行

**功能**：

- **PRD 生成**：生成完整的产品需求文档
- **竞品研究**：分析技术竞品与差异化机会
- **创新分析**：提炼可实施的技术差异化方案
- **UX 设计**：生成用户流程、信息架构和线框图设计
- **原型构建**：生成可交互的 HTML/CSS/JS 原型
- **FR 管理**：Feature 需求文档的生成和管理

**工作模式**：

| 模式 | 触发方式 | 功能 |
|------|----------|------|
| **PRD 生成模式** | `/aet:prd`（默认） | 6 阶段 PRD 生成流程 |
| **FR Issue 批量创建模式** | `/aet:prd dev` | 扫描并处理未开发 FR |

**PRD 生成 6 阶段流程**：

| 阶段 | Agent | 产出文件 |
|------|-------|----------|
| Stage 1 | `aet-analyzing-prd` | `.aet/prd/structured/01-product-analysis.json` + `.aet/prd/docs/01-product-analysis.md` |
| Stage 2 | `aet-researching-prd-competitor` | `.aet/prd/structured/02-competitor-research.json` + `.aet/prd/docs/02-competitor-research.md` |
| Stage 3 | `aet-analyzing-prd-innovation` | `.aet/prd/structured/03-innovation-analysis.json` + `.aet/prd/docs/03-innovation-analysis.md` |
| Stage 4 | `aet-writing-prd`（含 UX 设计） | `.aet/prd/structured/04-requirements-document.json` + `.aet/prd/docs/04-requirements-document.md` |
| Stage 5 | `aet-building-prd-prototype` | `.aet/prd/docs/05-prototype/index.html`, `styles.css`, `app.js` |
| Stage 6 | 终审 + 整合交付 | `.aet/prd/reports/innovation-report.md`、`.aet/prd/reports/innovation-report-slides.html` 等 |

**FR 开发批处理流程**：

1. 扫描 `.aet/prd/features/` 目录下的 FR 文件
2. 筛选未处理（状态为"新增"或"部分已实现"）的 FR
3. 逐个展示 FR 内容摘要，征求用户确认/修改/跳过
4. 确认后创建 feature 目录，自动转接开发流程
5. 开发完成后继续处理下一个 FR

**产物目录结构**：

```
.aet/prd/
├── structured/                 # JSON 格式的结构化数据
├── docs/                       # Markdown 格式的文档（各阶段分析报告）
│   └── 05-prototype/          # 原型文件
├── reports/                    # 最终交付报告
│   ├── innovation-report.md    # 创新报告
│   ├── innovation-report-slides.html  # 幻灯片
│   ├── 产品介绍.md             # 产品概览
│   ├── 技术架构.md             # 技术方案
│   └── 用户手册.md             # 使用指南
├── features/                   # Feature 需求文档 (FR00X-名称.md)
├── review/                     # 评审结果
└── artifact-manifest.md       # 产物清单
```

**FR 状态说明**：

| 状态 | 含义 | 后续处理 |
|------|------|----------|
| `已实现` | 功能在代码库中已完整实现 | 跳过 |
| `新增` | PRD 新定义的特性，待开发 | 加入待处理列表 |
| `部分已实现` | 功能部分实现，需要继续完善 | 加入待处理列表 |
| `已处理` | 已移交开发流程管理 | 跳过 |

---

### Aet-Design（设计智能体）

**职责**：负责 Feature 开发的设计阶段

**功能**：

- **需求分析**：生成需求分析规范 (RAS)
- **需求设计**：生成需求设计规范 (RDS)
- **开发计划**：生成详细开发计划 (SDD)
- **评审流程**：每个阶段支持评审确认

**设计子步骤**（按顺序）：

| # | 子步骤 | 说明 |
|---|--------|------|
| 1 | `requirements_analysis` | 需求分析规范 |
| 2 | `requirements_analysis_review` | 需求分析评审 |
| 3 | `requirements_design` | 需求设计规范 |
| 4 | `requirements_design_review` | 需求设计评审 |
| 5 | `development_plan` | 开发计划 (SDD) |
| 6 | `development_plan_review` | 开发计划评审 |
| 7 | `commit` | 提交设计文档 |

**输出位置**：`.aet/features/{feature-name}/design/`

---

### Aet-Implementation（实现智能体）

**职责**：根据设计文档实现功能

**功能**：

- **读取设计和计划**：从设计文档和实现计划中理解需求
- **TDD 实现**：使用测试驱动开发方式实现代码
- **任务执行**：按照计划中的 checkbox 语法逐步执行任务

**实现流程**：

1. 读取设计文档和实现计划
2. 对每个任务：
   - 编写失败的测试
   - 运行测试验证失败
   - 编写最简代码通过测试
   - 运行测试验证通过
   - 提交代码

---

### Aet-Test（测试智能体）

**职责**：验证实现是否符合设计要求和功能需求

**功能**：

- **功能验证**：验证所有必需功能是否已实现
- **需求追溯**：将每个需求映射到实现，识别差距
- **测试覆盖**：确保测试充分覆盖所有场景

**验证清单**：

- 需求追溯表
- 功能覆盖率
- 测试用例完整性

---

### Aet-Delivery（交付智能体）

**职责**：验证后处理，包括 PR 提交

**功能**：

- **完成确认**：确认所有阶段（设计、实现、验证）已完成
- **质量检查**：提交 PR 前运行质量检查
- **PR 提交**：创建 Pull Request
- **后续处理**：处理提交后的任务

**PR 前质量检查**：

- 所有 lint 检查通过
- 所有测试通过
- 代码覆盖率达标
- 与目标分支无冲突

---

### Aet-Bugfix（修复智能体）

**职责**：结构化 Bug 修复工作流

**功能**：

- **问题诊断**：分析错误原因和影响范围
- **修复规划**：生成修复方案
- **TDD 修复**：先写测试，再修复代码
- **验证测试**：确保修复有效

**Bug 修复流程**：

1. 问题诊断 (`aet-diagnosing-bug`)
2. 修复规划 (`aet-implementing-requirement`)
3. TDD 修复 (`test-driven-development`)
4. 验证测试

---


## 编排 Skill

编排 Skill 协调多个子流程完成复杂任务：


### feature-management

**用途**：功能认领和生命周期管理

**功能**：

- 认领 Issue，防止重复工作
- 创建、更新 Issue
- 标记功能完成
- 创建 Pull Request
- 阶段上报（看板集成）

---

### aet-reviewing-code

**用途**：综合代码审查

**流程**：

1. 确定审查范围（文件/目录/项目）
2. 安全审计 (`aet-checking-security`)
3. 代码质量检查 (`aet-checking-bad-smell`)
4. 生成统一审查报告

---

## 设计阶段 Skill

### aet-creating-agent-dev-plan

**用途**：Agent 开发计划设计

---

### aet-designing-agent-requirement

**用途**：Agent 需求设计

---

## 实现阶段 Skill

### aet-implementing-requirement

**用途**：执行设计规范为可工作代码

**输入**：

- 设计文档路径
- 实现计划路径
- Feature 文件夹路径

**输出**：代码、测试、文档

**流程**：参考 `WORKFLOW.md` 详细实现工作流

---

### test-driven-development (TDD)

**用途**：测试驱动开发

**核心原则**：

- **红**：先写失败的测试
- **绿**：写最简代码通过测试
- **重构**：保持测试绿色的情况下优化

**铁律**：

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

**适用场景**：

- 新功能
- Bug 修复
- 重构
- 行为变更

---

### aet-diagnosing-bug

**用途**：Bug 诊断分析

---

### aet-checking-security

**用途**：安全漏洞检查

**检测类型**：

- SQL 注入
- XSS 跨站脚本
- 命令注入
- 敏感信息泄露
- 认证绕过
- 等其他安全漏洞

---

### aet-checking-bad-smell

**用途**：代码质量/坏味道检测

**检测类型**：

- 重复代码
- 过大类/过长方法
- 过长参数列表
- 深度嵌套
- 死代码
- 等其他代码坏味道

---

### aet-checking-implementation

**用途**：Pull Request 质量检查

---

## 验证 Skill

### aet-setup-config

**用途**：项目配置初始化

**功能**：

- 创建 `.aet/config.json`
- 配置平台凭证
- 设置仓库信息

---

### aet-analyzing-project

**用途**：项目分析

**功能**：

- 分析项目结构
- 生成模块文档
- 提供项目原则说明

---

### skill-creator

**用途**：创建新 Skill

**功能**：

- 生成 Skill 框架
- 定义 Workflow
- 创建评估脚本

---

### find-skills

**用途**：查找和发现 Skill

---

### aet-operating-pr

**用途**：PR 管理和创建

**功能**：

- 创建 PR
- 更新 PR 状态
- 管理 PR 评论

---

## 使用建议

| 场景 | 推荐使用 |
|------|----------|
| 快速完成一个 Issue | `/aet:auto <URL>` |
| Bug 修复 | `/aet:bugfix <描述>` |
| 仅需要代码实现 | `aet-implementing-requirement` skill |
| 代码审查 | `aet-reviewing-code` skill |
| TDD 开发 | `test-driven-development` skill |
| 管理 Issue/PR | `feature-management` skill |

## Skill 调用方式

在 OpenCode 中：

1. **通过命令调用**：`/aet:auto <URL>`
2. **通过 Skill 工具调用**：使用 Skill 工具直接调用 skill 名称

示例：

```
使用 Skill 工具调用 aet-analysis-and-design skill
输入：.aet/features/feature-xxx/ 目录下的 Issue 内容
```