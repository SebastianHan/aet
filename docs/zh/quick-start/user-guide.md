# AET 使用指南

本文档介绍如何在 OpenCode 中使用 AET (Agentic Engineering Team) 进行智能体驱动的软件开发。

## AET 命令概述

AET 提供以下命令，用于不同开发场景：

| 命令 | 用途 | 使用场景 |
|------|------|----------|
| `/aet:init` | 初始化项目配置 | 首次使用或配置缺失时 |
| `/aet:auto <URL>` | 自动化开发工作流 | 认领 Issue 并执行完整开发流程 |
| `/aet:bugfix <描述>` | Bug 修复工作流 | 诊断问题、生成修复计划、执行修复 |
| `/aet:issue` | Issue 管理 | 创建、更新、认领、查询 Issue |
| `/aet:pr` | PR 管理 | 创建、更新、查询 Pull Request |
| `/aet:prd` | PRD 生成工作流 | 生成 PRD 文档、UX 设计、原型，或批量处理 FR |

### PRD 生成工作流

`/aet:prd` 统一入口，支持两种模式：

**PRD 生成模式（默认）**：

启动 PRD 生成工作流，通过 aet-prd agent 协调多个阶段：

1. **产品分析**：从用户描述中提取技术问题定义与约束
2. **竞品研究**：分析技术竞品与差异化机会
3. **创新分析**：提炼可实施的技术差异化方案
4. **PRD 撰写与 UX 设计**：生成结构化的产品需求文档，包含用户流程、信息架构和线框图设计
5. **原型构建**：生成可交互的 HTML/CSS/JS 原型
6. **终审与交付**：生成创新报告、产品介绍、技术架构文档等

**FR Issue 批量创建模式（`dev` 子命令）**：

扫描 PRD 产物中未处理的 FR，交互确认后自动转接开发流程：

1. **扫描未处理 FR**：检测 `.aet/prd/features/` 目录下的 FR 文件
2. **交互式展示**：逐个展示 FR 内容摘要，征求用户确认/修改/跳过
3. **自动转接开发**：确认后创建 feature 结构，直接调用开发流程
4. **循环处理**：开发完成后自动继续处理下一个 FR

**产物目录结构**：

```
.aet/prd/
├── structured/          # JSON 格式的结构化数据
├── docs/               # Markdown 格式的文档
│   └── 05-prototype/  # 原型文件
├── features/           # Feature 需求文档 (FR00X-名称.md)
├── review/             # 各阶段评审结果
└── reports/            # 最终交付报告
```

## 前提条件

在使用 AET 之前：

1. **安装 AET** - 参考 [安装指南](./install.md)
2. **初始化项目** - 使用 `/aet:init` 配置平台凭证
3. **当前目录** - 确保在 OpenCode 打开的项目目录下操作

## 快速开始

### 1. 初始化项目配置

首次使用 AET 时，需要配置平台凭证：

```
/aet:init
```

配置向导会要求提供：
- Fork 源仓库信息
- 访问令牌 (Token)
- 上游仓库信息

### 2. 认领 Issue 并开始开发

将 Issue URL 作为参数，AET 会自动执行完整的开发工作流：

```
/aet:auto https://atomgit.com/owner/repo/issues/123
```

AET 会自动完成：
1. **认领 Issue** - 创建特性分支，防止重复工作
2. **需求分析** - 分析 Issue 内容，提取需求
3. **设计阶段** - 生成设计文档
4. **开发计划** - 创建任务分解计划
5. **测试驱动开发** - TDD 方式实现功能
6. **PR 创建** - 生成 Pull Request

### 3. Bug 修复

描述 Bug 或提供 Issue URL：

```bash
# 使用 Issue URL
/aet:bugfix https://atomgit.com/owner/repo/issues/456

# 直接描述 Bug
/aet:bugfix 应用崩溃 when user clicks cancel button
```

Bug 修复工作流：
1. **问题诊断** - 分析错误原因和影响范围
2. **修复规划** - 生成修复方案
3. **TDD 修复** - 先写测试，再修复代码
4. **验证测试** - 确保修复有效

### 4. Issue 管理

使用 `/aet:issue` 命令管理 Issue：

```bash
# 创建 Issue
/aet:issue 创建一个 Issue：用户登录功能

# 认领 Issue
/aet:issue 认领 https://atomgit.com/owner/repo/issues/123

# 查询 Issue 详情
/aet:issue 查看 Issue 123 的详情

# 更新 Issue 状态
/aet:issue 将 Issue 123 状态更新为进行中
```

### 5. PR 管理

使用 `/aet:pr` 命令管理 Pull Request：

```bash
# 创建 PR
/aet:pr 为特性分支创建 PR

# 更新 PR 状态
/aet:pr 更新 PR 状态

# 查询 PR 列表
/aet:pr 查看所有打开的 PR
```

## Agent 工作流程

AET 通过多个智能体协作完成开发任务，了解其工作流程有助于更好地使用 AET。

### 智能体协作流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ Aet-Router  │ ──→ │ Aet-Design  │ ──→ │Aet-Implementation│
│  (路由智能体) │     │  (设计智能体) │     │   (实现智能体)    │
└─────────────┘     └─────────────┘     └────────┬────────┘
                                                  │
                     ┌─────────────┐              │
                     │Aet-Delivery │ ←────────────┤
                     │  (完成智能体) │              │
                     └─────────────┘              │
                                                  ▼
                     ┌─────────────┐     ┌─────────────────┐
                     │Aet-Test │     │    PR 创建       │
                     │ ication     │     │                 │
                     │  (验证智能体) │     │                 │
                     └─────────────┘     └─────────────────┘
```

### 各智能体职责

| 智能体 | 用户能看到的工作 |
|--------|-----------------|
| **Aet-Router** | 认领 Issue、检查断点、询问是否继续 |
| **Aet-Design** | 生成需求分析 (RAS)、需求设计 (RDS)、开发计划 (SDD) |
| **Aet-Implementation** | 执行 TDD 开发、实现功能代码 |
| **Aet-Test** | 验证功能、检查需求追溯 |
| **Aet-Delivery** | PR 质量检查、提交 Pull Request |

### 设计阶段详情

设计智能体 (Aet-Design) 会依次生成三份文档：

| 文档 | 说明 | 用户确认点 |
|------|------|-----------|
| **RAS** (需求分析规范) | 需求背景、目标、范围、详细需求 | 需求分析评审 |
| **RDS** (需求设计规范) | 模块划分、接口设计、DFX 策略、SR-AR 分解 | 需求设计评审 |
| **SDD** (详细设计文档) | 开发任务分解、围栏配置、具体实现步骤 | 开发计划评审 |

### 围栏配置

开发计划中会定义**围栏 (Fence)**，明确本次开发允许和禁止修改的范围：

| 符号 | 含义 |
|------|------|
| ✅ | 允许修改 - 本次开发可以修改的文件 |
| ❌ | 禁止修改 - 不应该修改的文件（除非申请突破） |
| 🔵 | 条件修改 - 满足特定条件才能修改 |

### 人工确认点

AET 在关键节点会暂停等待用户确认：

| 节点 | 询问内容 |
|------|----------|
| **Checkpoint 检测** | 发现已存在的进度，询问继续还是重新开始 |
| **设计评审前** | 确认需求分析是否通过 |
| **实现前** | 确认开发计划是否合理 |
| **PR 提交前** | 最终确认是否提交 Pull Request |

### 用户操作示例

完整使用流程：

```bash
# 1. 初始化（如首次使用）
/aet:init

# 2. 开始开发（AET 自动协调所有智能体）
/aet:auto https://atomgit.com/owner/repo/issues/123

# 3. AET 可能会询问：
#    - "发现已存在的进度，是否继续？"
#    - "需求分析已完成，是否继续设计评审？"
#    - "开发计划已生成，是否开始实现？"
#    - "PR 已创建，是否合并？"
```

### 何时需要用户介入

| 场景 | AET 行为 | 用户操作 |
|------|----------|----------|
| 新任务开始 | 认领 Issue，创建分支 | 仅等待 |
| 设计阶段 | 生成 RAS → RDS → SDD | 评审时确认 |
| 实现阶段 | TDD 执行开发任务 | 仅等待 |
| 任务中断后恢复 | 检测 Checkpoint | 选择继续或重新开始 |
| PR 提交前 | 质量检查 | 最终确认 |
| 发现问题 | 报告错误 | 指导修复方向 |

## 项目结构

AET 在项目中创建以下结构：

```
.
├── .aet/
│   ├── config.json          # 项目配置（包含平台凭证）
│   ├── features/
│   │   └── feature-{name}/
│   │       ├── feature.json      # 功能元数据
│   │       ├── issue.md          # Issue 内容副本
│   │       ├── requirements/     # 需求文档
│   │       ├── design/           # 设计文档
│   │       └── tests/            # 测试代码
│   └── project-analysis/         # 项目分析输出
└── commands/                     # AET 命令符号链接
```

## 看板集成

AET 支持开发阶段可视化上报：

**启动看板仪表盘**：
```bash
cd visualization && ./start-dashboard.sh
# 访问 http://localhost:5174
```

**开发阶段**：
```
TODO → CLAIMED → DESIGN → DEVELOPMENT → TESTING → PR_SUBMITTED → COMPLETED
```

## 断点恢复

AET 使用快照机制保存任务进度。如果任务中断：

1. 重新运行相同的 `/aet:auto` 命令
2. AET 会自动检测已存在的 checkpoint
3. 从中断处继续执行

## 直接使用 Skills

除了命令，你也可以直接使用 AET 提供的 Skills：

| Skill | 用途 |
|-------|------|
| `aet-implementing-requirement` | 执行代码实现 |
| `test-driven-development` | TDD 工作流 |
| `aet-reviewing-code` | 代码审查 |

## 常见问题

### 命令无响应

确保：
1. AET 已正确安装
2. 当前目录有 `.aet/config.json`
3. OpenCode 已重新加载配置

### Issue 已被认领

如果提示 "This issue has already been claimed"，表示其他开发者已认领该 Issue，请选择其他 Issue。

### 令牌配置错误

检查 `.aet/config.json` 中的 `platform.token` 是否正确，且具有足够权限。

### 需要帮助

- 安装问题：参考 [安装指南](./install.md)
- 工作流程：参考 [工作流说明](../core-features/workflow.md)
- 架构设计：参考 [架构设计](../reference/architecture.md)
