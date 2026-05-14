# 配置工作流及用户确认点使用指导

本文档介绍如何自定义配置 AET 工作流、配置用户确认点，以及如何扩展自定义 Skill。

## 概述

AET 支持灵活的工作流配置，通过 `.aet/config.json` 文件可以：

- 自定义 Agent 工作流执行顺序
- 配置用户确认点（checkpoint）
- 扩展自定义 Skill 并将其加入到工作流

## 配置文件结构

```json
{
  "version": "1.0",
  "capability_scenarios": { ... },
  "hooks": { ... },
  "agents": { ... }
}
```

### 版本号

`version` 字段标识配置文件格式版本，当前为 `1.0`。

---

## 场景配置 (capability_scenarios)

`capability_scenarios` 定义了不同类型的开发流程场景：

```json
"capability_scenarios": {
  "code": {
    "name": "代码功能开发流程",
    "description": "从设计到实现、验证、发布的完整开发流程",
    "agent_workflow": [
      { "agent_id": "aet-design", "before": null, "after": "confirm" },
      { "agent_id": "aet-implementation", "before": null, "after": "confirm" },
      { "agent_id": "aet-test", "before": null, "after": "confirm" },
      { "agent_id": "aet-delivery", "before": null, "after": null }
    ]
  }
}
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `agent_id` | Agent 标识，对应 `agents` 中的定义 |
| `before` | 该阶段执行前的钩子（可为 `null`） |
| `after` | 该阶段执行后的钩子（可为 `null` 或 `confirm`） |

### 内置场景

| 场景 ID | 名称 | 说明 |
|---------|------|------|
| `code` | 代码功能开发流程 | 从设计到实现、验证、发布的完整流程 |
| `bugfix` | Bug 修复流程 | 从问题诊断到修复、验证、发布的流程 |
| `agent` | Agent 项目开发流程 | Agent/Skill/Command 项目开发流程 |

---

## 钩子配置 (hooks)

`hooks` 定义了工作流中的用户交互行为：

### auto（自动）

```json
"auto": {
  "description": "自动进入下一阶段",
  "promptTemplate": null,
  "options": null
}
```

设置后，Agent 将在该阶段完成后自动进入下一阶段，无需用户确认。

### confirm（确认）

```json
"confirm": {
  "description": "请用户确认是该阶段任务是否完成",
  "promptTemplate": "请直接必须使用 question 工具向用户提问，不得有任何其他操作。\n\n问题：\"{description}\"\n{options}\n",
  "options": [
    { "label": "完成", "value": "approve" },
    { "label": "需要修改", "value": "reject" }
  ]
}
```

设置后，Agent 将在该阶段完成后暂停，等待用户确认：

- **完成**：进入下一阶段
- **需要修改**：重新执行当前阶段

---

## Agent 配置 (agents)

`agents` 定义了每个 Agent 的详细配置：

```json
"agents": {
  "aet-design": {
    "name": "aet-design",
    "displayName": "设计阶段Agent",
    "description": "负责需求分析、架构设计、详细设计文档编写",
    "step_workflow": [
      { "step_id": "requirements_analysis", "name": "需求分析", "description": "...", "before": null, "after": "confirm" },
      { "step_id": "requirements_design", "name": "需求设计", "description": "...", "before": null, "after": "confirm" },
      { "step_id": "development_plan", "name": "开发计划", "description": "...", "before": null, "after": "confirm" },
      { "step_id": "commit", "name": "提交文档", "description": "...", "before": null, "after": null }
    ]
  }
}
```

### 字段说明

| 字段 | 说明 |
|------|------|
| `name` | Agent 内部名称 |
| `displayName` | 显示名称 |
| `description` | 功能描述 |
| `step_workflow` | Agent 内部的步骤工作流 |

### 步骤字段

| 字段 | 说明 |
|------|------|
| `step_id` | 步骤唯一标识 |
| `name` | 步骤显示名称 |
| `description` | 步骤详细描述 |
| `before` | 步骤执行前的钩子 |
| `after` | 步骤执行后的钩子 |

---

## 用户确认点配置

用户确认点是 AET 工作流中的关键暂停点，用于在继续执行前获取用户反馈。

### 配置位置

用户确认点可以在两个层级配置：

1. **Agent 级别**（在 `capability_scenarios.agent_workflow` 中）
2. **Step 级别**（在 `agents.*.step_workflow` 中）

### 示例：Agent 级别确认点

```json
{
  "agent_workflow": [
    { "agent_id": "aet-design", "before": null, "after": "confirm" }
  ]
}
```

这表示 `aet-design` Agent 完成后，需要用户确认才能继续。

### 示例：Step 级别确认点

```json
{
  "step_workflow": [
    { "step_id": "requirements_analysis", "name": "需求分析", "before": null, "after": "confirm" },
    { "step_id": "requirements_design", "name": "需求设计", "before": null, "after": "confirm" }
  ]
}
```

这表示每个步骤完成后都需要用户确认。

### 移除确认点

将 `after` 设置为 `null` 可以移除确认点：

```json
{ "step_id": "commit", "name": "提交文档", "before": null, "after": null }
```

### 自动模式

将所有 `after` 设置为 `auto` 可以实现全自动执行：

```json
"after": "auto"
```

---

## 自定义工作流配置

### 示例：创建一个简化的开发流程

```json
{
  "version": "1.0",
  "capability_scenarios": {
    "simple-code": {
      "name": "简化代码开发流程",
      "description": "跳过测试阶段的快速开发流程",
      "agent_workflow": [
        { "agent_id": "aet-design", "before": null, "after": "confirm" },
        { "agent_id": "aet-implementation", "before": null, "after": "confirm" },
        { "agent_id": "aet-delivery", "before": null, "after": null }
      ]
    }
  }
}
```

### 示例：创建严格的审查流程

```json
{
  "version": "1.0",
  "capability_scenarios": {
    "strict-code": {
      "name": "严格代码开发流程",
      "description": "每个步骤都需要用户确认的严格流程",
      "agent_workflow": [
        { "agent_id": "aet-design", "before": null, "after": "confirm" },
        { "agent_id": "aet-implementation", "before": null, "after": "confirm" },
        { "agent_id": "aet-test", "before": null, "after": "confirm" },
        { "agent_id": "aet-delivery", "before": null, "after": "confirm" }
      ]
    }
  }
}
```

### 示例：创建全自动化流程

```json
{
  "version": "1.0",
  "capability_scenarios": {
    "auto-code": {
      "name": "自动代码开发流程",
      "description": "无需用户确认的全自动流程",
      "agent_workflow": [
        { "agent_id": "aet-design", "before": null, "after": "auto" },
        { "agent_id": "aet-implementation", "before": null, "after": "auto" },
        { "agent_id": "aet-test", "before": null, "after": "auto" },
        { "agent_id": "aet-delivery", "before": null, "after": "auto" }
      ]
    }
  }
}
```

---

## 扩展自定义 Skill

可以将自定义开发的 Skill 集成到 AET 工作流中。

### 步骤 1：创建 Skill

首先，在 `skills/` 目录下创建你的 Skill：

```
skills/
└── my-custom-skill/
    ├── SKILL.md          # Skill 定义文件
    └── references/       # 参考文档目录
```

### 步骤 2：在 Agent 中引用

在配置文件的 `agents` 部分添加新的 Agent 或修改现有 Agent：

```json
{
  "agents": {
    "my-custom-agent": {
      "name": "my-custom-agent",
      "displayName": "自定义Agent",
      "description": "使用自定义 Skill 的 Agent",
      "step_workflow": [
        {
          "step_id": "custom_step",
          "name": "自定义步骤",
          "description": "使用 my-custom-skill 执行",
          "before": null,
          "after": "confirm",
          "skill": "my-custom-skill"
        }
      ]
    }
  }
}
```

### 步骤 3：添加到工作流

在 `capability_scenarios` 中引用新的 Agent：

```json
{
  "capability_scenarios": {
    "custom-flow": {
      "name": "自定义开发流程",
      "description": "包含自定义 Skill 的开发流程",
      "agent_workflow": [
        { "agent_id": "aet-design", "before": null, "after": "confirm" },
        { "agent_id": "my-custom-agent", "before": null, "after": "confirm" },
        { "agent_id": "aet-delivery", "before": null, "after": null }
      ]
    }
  }
}
```

### 完整示例

```json
{
  "version": "1.0",
  "agents": {
    "my-security-check": {
      "name": "my-security-check",
      "displayName": "安全检查Agent",
      "description": "执行自定义安全检查",
      "step_workflow": [
        {
          "step_id": "security_scan",
          "name": "安全扫描",
          "description": "使用 security-audit skill 执行安全扫描",
          "before": null,
          "after": "confirm"
        }
      ]
    }
  },
  "capability_scenarios": {
    "secure-code": {
      "name": "安全代码开发流程",
      "description": "包含安全检查的开发流程",
      "agent_workflow": [
        { "agent_id": "aet-design", "before": null, "after": "confirm" },
        { "agent_id": "aet-implementation", "before": null, "after": "confirm" },
        { "agent_id": "my-security-check", "before": null, "after": "confirm" },
        { "agent_id": "aet-delivery", "before": null, "after": null }
      ]
    }
  }
}
```

---

## 配置文件说明

AET 的配置文件在项目初始化时由 `aet:init` 命令生成。

### 配置文件位置

- **项目配置文件**：`.aet/config.json`

### 配置生成流程

1. 运行 `aet:init` 初始化项目
2. AET 根据默认模板生成 `.aet/config.json`
3. 用户可以根据项目需求修改配置文件

### 配置模板

默认配置文件模板位于：
`skills/config-setup/scripts/default-config-template.json`

### 配置文件作用域

配置文件与项目绑定，每个项目可以有不同的配置：

- 不同项目可以定义不同的场景（capability_scenarios）
- 不同项目可以调整 Agent 的工作流顺序
- 不同项目可以配置不同的用户确认点策略

---

## 验证配置

配置完成后，可以使用以下命令验证配置是否正确：

```bash
/aet:init
```

AET 会检查配置文件格式并在启动时报告错误。

---

## 常见问题

### 配置文件格式错误

确保 JSON 格式正确：
- 使用双引号而非单引号
- 末尾不要添加多余逗号
- 使用 JSON 验证工具检查格式

### 自定义 Skill 不生效

检查：

1. Skill 文件路径是否正确
2. SKILL.md 是否存在且格式正确
3. Agent 配置中的 `skill` 字段是否与目录名一致

### 确认点不生效

检查：

1. `after` 字段是否设置为 `confirm`
2. Hook 配置中是否有 `confirm` 定义
3. 是否正确引用了 hook 名称