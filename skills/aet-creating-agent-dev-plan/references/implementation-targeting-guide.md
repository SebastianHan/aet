# Agent 开发计划落点参考

本参考用于把 Agent 设计文档或 grounded issue 结论转换成具体的仓库改动清单。它不是强制标准，但可帮助你在 **任意目标仓库** 中定位最可能的 Agent 实现落点，并避免漏掉入口、核心模块、适配层、安装分发、验证和文档这些常见位置。

---

## 1. 先从设计或 issue 提取什么

在看代码之前，先从上游设计文档或 issue 中抽出以下信息：

1. **Agent 载体结论**
   - 新 agent / 扩已有 agent / agent suite extension / runtime support module + agent integration / mixed
2. **必须新增 / 修改 / 不动的边界**
3. **端到端流程与控制点**
   - 输入、审批 / review、执行、失败、恢复、输出
4. **集成点**
   - 上游输入、下游消费、平台依赖、runtime registration、适配器发现与安装
5. **验收场景**
   - happy path、error path，以及 approval / rollback / retry / audit / recovery 等非 happy path

如果这些信息提取不出来，说明应该先回到设计阶段，而不是继续做计划。

---

## 1.1 先判断 carrier 是“定义载体”还是“运行时代码”

在 agent 项目里，`agents/`、`commands/`、`skills/` 往往首先是**平台识别的定义载体**，而不是语言运行时 package。规划前必须回答：

1. 文件格式是什么？Markdown、`SKILL.md`、YAML、JSON、JS，还是 Python / TypeScript 源码？
2. 是谁识别它？OpenCode、Claude Plugin、Codex、命令系统，还是 Python / Node 运行时？
3. 真正的可执行逻辑是不是应该落在 `src/` / `lib/` / `scripts/` 等运行时目录？

如果没有这些证据，就不要把 `agents/`、`commands/`、`skills/` 规划成 `__init__.py`、`agent.py`、`skill.py` 之类的语言包结构。

如果仓库还是 greenfield，或者当前只有 issue / design 文档，没有 live code 佐证，也不要为了“显得具体”而臆造包结构。此时更合理的第一批任务通常是：

- 确认 carrier 格式与平台识别方式
- 确认最小可运行目录 / 文件约定
- 确认平台适配清单与安装说明格式
- 仅在约定明确后，再展开到 runtime code 路径

## 1.2 再判断是不是在交付“Agent 产品面”

在 AET 这类仓库里，开发 Agent 常见的不是单点改动，而是多层同步交付：

- `agents/` 中的 runtime agent definitions
- `agents/*/prompts/` 或等价 prompt / reference assets
- `skills/*/SKILL.md` 技能包
- `commands/*.md` 或其他触发入口
- `src/` / `lib/` / `scripts/` 中的 orchestration / runtime logic
- `.opencode/` / `.codex/` / `.claude-plugin/` 适配层
- `INSTALL.md`、README、bootstrap 说明
- tests / walkthrough / evidence artifacts

因此，当设计目标是“给别的仓库开发一套这种 Agent 能力”时，规划阶段要先判断：

1. 这套能力最终会通过哪些层被用户或平台看见？
2. 哪些层必须同步上线，否则 agent 无法发现、安装、触发或验证？
3. 哪些层在目标仓库中不存在，应明确写“不涉及”，而不是默认照搬？

---

## 2. 通用落点类型

### 类型 A：Agent 入口 / trigger 落点

**通常涉及：**

- `commands/`
- slash command / chat command / CLI 入口
- 平台 bootstrap / adapter invoke 入口

**计划时至少要有：**

- 入口文件创建 / 修改任务
- 入口触发链路验证任务
- 使用说明或契约同步任务（如影响明显）

**额外提醒：** 若 `commands/` 是平台命令定义目录，优先规划命令定义文件本身及其被谁识别；不要默认把 `commands/` 规划成 Python CLI package。

### 类型 B：agent / prompt / runtime 落点

**通常涉及：**

- `agents/`
- `prompts/`
- runtime / orchestration modules

**计划时至少要有：**

- agent 定义、prompt、协调逻辑任务
- 注册 / 路由 / capability wiring 任务
- prompt / agent 行为 walkthrough 或测试任务
- 若目标是完整 agent 套件，还要检查是否缺少与之配套的 command、skill、adapter、install docs 任务

**额外提醒：** `agents/` 可能是 Markdown / prompt / metadata 定义目录，而不是语言类定义目录。若需要运行时代码，通常应放在 `src/` / `lib/` / `scripts/` 等位置，除非仓库事实证明相反。

### 类型 C：Agent support module / registration 落点

**通常涉及：**

- `src/`
- `lib/`
- `pkg/`
- `internal/`
- `config/`
- agent registration files

**计划时至少要有：**

- Agent support module 逻辑与契约修改任务
- registration、配置、默认值调整任务
- 兼容性、迁移或降级任务

### 类型 D：platform adapter 落点

**通常涉及：**

- `scripts/`
- `.opencode/`
- `.codex/`
- `.claude-plugin/`
- adapter manifests / bootstrap scripts / platform discovery config

**计划时至少要有：**

- 适配器生成或更新任务
- 平台发现 / 加载 / 安装 / 调用链路验证任务
- 适配器与平台无关定义（`agents/`、`commands/`、`skills/` 等）的同步一致性检查任务

### 类型 E：install / bootstrap / distribution 落点

**通常涉及：**

- `README.md`
- `.claude-plugin/INSTALL.md`
- `.opencode/INSTALL.md`
- `.codex/INSTALL.md`
- bootstrap scripts

**计划时至少要有：**

- 安装 / bootstrap 文档变更任务
- 平台发现说明更新任务
- 安装成功后的验证任务

### 类型 F：install / bootstrap / distribution 落点

**通常涉及：**

- `README.md`
- `.claude-plugin/INSTALL.md`
- `.opencode/INSTALL.md`
- `.codex/INSTALL.md`
- bootstrap scripts

**计划时至少要有：**

- 安装 / bootstrap 文档变更任务
- 平台发现说明更新任务
- 安装成功后的验证任务

---

## 3. 何时必须纳入 docs / tests / evidence

以下情况通常不能省：

1. **用户入口变化** → 要更新命令文档 / README / operator guide
2. **行为变化明显** → 要补 walkthrough、fixture、示例或 review 验证
3. **引入 approval / rollback / recovery / audit** → 要补控制路径验证说明
4. **Agent registration 或配置变更** → 要补升级 / 兼容 / 风险说明
5. **自动执行或副作用增强** → 要补证据收集与风险兜底说明
6. **平台适配层变更** → 要补适配器安装 / 加载 / 发现 / 调用证据和兼容性说明

---

## 4. 任务块拆分建议

### 推荐拆分方式 1：按层分块

- Block A：入口与契约
- Block B：核心能力 / runtime
- Block C：registration / 执行边界 / adapter wiring
- Block D：tests / docs / verification

### 推荐拆分方式 2：按能力纵切分块

- Block A：输入与上下文接入
- Block B：核心判断或编排
- Block C：执行 / 审批 / 回滚 / platform adapter 接线
- Block D：验证与文档补齐

### 推荐拆分方式 3：按风险先后分块

- Block A：高风险接线点（入口、adapter、registration）
- Block B：核心能力实现
- Block C：非 happy path 与恢复
- Block D：验证与文档

**原则：**

- 单个 block 必须服务一个明确目标。
- block 内 checkbox 必须是动作，不是描述。
- 测试 / 验证不要全部压到最后一个“顺手补一下”。

---

## 5. 暂定落点如何处理

当只有 AtomGit issue + README，没有完整本地仓库时：

1. 允许写 **暂定路径**，但必须标注：
   - 置信度（High / Medium / Low）
   - 推断依据（README、目录树、issue 评论、类似模块）
2. 允许把第一批任务写成“确认真实落点 / 同步本地仓库上下文”
3. 不允许把猜测路径写成确定事实

---

## 6. 常见误判

### 误判 A：设计提到 prompt，就一定要新增 `agents/`

不一定。

- 若只是现有 agent 内部引用 prompt/reference，可能根本不需要新 agent registry 改动。

### 误判 B：所有计划都必须写 agent / skill / config / tests / docs 五六大类

不一定。

- 只把真正受影响的类别写进计划。其余类别应明确“不涉及”。

### 误判 B1：用户说“开发 Agent”，计划却只覆盖一层

不行。

- 如果目标仓库的 agent 能力需要 agent 定义、prompt、command、adapter、install docs 才能真正交付，就不能只写其中一项。
- 正确做法是：覆盖完整交付面，或明确声明哪些层不在范围内以及为什么。

### 误判 C：验证 = “跑下现有测试”

不够。

- 验证必须对应到设计里的 acceptance scenarios，尤其是 approval / rollback / recovery / error path。

### 误判 D：风险控制可以留给实现者临场判断

不行。

- 若 issue 涉及副作用或自动执行，计划阶段就要给出审批、回滚、审计、证据策略。

### 误判 E：平台适配层会自动跟随核心实现

不一定。

- 仓库中的 `.opencode/`、`.codex/`、`.claude-plugin/` 或等价适配层往往有独立清单、入口、安装说明与加载行为。
- 如果能力通过这些平台暴露，就必须显式写出生成 / 更新与验证任务，不能默认“主逻辑改完就行”。

### 误判 F：仓库用了 Python / Node，就把 carrier 目录一起写成对应语言包

不行。

- 运行时语言只说明 `src/` / `lib/` / `scripts/` 等模块可能使用该语言，不等于 `agents/` / `commands/` / `skills/` 也必须是该语言。
- 在 OpenCode / Claude Plugin / Codex 这类项目里，carrier 往往是平台定义文件，语言代码只是其背后的实现支撑。

### 误判 G：为了满足“精确文件路径”，臆造脚手架

不行。

- “精确”不等于“乱猜”。
- 如果 live repo / 平台文档没有证明 `agent.py`、`skill.py`、`__init__.py`、`pyproject.toml` 等文件必然存在，就应先规划确认任务，而不是把猜测写成计划。

---

## 7. 开发计划自检问题

在输出开发计划前，建议至少回答：

1. 每个设计能力有没有任务覆盖？
2. 每个任务有没有明确文件路径？
3. 是否有任务专门处理 approval / rollback / audit / retry / duplicate-trigger？
4. 若仓库存在平台适配层，是否有任务专门处理 `.opencode/`、`.codex/`、`.claude-plugin/` 或等价适配层的生成 / 更新与验证？
5. 是否有验证矩阵覆盖正常与非正常路径？
6. 下游实现阶段看到这份计划后，能不能直接开始做？
7. 暂定落点是否已经明确标注置信度和依据？
