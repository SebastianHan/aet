# 纵横分析法指南

## 方法论定义

**横纵分析法**是一种双向分析框架：

| 分析轴 | 定义 | 目的 |
|--------|------|------|
| **纵轴** | 沿时间轴梳理技术演进历程 | 理解"为什么今天是这样"，还原决策逻辑 |
| **横轴** | 在当前时间截面上与竞品横向对比 | 识别差异点和竞争位置 |
| **交汇点** | 交叉两条轴产出洞察 | 历史根源追溯 |

---

## 纵向演进分析维度

对每个竞品，需完成以下四个维度的分析：

### 1. 起源追溯

| 分析内容 | 数据来源 |
|---------|---------|
| 技术背景（理念来源） | 技术博客、学术论文 |
| 行业环境（当时趋势） | 新闻报道、行业报告 |
| 关键触发事件（为何开始） | 创始人访谈、技术博客 |

### 2. 诞生节点

| 分析内容 | 数据来源 |
|---------|---------|
| 首次发布时间 | GitHub Release v1.0 |
| 初始架构形态 | 首次公开信息 |
| 初始定位 | 官网历史页 |
| 与现在的差异 | GitHub Release Notes |

### 3. 演进历程

| 分析内容 | 数据来源 |
|---------|---------|
| 重大版本更新时间线 | GitHub Release Notes |
| 架构调整节点 | GitHub Commits、技术博客 |
| 功能演进路径 | GitHub Release Notes |
| 关键里程碑 | 新闻报道、技术博客 |

### 4. 决策逻辑还原

| 分析内容 | 数据来源 |
|---------|---------|
| 为什么选A不选B | 技术博客、Issue讨论 |
| 约束条件 | 技术博客、架构分析文章 |
| 锁定因素 | Issue讨论、技术博客 |
| 好决策如何变成包袱 | 技术博客、用户反馈 |

---

## 横纵交汇分析维度

### 1. 横向对比矩阵

保留原有差异化矩阵，对比竞品在技术维度（架构、性能、成本、扩展性、安全等）的差异。

### 2. 纵向差异分析

对比竞品之间的：
- **演进路径差异**：为何A走路线X，B走路线Y
- **决策逻辑差异**：为何A选择生态绑定，B选择灵活性
- **锁定因素差异**：各竞品的技术栈绑定差异

### 3. 历史根源追溯

对 AET 的每个优势/劣势，追溯其历史根源：
- **优势的历史根源**：追溯到哪个技术决策或架构选择
- **劣势的历史根源**：为何做出该取舍、当时的约束条件

---

## 数据来源优先级

| 信息类型 | 优先来源 |
|---------|---------|
| 技术决策逻辑 | GitHub Issue讨论、技术博客 |
| 版本演进轨迹 | GitHub Commits、Release Notes |
| 架构变化节点 | 技术博客、架构分析文章 |
| 初始形态 | GitHub Release v1.0 |

---

## 约束条件

1. 纵向演进分析聚焦**技术决策逻辑**
2. 决策逻辑还原仅分析**技术约束条件**（技术栈成熟度、实现复杂度、架构限制等）
3. 每个决策需标注数据来源
4. 搜不到的信息标注"暂缺"

---

## JSON字段详细结构

### verticalEvolutionAnalysis 字段结构

```json
{
  "originTracing": {
    "technicalBackground": "技术背景描述",
    "industryEnvironment": "行业环境描述",
    "keyTriggerEvent": "关键触发事件",
    "source": "数据来源"
  },
  "birthNode": {
    "firstReleaseDate": "2023-06-01",
    "initialArchitecture": "初始架构描述",
    "initialPositioning": "初始定位",
    "differenceFromNow": "与现在的差异",
    "source": "GitHub Release v1.0"
  },
  "evolutionTimeline": [
    {
      "version": "v1.0",
      "releaseDate": "2023-06-01",
      "architectureChange": "架构变化描述",
      "featureEvolution": "功能演进描述",
      "milestone": "关键里程碑",
      "source": "GitHub Release Notes"
    }
  ],
  "decisionLogicRestoration": [
    {
      "decision": "选择技术方案A而非B",
      "whyANotB": "选择A的原因",
      "constraintCondition": "约束条件",
      "lockFactor": "锁定因素",
      "howGoodDecisionBecomeBurden": "好决策如何变成包袱",
      "source": "技术博客"
    }
  ],
  "missingInformation": ["暂缺信息列表"]
}
```

### crossVerticalInsightAnalysis 字段结构

```json
{
  "horizontalComparisonMatrix": {
    "dimensions": ["架构", "性能", "成本", "扩展性", "安全"],
    "comparison": {
      "AET": {...},
      "竞品A": {...},
      "竞品B": {...}
    }
  },
  "verticalDifferenceAnalysis": [
    {
      "competitorPair": ["竞品A", "竞品B"],
      "evolutionPathDifference": "演进路径差异描述",
      "decisionLogicDifference": "决策逻辑差异描述",
      "lockFactorDifference": "锁定因素差异描述",
      "source": "纵向演进分析汇总"
    }
  ],
  "historicalRootTrace": [
    {
      "aetAdvantageOrWeakness": "AET优势/劣势描述",
      "historicalRoot": "历史根源（追溯到哪个技术决策）",
      "decisionLogic": "决策逻辑",
      "constraintCondition": "约束条件",
      "source": "AET技术演进历程"
    }
  ]
}
```

---

## Markdown输出示例

### 纵向演进分析章节示例

```markdown
#### **Cursor 纵向演进分析**

**起源追溯**：
- **技术背景**：AI补全技术成熟、VS Code生态完善
- **行业环境**：2023年AI编码助手市场爆发
- **关键触发事件**：创始人观察到AI补全准确率提升
- **来源**：创始人访谈

**诞生节点**：
- **首次发布时间**：2023年6月
- **初始架构形态**：VS Code fork + Electron
- **初始定位**：AI-first code editor
- **与现在的差异**：初始仅支持单文件补全，现在支持多文件编辑
- **来源**：GitHub Release v1.0

**演进历程**：

| 版本 | 发布时间 | 架构变化 | 功能演进 | 关键里程碑 | 来源 |
|------|---------|---------|---------|-----------|------|
| v0.5 | 2023-04 | VS Code 1.80 fork | Tab补全 | 首次公开 | GitHub Release |
| v0.10 | 2023-06 | Background Agents | 多文件编辑 | 突破单文件限制 | GitHub Release |
| v0.42 | 2025-01 | Agent编排增强 | Context awareness | Agentic能力增强 | GitHub Release |

**决策逻辑还原**：

**决策：选择VS Code fork而非自研编辑器**
- **为什么选A不选B**：利用VS Code生态、降低开发成本
- **约束条件**：VS Code更新同步维护成本
- **锁定因素**：VS Code插件生态绑定
- **好决策如何变成包袱**：VS Code更新时需同步维护fork版本
- **来源**：技术博客
```

### 横纵交汇分析章节示例

```markdown
### 纵向差异分析

| 竞品对比 | 演进路径差异 | 决策逻辑差异 | 锁定因素差异 |
|---------|------------|-------------|------------|
| Cursor vs LangGraph | Cursor从VS Code fork演进 | Cursor选择生态绑定路线 | Cursor锁定VS Code生态 |
| AET vs LangGraph | AET从Phase化协作演进 | AET选择规范约束路线 | AET锁定Phase产物固化 |

### 历史根源追溯

| AET优势/劣势 | 历史根源 | 决策逻辑 | 约束条件 | 来源 |
|-------------|---------|---------|---------|------|
| Checkpoint断点恢复（优势） | 2024-03决策：解决长程任务失败率瓶颈 | 竞品无类似机制 | 实现复杂度高 | AET技术演进历程 |
| 无IDE集成（劣势） | 2023-10决策：选择OpenCode平台 | 降低开发成本 | 失去VS Code生态优势 | AET技术演进历程 |
```