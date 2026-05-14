# SWOT分析指南（技术创新视角）

## SWOT定义

SWOT分析是一种战略框架，从四个象限评估创新方案：

| 象限 | 定义 | 技术创新视角内容 |
|------|------|-----------------|
| **Strengths（优势）** | 内部正面因素 | 技术实现独特性、壁垒强度、竞品缺失能力、已有技术积累 |
| **Weaknesses（劣势）** | 内部负面因素 | 实现短板、技术栈依赖、资源限制、已识别风险 |
| **Opportunities（机会）** | 外部正面因素 | 技术趋势利好、标准演进机会、竞品技术路线空白 |
| **Threats（威胁）** | 外部负面因素 | 竞品跟进可能性、替代技术出现、技术标准变化 |

---

## 数据来源映射

| SWOT象限 | 数据来源 | 映射关系 |
|---------|---------|---------|
| **Strengths** | `barrierAnalysis.barrierType`、`barrierAnalysis.barrierStrength`、`competitorGapAnchor`、`gapEvidence.gapStrength` | 壁垒类型和强度 → 优势项；竞品缺口 → 优势证据 |
| **Weaknesses** | `risks[].risk`、`risks[].impact`、`technicalSolution.implementationComplexity` | 风险项 → 劣势项；实现复杂度 → 劣势证据 |
| **Opportunities** | `02-competitor-research.json.technicalTrends`、`competitorGapAnchor`、`gapEvidence.gapStrength` | 技术趋势 → 机会项；竞品缺口强度 → 机会窗口 |
| **Threats** | `barrierAnalysis.bypassPossibility`、`02-competitor-research.json.competitors[].techStack` | 绕过可能性 → 威胁概率；竞品技术栈 → 威胁来源 |

---

## 约束条件

### 优势/劣势约束

**聚焦技术维度**：
- 实现复杂度
- 机制耦合
- 数据设计
- 算法门槛
- 技术栈依赖
- 工程资源限制

**禁止市场叙事**：
- ❌ 生态构建
- ❌ 社区规模
- ❌ 运营护城河
- ❌ 用户规模

### 机会/威胁约束

**聚焦可预测因素**：
- 技术趋势（技术栈演进、架构范式变化）
- 标准演进（行业标准、规范变化）
- 竞品技术路线（技术方案跟进）
- 绕过路径（替代技术可行性）

**禁止市场叙事**：
- ❌ 融资机会
- ❌ 市场增长
- ❌ 商业模式创新

---

## JSON字段详细结构

### swotAnalysis 字段结构

```json
{
  "swotAnalysis": {
    // Strengths（优势）- 内部正面因素
    "strengths": [
      {
        "item": "优势项名称",
        "category": "技术壁垒|机制约束|数据设计|实现复杂度",
        "evidence": "证据来源（02-competitor-research.json字段路径或03-innovation-analysis.json字段路径）",
        "linkedBarrier": "关联创新点ID（如inno-001）",
        "sustainability": "可持续时间（如2-3年）"
      }
    ],
    
    // Weaknesses（劣势）- 内部负面因素
    "weaknesses": [
      {
        "item": "劣势项名称",
        "category": "技术栈依赖|用户体验|工程资源|技术栈",
        "evidence": "证据来源",
        "risk": "风险影响",
        "mitigation": "缓解措施"
      }
    ],
    
    // Opportunities（机会）- 外部正面因素
    "opportunities": [
      {
        "item": "机会项名称",
        "category": "技术趋势|竞品空白|标准演进|市场需求",
        "evidence": "证据来源（02-competitor-research.json字段路径）",
        "linkedInnovation": "关联创新点ID",
        "windowDuration": "时间窗口（如2-3年）"
      }
    ],
    
    // Threats（威胁）- 外部负面因素
    "threats": [
      {
        "item": "威胁项名称",
        "category": "技术演进|竞品跟进|技术标准变化|开源竞争",
        "evidence": "证据来源",
        "impact": "影响评估",
        "probability": "概率估计（如30%）",
        "defenseStrategy": "防御策略"
      }
    ],
    
    // SWOT策略矩阵
    "strategyMatrix": [
      {
        "strategyType": "SO|WO|ST|WT",
        "description": "策略描述",
        "linkedFeatures": ["FR-002"],
        "priority": "P0|P1|P2"
      }
    ],
    
    // 分析约束声明
    "constraintsApplied": [
      "SWOT分析聚焦技术维度",
      "禁止市场叙事",
      "每个象限项均标注数据来源"
    ]
  }
}
```

---

## Markdown输出格式

### 新增章节位置

在 `03-innovation-analysis.md` 末尾新增（FR→Inno映射表之后）：

```markdown
## 十、SWOT分析矩阵

本节从技术创新视角对整体创新方案进行SWOT战略分析。

### 10.1 Strengths（优势）

| 优势项 | 类别 | 证据来源 | 可持续性 | 关联创新点 |
|-------|------|---------|---------|-----------|
| [优势名称] | [技术壁垒/机制约束/数据设计/实现复杂度] | [证据来源字段路径] | [可持续时间] | [关联创新点ID] |

### 10.2 Weaknesses（劣势）

| 劣势项 | 类别 | 证据来源 | 风险影响 | 缓解措施 |
|-------|------|---------|---------|---------|
| [劣势名称] | [技术栈依赖/用户体验/工程资源/技术栈] | [证据来源字段路径] | [风险影响] | [缓解措施] |

### 10.3 Opportunities（机会）

| 机会项 | 类别 | 证据来源 | 关联创新点 | 时间窗口 |
|-------|------|---------|-----------|---------|
| [机会名称] | [技术趋势/竞品空白/标准演进/市场需求] | [证据来源字段路径] | [关联创新点ID] | [时间窗口] |

### 10.4 Threats（威胁）

| 威胁项 | 类别 | 证据来源 | 影响评估 | 概率估计 | 防御策略 |
|-------|------|---------|---------|---------|---------|
| [威胁名称] | [技术演进/竞品跟进/技术标准变化/开源竞争] | [证据来源字段路径] | [影响评估] | [概率] | [防御策略] |

### 10.5 SWOT策略矩阵

| 策略类型 | 策略描述 | 关联功能需求 | 优先级 |
|---------|---------|-------------|--------|
| **SO（优势-机会）** | [利用优势抓住机会] | [FR-XXX] | P0/P1/P2 |
| **WO（劣势-机会）** | [改进劣势抓住机会] | [FR-XXX] | P0/P1/P2 |
| **ST（优势-威胁）** | [利用优势应对威胁] | [FR-XXX] | P0/P1/P2 |
| **WT（劣势-威胁）** | [改进劣势应对威胁] | [FR-XXX] | P0/P1/P2 |

**分析约束**：
- 本SWOT分析聚焦技术创新视角
- 所有证据来源标注至具体字段路径
```

---

## SWOT策略矩阵说明

| 策略类型 | 组合逻辑 | 应用场景 |
|---------|---------|---------|
| **SO（优势-机会）** | 利用内部优势抓住外部机会 | 最大优势+最大机会的创新点，优先级P0 |
| **WO（劣势-机会）** | 改进内部劣势抓住外部机会 | 存在劣势但机会窗口明确的创新点，优先级P1 |
| **ST（优势-威胁）** | 利用内部优势应对外部威胁 | 优势明显但存在竞品跟进风险，需防御性策略 |
| **WT（劣势-威胁）** | 改进内部劣势应对外部威胁 | 劣势+威胁组合最危险，需缓解措施和监控 |