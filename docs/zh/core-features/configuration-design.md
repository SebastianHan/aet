# 配置工作流及用户确认点 - 设计方案

本文档详细介绍配置工作流和用户确认点功能的设计方案和技术实现。

## 设计目标

1. **灵活性**：支持用户自定义工作流顺序和内容
2. **可控性**：允许用户在关键节点介入和控制流程
3. **可扩展性**：支持用户开发自定义 Skill 并集成到工作流
4. **简洁性**：通过声明式配置而非代码实现定制

## 核心概念

### 1. 场景 (Capability Scenario)

场景是一类开发流程的抽象定义，例如：

- `code`：代码功能开发流程
- `bugfix`：Bug 修复流程
- `agent`：Agent/Skill/Command 项目开发流程

每个场景定义了完成该类任务所需的 Agent 执行顺序。

### 2. Agent (智能体)

Agent 是执行特定阶段任务的 AI 助手，例如：

- `aet-design`：设计阶段 Agent
- `aet-implementation`：实现阶段 Agent
- `aet-test`：测试阶段 Agent
- `aet-delivery`：交付阶段 Agent

每个 Agent 可以包含多个 Step（子步骤）。

### 3. Step (步骤)

Step 是 Agent 内部的细粒度工作单元，例如设计 Agent 包含：

- `requirements_analysis`：需求分析
- `requirements_design`：需求设计
- `development_plan`：开发计划
- `commit`：提交文档

### 4. Hook (钩子)

Hook 定义了工作流中的暂停点和用户交互行为：

- `auto`：自动进入下一阶段
- `confirm`：等待用户确认

### 5. 用户确认点 (Checkpoint)

用户确认点是工作流暂停等待用户决策的位置，用于：

- 确保关键阶段输出符合预期
- 允许用户在流程中修正错误
- 提供人工审核机制

## 配置模型

### JSON Schema

```json
{
  "version": "string",
  "capability_scenarios": {
    "[scenario_id]": {
      "name": "string",
      "description": "string",
      "agent_workflow": [
        {
          "agent_id": "string",
          "before": "hook_id | null",
          "after": "hook_id | null"
        }
      ]
    }
  },
  "hooks": {
    "[hook_id]": {
      "description": "string",
      "promptTemplate": "string | null",
      "options": [{ "label": "string", "value": "string" }]
    }
  },
  "agents": {
    "[agent_id]": {
      "name": "string",
      "displayName": "string",
      "description": "string",
      "step_workflow": [
        {
          "step_id": "string",
          "name": "string",
          "description": "string",
          "before": "hook_id | null",
          "after": "hook_id | null"
        }
      ]
    }
  }
}
```

### 配置层级

```
配置文件
├── 场景配置 (capability_scenarios)
│   └── Agent 工作流顺序
├── Hook 配置 (hooks)
│   └── 用户交互行为
└── Agent 配置 (agents)
    └── Step 工作流定义
```

## 工作流执行模型

### 执行流程

```
1. 解析配置文件
2. 根据场景确定 Agent 列表
3. 对每个 Agent 执行：
   a. 执行 before hook（如有）
   b. 执行 Agent 内部 Step：
      - 执行 step before hook（如有）
      - 执行 Step 任务
      - 执行 step after hook（如有，确认点）
   c. 执行 after hook（如有）
4. 进入下一 Agent
5. 所有 Agent 执行完成后结束
```

### Hook 执行逻辑

```
Hook 类型: confirm

当到达确认点时：
1. 渲染 promptTemplate
2. 向用户显示问题和选项
3. 等待用户选择
4. 根据选择结果：
   - approve：继续下一阶段
   - reject：重新执行当前阶段
```

### 嵌套确认点

确认点可以嵌套：

```
Agent 级别确认点
└── Step 级别确认点（每个 Step 后）
```

这种设计允许：
- 在每个主要阶段结束后确认
- 同时在每个子步骤结束后也确认

## 技术实现

### 配置加载器

```typescript
interface ConfigLoader {
  load(path: string): Config;
  validate(config: Config): ValidationResult;
  merge(base: Config, override: Config): Config;
}
```

### 工作流引擎

```typescript
interface WorkflowEngine {
  execute(scenario: string, context: ExecutionContext): Promise<void>;
  pause(): void;
  resume(): void;
  abort(): void;
}
```

### Hook 处理器

```typescript
interface HookHandler {
  handleAuto(): Promise<void>;
  handleConfirm(options: ConfirmOptions): Promise<ConfirmResult>;
}
```

## 扩展机制

### 自定义 Skill 集成

1. **创建 Skill 目录**
   ```
   skills/
   └── my-custom-skill/
       ├── SKILL.md
       └── references/
   ```

2. **在 Agent 中引用**
   ```json
   {
     "step_id": "custom_step",
     "skill": "my-custom-skill"
   }
   ```

3. **注册到工作流**
   ```json
   {
     "agent_workflow": [
       { "agent_id": "my-custom-agent" }
     ]
   }
   ```

### 自定义 Hook

可以在 `hooks` 中定义新的交互行为：

```json
{
  "hooks": {
    "review": {
      "description": "需要代码审查",
      "promptTemplate": "请审查以下代码...\n{code}",
      "options": [
        { "label": "通过", "value": "approve" },
        { "label": "需要修改", "value": "reject" },
        { "label": "标记待讨论", "value": "pending" }
      ]
    }
  }
}
```

## 配置示例

### 完整工作流配置

```json
{
  "version": "1.0",
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
  },
  "hooks": {
    "auto": {
      "description": "自动进入下一阶段",
      "promptTemplate": null,
      "options": null
    },
    "confirm": {
      "description": "请用户确认是该阶段任务是否完成",
      "promptTemplate": "问题：\"{description}\"",
      "options": [
        { "label": "完成", "value": "approve" },
        { "label": "需要修改", "value": "reject" }
      ]
    }
  },
  "agents": {
    "aet-design": {
      "name": "aet-design",
      "displayName": "设计阶段Agent",
      "description": "负责需求分析、架构设计、详细设计文档编写",
      "step_workflow": [
        { "step_id": "requirements_analysis", "name": "需求分析", "before": null, "after": "confirm" },
        { "step_id": "requirements_design", "name": "需求设计", "before": null, "after": "confirm" },
        { "step_id": "development_plan", "name": "开发计划", "before": null, "after": "confirm" },
        { "step_id": "commit", "name": "提交文档", "before": null, "after": null }
      ]
    }
  }
}
```

## 使用指南

### 配置工作流程

1. **确定场景**：根据开发类型选择或创建场景
2. **调整 Agent 顺序**：修改 `agent_workflow` 中的顺序
3. **配置确认点**：设置 `after` 为 `confirm` 或 `auto`
4. **自定义 Hook**：如有需要，添加自定义交互行为

### 扩展自定义 Skill

1. **开发 Skill**：在 `skills/` 目录下创建 Skill
2. **定义 Agent**：在配置中创建使用该 Skill 的 Agent
3. **注册到工作流**：在场景中添加该 Agent

### 调试配置

1. 使用 JSON 验证工具检查格式
2. 分步测试工作流执行
3. 检查 Hook 是否正确触发

## 未来扩展

### 计划中的功能

1. **条件分支**：根据用户选择跳转到不同的工作流路径
2. **并行执行**：支持多个 Agent 并行执行
3. **超时处理**：为确认点添加超时自动处理
4. **配置版本管理**：支持配置文件的版本升级和回滚

### 扩展点

1. **自定义 Hook 类型**：支持插件式 Hook
2. **Agent 模板**：预定义的 Agent 模板供快速创建
3. **配置可视化编辑器**：图形化配置工作流