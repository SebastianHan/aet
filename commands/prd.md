---
description: PRD generation and FR development workflow - generates PRD with UX design and prototype, or batch processes FR to development
agent: aet-prd
---

`/aet:prd` 统一入口，支持两种模式：

**PRD 生成模式（默认）**：
启动 PRD 生成工作流，通过 aet-prd agent 协调多个阶段：

1. **产品分析**：从用户描述中提取技术问题定义与约束
2. **竞品研究**：分析技术竞品与差异化机会
3. **创新分析**：提炼可实施的技术差异化方案
4. **PRD 撰写与 UX 设计**：生成结构化的产品需求文档，包含用户流程、信息架构和线框图设计
5. **原型构建**：生成可交互的 HTML/CSS/JS 原型

PRD 工作流将自动完成从复用检测到原型设计的完整流程。如有产品描述，可直接提供；如未提供，系统将基于现有项目代码进行分析。

生成的文件保存在 `./aet/prd/` 目录下：
- `structured/` - JSON 格式的结构化数据
- `docs/` - Markdown 格式的文档（含 `05-prototype/` 原型目录）
- `features/` - Feature 需求文档
- `review/` - 各阶段评审结果

**FR Issue 批量创建模式（`dev` 子命令）**：
扫描 PRD 产物中未处理的 FR，交互确认后自动转接开发流程：

1. **扫描未处理FR**：检测 `.aet/prd/features/` 目录下的 FR 文件，筛选未创建或待认领的 FR
2. **交互式展示**：逐个展示 FR 内容摘要，征求用户确认/修改/跳过
3. **自动转接开发**：确认后创建 feature 结构，直接调用 workflow_start 进入开发流程
4. **循环处理**：开发完成后自动回到循环入口，继续处理下一个 FR

全程无需用户重复输入需求描述，确认即可开发。
