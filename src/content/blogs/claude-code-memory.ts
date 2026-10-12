export const body = `## 概述

Claude Code 的跨对话记忆系统是一套**纯文件系统实现**的持久化机制。没有向量数据库，没有嵌入模型，完全依赖结构化 Markdown 文件 + LLM 理解。其核心设计哲学是：**只保存从代码库本身无法推导出的信息**。


## 一、记忆的定义

### 什么是记忆

记忆是跨对话持久保存的、关于用户、项目和协作方式的**非结构化文本观察**。每条记忆保存为一个独立的 Markdown 文件，带有标准 frontmatter：

\`\`\`
---
name: 记忆名称
description: 一行描述（用于相关性筛选，要尽量具体）
type: user | feedback | project | reference
---

记忆内容正文
**Why:** 产生这条记忆的原因
**How to apply:** 何时应用这条记忆
\`\`\`

### 四种记忆类型

| 类型 | 保存什么 | 典型触发场景 |
| --- | --- | --- |
| \`user\` | 用户的角色、背景、技能、偏好 | 用户提到自己是数据科学家；用户说自己熟悉 Go 但不熟悉 React |
| \`feedback\` | 用户对 Claude 行为的纠正或确认 | 用户说"不要 mock 数据库"；用户说"这个方案很好，继续这样做" |
| \`project\` | 项目上下文（截止日期、决策动机、正在进行的工作） | 用户提到 merge freeze 从某天开始；用户解释为什么要重写某个模块 |
| \`reference\` | 外部系统的指针 | 用户说 bug 在 Linear 的 INGEST 项目里追踪 |

### 明确不保存的内容

以下内容**不应该**保存为记忆，即使用户明确要求：

- 代码模式、架构、文件路径、项目结构 → 可以通过读代码获得
- Git 历史、近期变更、谁改了什么 → \`git log\` / \`git blame\` 是权威来源
- 调试方案或修复配方 → 修复已在代码里，commit message 有上下文
- CLAUDE.md 文件中已有的内容
- 临时任务状态、当前对话中的进行中工作

如果用户要求保存 PR 列表或活动摘要，应该反问：其中**出乎意料或不显而易见**的部分是什么——那才是值得保存的。


## 二、存储结构

### 目录布局

记忆按**项目**隔离，路径基于当前 git 仓库根目录：

\`\`\`
~/.claude/projects/<sanitized-git-root>/memory/
├── MEMORY.md              ← 索引文件（每次对话都加载）
├── user_role.md           ← 具体记忆文件
├── feedback_testing.md
├── project_deadline.md
└── ...
\`\`\`

路径解析优先级（\`getAutoMemPath\`）：

1. \`CLAUDE_COWORK_MEMORY_PATH_OVERRIDE\` 环境变量（Cowork 场景用）
2. \`settings.json\` 中的 \`autoMemoryDirectory\`（仅信任 policy/local/user 来源，**不信任项目级 .claude/settings.json**，防止恶意仓库重定向写入 \`~/.ssh\`）
3. 默认：\`~/.claude/projects/<sanitized-git-root>/memory/\`

同一 git 仓库的所有 worktree 共享同一个记忆目录（通过 \`findCanonicalGitRoot\` 确保）。

### MEMORY.md：索引文件

MEMORY.md 是**索引**，不是内容本身。每条记录一行：

\`\`\`
- [用户角色](user_role.md) — 数据科学家，关注可观测性
- [测试规范](feedback_testing.md) — 禁止 mock 数据库，原因：历史事故
- [项目截止日期](project_deadline.md) — merge freeze 2026-03-05
\`\`\`

严格限制：

- **最多 200 行**，超出截断并附警告
- **最多 25,000 字节**，防止长行撑爆 token

MEMORY.md 的内容**每次对话都会直接注入 System Prompt**，是所有记忆中唯一"无条件加载"的。

### 记忆文件上限

扫描时最多处理 **200 个** \`.md\` 文件（按最近修改时间排序取前 200），超出部分在本次对话中不可见。


## 三、记忆的生成（写入）

记忆有两条写入路径：**主动写入**和**后台提取**。

### 3.1 主动写入（主模型）

Claude 在对话过程中自主判断何时需要保存记忆，System Prompt 中的规则驱动这个判断：

**触发时机**：

- 用户纠正 Claude 的行为（"不要这样做"、"停止 X"）
- 用户确认某个不显而易见的做法是正确的（"对，就是这样"）
- 用户说"记住这个"
- Claude 获知用户背景信息（角色、技能、偏好）
- 了解到项目上下文（截止日期、决策原因）

**写入流程（两步操作）**：

\`\`\`
步骤 1：写具体记忆文件
  → 使用 Write 工具创建 feedback_testing.md
  → 包含 frontmatter（name/description/type）和正文

步骤 2：更新 MEMORY.md 索引
  → 在 MEMORY.md 末尾追加一行指针
  → 格式：- [标题](文件名.md) — 一行摘要
\`\`\`

写入前应先检查是否已有可更新的现有文件，避免创建重复记忆。

### 3.2 后台提取（后台 Agent，\`EXTRACT_MEMORIES\` feature flag）

每次完整的 query loop 结束时（模型产出最终响应、无工具调用），后台会异步启动一个**记忆提取子 Agent**：

\`\`\`
对话结束（模型无工具调用）
    ↓
检查：主模型本轮是否已写过记忆？
  ├── 是 → 跳过（避免重复）
  └── 否 → 启动 forked agent
              ↓
         分析最近 N 条消息
              ↓
         判断是否有值得保存的内容
              ↓
         写入记忆文件 + 更新 MEMORY.md
\`\`\`

后台 Agent 的权限受到严格限制：

- 允许：Read、Grep、Glob、只读 Bash（ls/find/cat/stat 等）
- 允许：Edit/Write，**但仅限记忆目录内的路径**
- 禁止：MCP 工具、Agent 工具、有写权限的 Bash、\`rm\` 命令

后台 Agent 使用与主对话相同的 prompt cache，不额外消耗缓存。


## 四、记忆的使用（读取）

### 4.1 MEMORY.md 始终加载

每次对话开始，\`loadMemoryPrompt()\` 在构建 System Prompt 时同步读取 MEMORY.md，将其内容直接注入 System Prompt 的动态段。模型在整个对话中都能看到索引。

### 4.2 相关记忆文件按需注入

每轮对话开始时，\`startRelevantMemoryPrefetch()\` 异步启动相关记忆搜索，**与主模型流式输出并行执行**：

\`\`\`
用户发消息
    ↓
并行启动两件事：
  ① 调用主模型（流式输出）
  ② 相关记忆预取（异步）：
       a. 扫描记忆目录，读取所有文件的 frontmatter（name + description）
       b. 把文件名+描述列表发给 Sonnet 模型
       c. Sonnet 根据当前用户 query 选出最相关的文件（最多 5 个）
       d. 读取这些文件的完整内容
    ↓
主模型响应结束后，把相关文件内容作为 attachment 注入下一轮
\`\`\`

筛选逻辑（\`findRelevantMemories\`）：

- 用 **Sonnet 做语义筛选**，而非关键词匹配或向量检索
- 如果近期已使用某工具，不推荐该工具的参考文档（避免噪音）
- 每次最多注入 **5 个**文件
- 有**会话级 byte 上限**，防止记忆累积撑爆 context
- \`alreadySurfaced\` 集合去重，同一文件在同一会话中不重复注入

### 4.3 访问规则

System Prompt 中明确的访问规则：

- 记忆看起来相关时，主动读取
- 用户明确要求"记住/回忆"时，**必须**访问记忆
- 用户说"忽略记忆"时：视 MEMORY.md 为空，不应用、不引用、不提及任何记忆内容


## 五、记忆的时效性与验证

### 新鲜度标注

记忆文件有 mtime（最后修改时间）。超过 1 天的记忆在被注入时会附带时效性警告：

\`\`\`
This memory is 47 days ago. Memories are point-in-time observations, not live state —
claims about code behavior or file:line citations may be outdated.
Verify against current code before asserting as fact.
\`\`\`

当天或昨天修改的记忆不附加警告（避免噪音）。

### 使用前验证规则

System Prompt 中明确要求模型在推荐记忆内容前先验证：

- 记忆中提到某个**文件路径** → 检查文件是否存在
- 记忆中提到某个**函数或 flag** → grep 确认
- 用户即将基于记忆采取行动 → 先验证，再推荐

**"记忆说 X 存在" ≠ "X 现在存在"**

记忆是写入时刻的快照，不是实时状态。如果记忆与当前观察到的代码冲突，**信任当前代码，更新或删除过时记忆**。


## 六、记忆的更新与废弃

### 更新

写入新记忆前，应先检查是否有可以更新的现有文件：

\`\`\`
1. 读取 MEMORY.md，查找相关条目
2. 如果找到相关文件 → 用 Edit 工具修改现有文件
3. 如果没有 → 创建新文件，并在 MEMORY.md 中添加指针
\`\`\`

记忆文件的 frontmatter（name/description/type）应随内容同步更新。

### 废弃

用户要求"忘记"某事时，找到对应文件并删除，同时从 MEMORY.md 中移除对应指针。

记忆在以下情况下应主动废弃或更新：

- 当前观察到的代码/事实与记忆内容冲突
- 记忆描述的项目状态已发生变化（截止日期已过、决策已改变）
- 记忆中的文件路径、函数名已不存在


## 七、相近与冲突记忆的处理

### 没有自动化的冲突检测

Claude Code **没有相似度计算或自动仲裁机制**。对于相近或冲突的记忆，完全依赖 LLM 的语义理解，通过 prompt 规则约束行为。

### 写入时的防重复

每次写记忆之前，prompt 在三处都有明确指令（主模型 System Prompt、后台提取 Agent prompt、团队记忆 prompt）：

> "Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one."

后台提取 Agent 启动时还会收到**当前所有记忆文件的 manifest 列表**（文件名 + description + 修改时间），并被告知：

> "Check this list before writing — update an existing file rather than creating a duplicate."

模型在写入前能看到"已有什么"，但判断"是否相似"完全靠模型自己的语义理解，没有向量检索或相似度阈值。

### 团队记忆中的私有/团队冲突

这是唯一有**明确冲突处理规则**的场景。对于 \`feedback\` 类型的私有记忆，prompt 规定：

> "Before saving a private feedback memory, check that it doesn't contradict a team feedback memory — if it does, either don't save it or note the override explicitly."

即：私有 feedback 不能静默覆盖团队规范，要么放弃写入，要么在文件中明确标注"此条覆盖了团队规范 X"。

### 读取时的冲突处理

读取时同样没有自动合并，依赖两条规则：

1. **时效性优先**：记忆与当前代码冲突时，信任当前代码，更新或删除过时记忆（\`MEMORY_DRIFT_CAVEAT\`）。
2. **时间戳作为参考**：记忆文件按 \`mtime\` 倒序排列，manifest 中带 ISO 时间戳，超过 1 天的记忆附加新鲜度警告，帮助模型感知哪条记忆更新。

### 已知局限

如果两条矛盾的记忆同时存在、都不过时、都被筛选进了当次 context，系统**没有任何机制能自动发现并解决这个矛盾**。模型会同时看到它们，如何取舍完全取决于当前对话上下文中的 LLM 判断。系统通过"写入前先检查"和"读取时验证"来尽量减少矛盾记忆的产生，但不保证消除。


## 八、记忆与其他持久化机制的区别

| 机制 | 生命周期 | 用途 |
| --- | --- | --- |
| **记忆（Memory）** | 跨对话永久持久 | 用户偏好、项目背景、协作方式 |
| **计划（Plan）** | 当前对话内 | 实现方案的对齐与规划 |
| **任务（Task）** | 当前对话内 | 工作进度追踪、步骤分解 |
| **CLAUDE.md** | 跟随代码库 | 项目级规范、代码约定（可被 git 追踪） |


## 九、团队记忆（Team Memory）

通过 feature flag \`TEAMMEM\` 启用，支持两个目录：

\`\`\`
memory/           ← 私有记忆（个人偏好、工作方式）
memory/team/      ← 团队记忆（项目规范、测试策略）
\`\`\`

各类型的默认 scope：

| 类型 | 默认 scope | 说明 |
| --- | --- | --- |
| \`user\` | 始终私有 | 个人信息不共享 |
| \`feedback\` | 默认私有 | 只有明确的项目约定才存 team |
| \`project\` | 强烈建议 team | 项目状态对所有贡献者都有价值 |
| \`reference\` | 通常 team | 外部系统指针对团队共享有意义 |

私有 feedback 记忆在写入前应检查是否与已有的 team feedback 记忆冲突；如有冲突，应明确标注覆盖关系。


## 十、完整流程图

\`\`\`
新对话开始
    │
    ├─ 同步：读取 MEMORY.md → 注入 System Prompt
    │
用户发消息
    │
    ├─ 并行：
    │   ├─ 主模型流式响应
    │   └─ Sonnet 筛选相关记忆文件（异步预取）
    │
    ├─ 相关记忆文件内容作为 attachment 注入
    │
    ├─ 主模型响应过程中：
    │   └─ 判断是否需要主动写记忆
    │       ├─ 是 → 写文件 + 更新 MEMORY.md
    │       └─ 否 → 继续
    │
对话轮次结束（无工具调用）
    │
    └─ 后台：检查主模型是否已写记忆
        ├─ 已写 → 跳过
        └─ 未写 → 启动后台提取 Agent
                    └─ 分析对话 → 判断 → 写记忆
\`\`\`
`;
