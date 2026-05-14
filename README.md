# AET (Agentic Engineering Team)

## 概述

**AET (Agentic Engineering Team)** 全流程 AI 辅助研发底座/引擎，人与 AI 协作，极简完成从需求创建、实现到维护，提升研发效率与质量。

### 核心能力

- **软件全生命周期覆盖**：通过多个 Agent 有序协作，AI 能力覆盖软件研发全生命周期（规划、设计、编码、构建、测试、发布与部署、运维、资料）； 
- **内置"规范驱动开发（SDD）"与约束**：将业界设计方法最佳实践（功能设计、DFx设计等）、架构原则、架构依赖等作为不可篡改的基准上下文，产出需求分析与设计说明书；
- **自动化版本发布**：支持自动化 Release 流程，检测代码变更、推断版本号、生成 Release Notes、创建平台 Release；
- **人工检查点与关键交付件模板可配置**：支持用户在流程中配置人工检查/确认点，关键节点交付件模板可配置（issue、需求分析文档、设计文档）；
- **基于阶段产物的协作机制**：将各阶段产出物固化为Markdown文件（如架构决策、设计文档、开发计划），直接作为下一阶段的基础上下文，减少团队间协作成本； 
- **任务中断可配置**：基于状态快照、恢复与重试机制，使得长程任务中断后可以从断点处恢复执行，减少资源消耗； 
- **任务状态可视化**：通过任务看板查看需求开发状态、PR 关联信息、实现 Agent 协作全流程可观测；

## 快速上手

### 1. 安装（一行命令）

```bash
curl -fsSL https://raw.atomgit.com/leon-wang2021/agent-dev-team/raw/main/scripts/install.sh | bash
```

安装过程中会交互式引导您配置平台 Token（支持 GitCode/GitHub/GitLab），Token 存储在全局配置 `~/.aet/config.json`。

> **提示**：Token 配置可选，您可以选择跳过。若未配置 Token，以下功能将不可用：
> - `/aet:pr` - PR 管理功能
> - `/aet:issue` - Issue 管理功能
> 
> 稍后可通过重新运行安装脚本或手动编辑 `~/.aet/config.json` 来添加 Token。

### 2. 初始化项目配置

进入项目目录后执行：

```bash
/aet:init
```
> **提示**：该步骤可以选择跳过。但是以下功能将不可用：
> - `/aet:pr` - PR 管理功能
> - `/aet:issue` - Issue 管理功能

配置向导会自动检测 Git 远程仓库信息，读取全局配置中的 Token，完成项目配置初始化。

### 3. 开始开发

将 Issue URL 作为参数，AET 会自动完成从认领到 PR 的完整流程：

```bash
/aet:auto https://atomgit.com/owner/repo/issues/123
```

AET 会自动：

- 认领 Issue，创建特性分支
- 分析需求，生成设计文档
- 编写开发计划
- 测试驱动开发实现功能
- 创建 Pull Request

### 4. 项目分析（可选）

进入项目目录后，可以执行项目分析，生成项目架构文档：

```bash
/aet:auto 项目分析
```

AET 会自动分析项目：
- 项目概述和架构分析
- 模块结构和依赖关系
- 开发原则和编码规范

生成的文档存储在 `<projectDir>/.aet/project-analysis/` 目录，帮助 AI 更好理解项目上下文。

### 5. Release 发布（可选）

AET 支持自动化版本发布流程：

```bash
/aet:release 发布新版本
```

AET 会自动：
- 检测上次 Release 后的代码变更
- 分析 commit 类型（feat/fix/docs等）
- 推断版本号（major/minor/patch）
- 生成 Release Notes
- 创建平台 Release

**原子操作支持**：
```bash
/aet:release 创建 v1.2.0        # 直接创建指定版本
/aet:release 删除 v1.1.0        # 删除 Release
/aet:release 列出所有release    # 查询列表
/aet:release 查询 v1.0.0        # 查询详情
```

详细使用说明请参阅[使用指南](./docs/zh/quick-start/user-guide.md)。

## 常用命令

| 命令 | 功能 | 说明 |
|------|------|------|
| `/aet:auto <issue-url>` | 功能开发 | 从 Issue 到 PR 的完整开发流程 |
| `/aet:auto 项目分析` | 项目分析 | 生成项目架构和模块文档 |
| `/aet:init` | 项目初始化 | 初始化项目配置（仓库信息） |
| `/aet:release` | Release管理 | 创建、删除、查询、发布 Release（原子操作或完整流程） |
| `/aet:pr` | PR 管理 | 创建、更新、查询 PR（需要 Token） |
| `/aet:issue` | Issue 管理 | 创建、认领、查询 Issue（需要 Token） |
| `/aet:prd` | PRD 管理 | 生成 PRD 文档（含 UX 设计/原型）或批量处理 FR |

## 平台支持

AET (Agentic Engineering Team) 支持 OpenCode 平台。

## 文档导航

| 文档 | 内容介绍 |
|------|----------|
| [安装指南](./docs/zh/quick-start/install.md) | 安装 AET |
| [使用指南](./docs/zh/quick-start/user-guide.md) | 使用 AET 指南 |
| [配置工作流及用户确认点操作指南](./docs/zh/quick-start/configuration-workflow.md) | 工作流自定义配置指导 |
| [看板功能说明](./visualization/docs/kanban-guide.md) | 核心功能 |
| [架构设计](./docs/zh/reference/architecture.md) | AET 架构设计说明 |
| [模块依赖保护](./docs/zh/reference/module-dependency-protection.md) | 模块依赖保护说明 |
| [Agent/Skill 列表](./docs/zh/core-features/agent-skills.md) | Agent/Skill 列表说明 |
| [工作流说明](./docs/zh/core-features/workflow.md) | 详细工作流程 |
| [配置工作流设计方案](./docs/zh/core-features/configuration-design.md) | 配置工作流设计文档 |

## 术语列表

| 术语 | 全称 | 说明 |
|------|------|------|
| **Agent** | 智能体 | 专门负责开发流程特定阶段的 AI 助手。在 AET 中通过多 Agent 协作完成不同阶段任务。核心 Agent 包括：aet-router（协调入口）、aet-design（设计）、aet-implementation（实现）、aet-test（测试）、aet-delivery（交付）、aet-bugfix（修复）、aet-release（发布）。 |
| **Skill** | 技能 | AET 的核心功能单元，分为命令 Skill（用户入口）、编排 Skill（协调子流程）、原子 Skill（执行单一职责）。如 `aet-design-req-analysis`、`implementation`、`pr`。 |
| **Scenario** | 场景 | AET 定义的开发场景：feature（功能开发）、bugfix（Bug修复）、agent suite（Agent/Skill/Command项目开发）、release（版本发布）、project-analysis（项目分析）、config-setup（配置初始化）。每种场景有独立的 Agent 工作流编排。 |
| **Workflow** | 工作流 | Agent 之间协作的流程定义。由多个 Agent 顺序执行，每个 Agent 前后可配置 Hook（auto/confirm）控制流程走向。如 code 场景工作流：aet-design → aet-implementation → aet-test → aet-delivery。 |
| **Hook** | 钩子 | 控制 Agent 执行流程的机制。两种类型：auto（自动进入下一阶段）、confirm（需要用户确认）。用户可在每阶段完成后选择"完成"或"需要修改"。 |
| **Step** | 步骤 | Agent 内部的细粒度工作单元。每个 Agent 可包含多个 Step，组成 step_workflow。例如 aet-design Agent 包含：requirements_analysis、requirements_design、development_plan、commit。 |
| **Task** | 任务 | 实现计划中的细粒度开发工作任务。 |
| **DFX** | Design for X | 一组质量属性设计策略，包括：可用性/可靠性（容错、降级、重试）、安全性（认证、权限、输入验证）、可扩展性（扩展点、配置、插件）、可测试性（依赖注入、Mock 边界）。 |


## 贡献指南

我们欢迎对 AET (Agentic Engineering Team) 做出贡献！贡献步骤如下：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 进行更改
4. 为新功能添加测试
5. 确保所有测试通过 (`npm test`)
6. 提交更改 (`git commit -m '添加出色功能'`)
7. 推送到分支 (`git push origin feature/amazing-feature`)
8. 打开 Pull Request

### 开发指南

- 遵循现有模式和目录结构
- 为新 skill 实现渐进式披露
- 为新功能添加全面测试
- 相应更新文档

## 许可证

本项目采用 Mulan PSL v2 开源许可证 - 详见 [LICENSE](LICENSE) 文件。

***

**AET (Agentic Engineering Team)** - 人与 AI 极简协作，提升研发效率与质量。