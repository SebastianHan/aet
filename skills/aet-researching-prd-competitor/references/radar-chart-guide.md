# 雷达图分析指南（竞品研究视角 - 差异化机会）

本指南用于PRD Phase 2竞品研究阶段，通过雷达图可视化**差异化机会评估**，辅助技术路线决策。

## Mermaid Radar Chart语法规范

### 版本要求

雷达图从 **Mermaid v11.6.0** 开始支持，使用 `radar-beta` 关键字。

### 基础语法结构

```markdown
radar-beta
  title <标题文本>                   # 可选
  axis <轴定义>                      # 必需
  curve <曲线定义>                   # 必需
  <配置选项>                         # 可选
```

### 轴定义语法

```markdown
# 单轴定义（带标签）
axis id1["Label1"]

# 多轴定义（无标签）
axis id2, id3, id4

# 多轴定义（带标签）
axis a["Axis A"], b["Axis B"], c["Axis C"]
```

### 曲线定义语法

```markdown
# 方式 1: 数值列表（按轴定义顺序）
curve id1["Label1"]{1, 2, 3, 4, 5}

# 方式 2: 键值对（可任意顺序）
curve id2{axis3: 30, axis1: 20, axis2: 10}

# 方式 3: 多曲线单行定义
curve id3{4, 5, 6}, id4{7, 8, 9}
```

### 配置选项

| 参数 | 描述 | 默认值 | 推荐值 |
|------|------|--------|--------|
| `max` | 最大值 | 从数据点计算 | 10（统一量程） |
| `min` | 最小值 | 0 | 0 |
| `graticule` | 网格类型 | circle | polygon（更适合差异化机会分析） |
| `ticks` | 网格层数 | 5 | 5（便于分级判断） |
| `showLegend` | 显示图例 | true | true |

### 颜色和样式配置

通过YAML front matter配置：

```markdown
---
config:
  radar:
    curveOpacity: 0.6           # 曲线填充透明度
    curveStrokeWidth: 2         # 曲线边框宽度
    axisLabelFontSize: 14px     # 轴标签字体大小
  theme: base
  themeVariables:
    cScale0: "#FF6B6B"          # 第1条曲线颜色
    cScale1: "#4ECDC4"          # 第2条曲线颜色
    cScale2: "#45B7D1"          # 第3条曲线颜色
---
```

**支持最多12条曲线**（cScale0-cScale11），但建议最多3条以保证可读性。

---

## 差异化机会维度体系设计

### 推荐维度组合（8维度）

基于竞品研究视角，用于评估**差异化机会窗口**，建议以下维度体系：

| 维度类别 | 维度ID | 维度名称 | 权重 | 评估标准 |
|---------|--------|---------|------|---------|
| **技术维度** | `tech_trend_match` | 技术趋势匹配度 | 18% | 与技术演进方向的一致性（标准演进、技术栈成熟度、范式变化） |
| | `impl_feasibility` | 实现可行度 | 10% | 技术实现门槛评估（团队技能匹配、开发周期预估、资源需求） |
| **机会维度** | `comp_gap_strength` | 竞品缺口强度 | 20% | 竞品未覆盖程度（竞品缺失能力、用户痛点未满足程度、功能空白） |
| | `market_window` | 市场时机窗口 | 10% | 时间窗口评估（行业标准演进时机、竞品跟进节奏、用户需求爆发期） |
| **价值维度** | `user_pain_depth` | 用户痛点深度 | 15% | 需求真实程度（用户调研证据、痛点影响范围、需求稳定性） |
| | `differentiation_potential` | 差异化潜力 | 10% | 竞争优势可持续性（技术壁垒深度、独特机制、护城河强度） |
| **风险维度** | `tech_risk_level` | 技术风险等级 | 7% | 实现失败风险（技术不确定性、依赖风险、兼容性风险） |
| | `comp_follow_risk` | 竞品跟进风险 | 5% | 竞品复制可能性（技术栈门槛、实现复杂度、专利保护） |

### 维度数量约束

- **最少5轴**：保证多维度对比意义
- **最多8轴**：符合可读性规范（Wikipedia最佳实践）
- **本项目推荐**：8轴（覆盖技术/价值/竞争/风险四个维度组）

### 维度相关性检验

**强制要求**：相邻维度应具有逻辑关联，避免人为"邻居关系"。

**循环结构设计**：
```
技术趋势匹配度 → 实现可行度 → 技术风险等级 → 竞品跟进风险 → 竞品缺口强度 → 差异化潜力 → 用户痛点深度 → 市场时机窗口 → 技术趋势匹配度（闭环）
```

**关联逻辑**：
- 技术趋势匹配度 ↔ 实现可行度：趋势匹配但实现难度高的机会需谨慎
- 实现可行度 ↔ 技术风险等级：可行度高但风险大的机会需验证
- 技术风险等级 ↔ 竞品跟进风险：技术风险低的机会容易被竞品跟进
- 竞品跟进风险 ↔ 竞品缺口强度：跟进风险低的领域竞品缺口小
- 竞品缺口强度 ↔ 差异化潜力：缺口强度大的领域差异化潜力高
- 差异化潜力 ↔ 用户痛点深度：差异化潜力高的领域用户痛点深
- 用户痛点深度 ↔ 市场时机窗口：痛点深的领域时机窗口更紧迫
- 市场时机窗口 ↔ 技术趋势匹配度：时机窗口与技术趋势演进相关

---

## 权重设置与归一化方法

### 权重分配原则

**高优先级维度**（权重0.15-0.20）：
- 竞品缺口强度（20%）- 差异化机会的核心驱动
- 技术趋势匹配度（18%）- 技术方向一致性关键
- 用户痛点深度（15%）- 价值验证基础

**中优先级维度**（权重0.08-0.12）：
- 实现可行度（10%）
- 市场时机窗口（10%）
- 差异化潜力（10%）

**低优先级维度**（权重0.05-0.08）：
- 技术风险等级（7%）
- 竞品跟进风险（5%）

### 归一化处理方法

**Min-Max归一化（推荐）**：
```python
normalized_value = (raw_value - min_value) / (max_value - min_value) * scale_max

# 示例：将原始评分映射到0-10量程
# 原始评分：75分（满分100）
# normalized_value = (75 - 0) / (100 - 0) * 10 = 7.5
```

**统一量程约束**：
- 所有维度必须使用相同量程（推荐0-10）
- 方向一致性：确保"高分=优势"（反向指标需转换，如风险等级：低风险=高分）
- 缺失值处理：不允许有空值，需填充或删除创新点

### 加权综合得分计算

```python
weighted_score = sum(normalized_value_i * weight_i for all dimensions)

# 示例：
# Opportunity-001雷达图数据：[9.5, 7.0, 9.0, 8.0, 8.5, 9.0, 6.0, 5.0]
# 权重：[0.18, 0.10, 0.20, 0.10, 0.15, 0.10, 0.07, 0.05]
# 加权得分 = 9.5*0.18 + 7.0*0.10 + 9.0*0.20 + 8.0*0.10 + 8.5*0.15 + 9.0*0.10 + 6.0*0.07 + 5.0*0.05 = 8.35
```

---

## 图形特征解读规范

### 图形模式分类

| 图形模式 | 识别标准 | 优先级判断 | 行动建议 |
|---------|---------|-----------|---------|
| **大面积均衡型** | 面积覆盖≥70%，所有维度≥6.0分 | **高优先级（P0）** | 优先实施 - 所有维度优势明显 |
| **大面积偏重型** | 面积覆盖≥60%，峰值维度≥8.5分 | **中高优先级（P1）** | 重点实施 - 强化优势维度，解决低维度风险 |
| **小面积均衡型** | 面积覆盖<40%，所有维度<5.0分 | **低优先级（P2）** | 暂缓 - 价值有限 |
| **小面积偏重型** | 面积覆盖40-60%，峰值维度≥7.0分 | **选择性（P1-P2）** | 针对特定需求评估 |
| **锯齿状** | 峰值与谷值差距≥4.0分 | **需验证** | 评估风险，选择性实施 |

### 峰值与谷值解读

**峰值（突出优势）**：
- 判断标准：维度得分≥8.5分
- 价值：核心差异化点，需强化投入形成壁垒
- 行动：优先资源投入，建立可持续优势

**谷值（显著劣势）**：
- 判断标准：维度得分<4.0分
- 价值：风险点或改进方向
- 行动：评估是否可接受或需改进，标注风险

### 面积计算与感知扭曲

**面积公式**：
```python
area = 0.5 * sum(r_i * r_{i+1} * sin(theta_i) for all adjacent pairs)

# 面积按平方增长示例：
方案A（均值90）：area_A ≈ 90² = 8100
方案B（均值82）：area_B ≈ 82² = 6724
# 实际差异10%，面积感知放大20%（8100/6724 ≈ 1.20）
```

**解读调整建议**：
- 不要仅依赖面积感知判断优劣
- 使用权重综合得分作为主要判断依据
- 结合各维度具体数值进行理性分析

---

## 多机会点对比分析方法

### Mermaid实现示例

```markdown
---
config:
  radar:
    curveOpacity: 0.6
    curveStrokeWidth: 2
    axisLabelFontSize: 14px
  theme: base
  themeVariables:
    cScale0: "#FF6B6B"
    cScale1: "#4ECDC4"
    cScale2: "#45B7D1"
---
radar-beta
  title 差异化机会多维度对比评估
  axis tech_trend_match["技术趋势匹配"], impl_feasibility["实现可行度"], comp_gap_strength["竞品缺口"]
  axis market_window["市场时机窗口"], user_pain_depth["用户痛点深度"], differentiation_potential["差异化潜力"]
  axis tech_risk_level["技术风险"], comp_follow_risk["竞品跟进风险"]
  
  curve opp001["规范驱动开发机会"]{9.5, 7.0, 9.0, 8.0, 8.5, 9.0, 6.0, 5.0}
  curve opp002["阶段产物固化机会"]{7.0, 9.0, 6.0, 7.0, 8.0, 7.5, 8.0, 6.0}
  curve opp003["Checkpoint恢复机会"]{8.5, 7.5, 8.0, 9.0, 7.0, 8.0, 9.0, 5.5}
  
  max 10
  min 0
  graticule polygon
  ticks 5
  showLegend true
```

### JSON数据结构

```json
{
  "radarChartAnalysis": {
    "dimensionConfig": [
      {
        "id": "tech_trend_match",
        "name": "技术趋势匹配度",
        "category": "技术维度",
        "weight": 0.18,
        "scale": {"min": 0, "max": 10},
        "description": "与技术演进方向的一致性评估"
      }
      // ... 其他维度
    ],
    
    "opportunityRadarData": [
      {
        "opportunityId": "opp-001",
        "opportunityName": "规范驱动开发（SDD）差异化机会",
        "priority": "P0",
        "radarValues": {
          "tech_trend_match": 9.5,
          "impl_feasibility": 7.0,
          "comp_gap_strength": 9.0,
          "market_window": 8.0,
          "user_pain_depth": 8.5,
          "differentiation_potential": 9.0,
          "tech_risk_level": 6.0,
          "comp_follow_risk": 5.0
        },
        "weightedScore": 8.35,
        "areaCoverage": "80%",
        "graphPattern": "大面积均衡型",
        "priorityJudgment": "高优先级",
        "actionRecommendation": "优先实施，强化技术壁垒投入"
      }
      // ... 其他机会点
    ]
  }
}
```

---

## 与SWOT分析整合方案（跨阶段数据流）

### 整合逻辑

雷达图与SWOT分析形成跨阶段互补关系：

| 分析工具 | 所在阶段 | 分析层级 | 核心价值 | 输出形式 |
|---------|---------|---------|---------|---------|
| **雷达图分析** | Phase 2（竞品研究） | 差异化机会层面 | 多维度量化对比、优先级可视化 | Mermaid图形+量化得分 |
| **SWOT分析** | Phase 3（创新分析） | 整体创新层面 | 战略框架、壁垒汇总、机会威胁识别 | 文字论述+矩阵表格 |

**数据流关系**：
```
Phase 2（竞品研究）
    ↓ 生成opportunityRadarData
    ↓ 输出：02-competitor-research.json.radarChartAnalysis
    
Phase 3（创新分析）
    ↓ 读取Phase 2的雷达图数据
    ↓ 生成SWOT分析
    ↓ 输出：03-innovation-analysis.json.swotAnalysis
```

### 维度映射关系

```
SWOT维度（Phase 3） → 雷达图维度（Phase 2）映射：

Strengths（优势）→
  - 技术趋势匹配度（tech_trend_match）- 技术方向一致性带来的优势
  - 差异化潜力（differentiation_potential）- 竞争优势可持续性

Weaknesses（劣势）→
  - 实现可行度（impl_feasibility）- 技术实现门槛带来的劣势
  - 技术风险等级（tech_risk_level）- 实现失败风险
  - 竞品跟进风险（comp_follow_risk）- 竞品复制可能性

Opportunities（机会）→
  - 竞品缺口强度（comp_gap_strength）- 竞品未覆盖的市场空白
  - 市场时机窗口（market_window）- 时间窗口评估

Threats（威胁）→
  - 竞品跟进风险（comp_follow_risk）- 竞品复制可能性
  - 技术风险等级（tech_risk_level）- 技术不确定性
```
SWOT维度 → 雷达图维度映射：

Strengths（优势）→
  - 技术壁垒强度（tech_barrier）
  - 差异化强度（differentiation）

Weaknesses（劣势）→
  - 实现复杂度（impl_complex）
  - 技术风险等级（tech_risk）
  - 市场风险等级（market_risk）

Opportunities（机会）→
  - 竞品覆盖度（comp_gap）
  - 业务价值潜力（biz_value）

Threats（威胁）→
  - 市场风险等级（market_risk）
  - 技术风险等级（tech_risk）
```

### 数据流整合（跨阶段）

```json
// Phase 2产物：02-competitor-research.json
{
  "radarChartAnalysis": {
    "opportunityRadarData": [
      {
        "opportunityId": "opp-001",  // 差异化机会ID
        "radarValues": {
          "comp_gap_strength": 9.5,  // 对应SWOT Opportunities
          "differentiation_potential": 9.0  // 对应SWOT Strengths
        }
      }
    ]
  }
}

// Phase 3产物：03-innovation-analysis.json（SWOT引用Phase 2数据）
{
  "swotAnalysis": {
    "opportunities": [
      {
        "item": "竞品技术缺口（规范驱动开发）",
        "linkedOpportunity": "opp-001",  // 映射到Phase 2雷达图机会点
        "evidenceSource": "02-competitor-research.json.radarChartAnalysis"
      }
    ]
  }
}
```

---

## 局限性管理策略

### 主要局限性

根据Wikipedia雷达图局限性说明：

1. **人为邻居关系**：相邻维度未必相关
   - **管理策略**：执行维度相关性检验，设计循环闭环结构

2. **面积感知扭曲**：大数值放大视觉影响
   - **管理策略**：使用权重综合得分补充图形判断

3. **难以精确对比**：多方案重叠时不易判断
   - **管理策略**：提供数据表格辅助精确对比

4. **尺度限制**：维度过多时图形混乱
   - **管理策略**：严格控制维度数量≤8个

### 强制检查清单

- [ ] 所有维度数值在同一量程范围（0-10）
- [ ] 方向一致性：确保"高分=优势"（反向指标需转换）
- [ ] 缺失值处理：不允许有空值
- [ ] 异常值识别：极端值需标注说明
- [ ] 维度相关性检验：相邻维度具有逻辑关联
- [ ] 可访问性备选方案：提供分组柱状图或数据表格

---

## 可访问性要求

根据本项目charts.csv规范，雷达图可访问性评级为**Grade B**。

**强制要求**：
- 限制维度数量为5-8个
- 必须提供分组柱状图备选方案
- 包含原始数据表格
- 图例标签必须包含颜色和形状描述

**可访问性备选方案**：

```markdown
### 附录：分组柱状图备选方案（可访问性要求）

| 创新点 | 技术壁垒 | 实现复杂度 | 用户价值 | 业务价值 | 竞品覆盖 | 差异化 | 技术风险 | 市场风险 |
|-------|---------|-----------|---------|---------|---------|--------|---------|---------|
| Inno-001 | 9.5 | 7.0 | 9.0 | 8.0 | 8.5 | 9.0 | 6.0 | 5.0 |
| Inno-002 | 7.0 | 9.0 | 6.0 | 7.0 | 8.0 | 7.5 | 8.0 | 6.0 |
| Inno-003 | 8.5 | 7.5 | 8.0 | 9.0 | 7.0 | 8.0 | 9.0 | 5.5 |
```

---

## Markdown输出格式示例

在创新分析报告末尾新增章节：

```markdown
## 十一、创新点雷达图分析

本节通过雷达图可视化各创新点的多维度评估，辅助创新优先级决策。

### 11.1 维度体系说明

| 维度 | 权重 | 评估标准 | 数据来源 |
|-----|------|---------|---------|
| 技术壁垒强度 | 18% | 竞品绕过难度 | 技术方案分析 |
| 用户价值强度 | 20% | 需求真实程度 | 用户调研数据 |
| 差异化强度 | 15% | 竞争优势独特性 | 竞品对比分析 |
| 实现复杂度 | 10% | 开发成本评估 | 技术架构评估 |
| 竞品覆盖度 | 10% | 竞品未覆盖程度 | 竞品研究报告 |
| 业务价值潜力 | 10% | 商业收益预期 | 商业分析 |
| 技术风险等级 | 7% | 实现失败风险 | 技术评估 |
| 市场风险等级 | 5% | 市场接受度风险 | 市场调研 |

### 11.2 创新点对比雷达图

[Mermaid雷达图代码块]

### 11.3 图形特征解读

[各创新点解读]

### 11.4 量化得分对比

| 创新点 | 加权综合得分 | 面积覆盖度 | 图形模式 | 排名 |
|-------|------------|-----------|---------|------|
| Inno-001 | 8.35 | 80% | 大面积均衡型 | 1 |
| Inno-002 | 7.48 | 65% | 大面积偏重型 | 2 |

### 11.5 决策建议

[优先级建议]

### 11.6 雷达图局限性说明

- 维度邻居关系经过相关性检验
- 面积感知可能扭曲实际差异，建议结合量化得分判断
- 提供数据表格辅助精确对比

### 11.7 可访问性备选方案

[分组柱状图数据表格]
```

---

## 参考资源

### Mermaid官方文档
- [Radar Chart Syntax](https://mermaid.js.org/syntax/radar.html)
- [Theme Configuration](https://mermaid.js.org/config/theming.html)

### 理论基础
- Wikipedia Radar Chart - 应用场景与局限性
- NIST/SEMATECH Star Plot Methodology

### 本项目相关规范
- `skills/ui-ux-pro-max/data/charts.csv` 第15行 - Radar/Spider Chart规范
- `skills/aet-analyzing-prd-innovation/references/swot-analysis-guide.md` - SWOT分析指南
- `skills/aet-guiding-innovation/SKILL.md` - 创新方法论指导