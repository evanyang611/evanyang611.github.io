## 概述

Claude Code 的跨對話記憶系統是一套**純文件系統實現**的持久化機制。沒有向量數據庫，沒有嵌入模型，完全依賴結構化 Markdown 文件 + LLM 理解。其核心設計哲學是：**只保存從代碼庫本身無法推導出的信息**。


## 一、記憶的定義

### 什麼是記憶

記憶是跨對話持久保存的、關於用戶、項目和協作方式的**非結構化文本觀察**。每條記憶保存為一個獨立的 Markdown 文件，帶有標準 frontmatter：

```
---
name: 記憶名稱
description: 一行描述（用於相關性篩選，要儘量具體）
type: user | feedback | project | reference
---

記憶內容正文
**Why:** 產生這條記憶的原因
**How to apply:** 何時應用這條記憶
```

### 四種記憶類型

| 類型 | 保存什麼 | 典型觸發場景 |
| --- | --- | --- |
| `user` | 用戶的角色、背景、技能、偏好 | 用戶提到自己是數據科學家；用戶說自己熟悉 Go 但不熟悉 React |
| `feedback` | 用戶對 Claude 行為的糾正或確認 | 用戶說"不要 mock 數據庫"；用戶說"這個方案很好，繼續這樣做" |
| `project` | 項目上下文（截止日期、決策動機、正在進行的工作） | 用戶提到 merge freeze 從某天開始；用戶解釋為什麼要重寫某個模塊 |
| `reference` | 外部系統的指針 | 用戶說 bug 在 Linear 的 INGEST 項目裡追蹤 |

### 明確不保存的內容

以下內容**不應該**保存為記憶，即使用戶明確要求：

- 代碼模式、架構、文件路徑、項目結構 → 可以通過讀代碼獲得
- Git 歷史、近期變更、誰改了什麼 → `git log` / `git blame` 是權威來源
- 調試方案或修復配方 → 修復已在代碼裡，commit message 有上下文
- CLAUDE.md 文件中已有的內容
- 臨時任務狀態、當前對話中的進行中工作

如果用戶要求保存 PR 列表或活動摘要，應該反問：其中**出乎意料或不顯而易見**的部分是什麼——那才是值得保存的。


## 二、存儲結構

### 目錄佈局

記憶按**項目**隔離，路徑基於當前 git 倉庫根目錄：

```
~/.claude/projects/<sanitized-git-root>/memory/
├── MEMORY.md              ← 索引文件（每次對話都加載）
├── user_role.md           ← 具體記憶文件
├── feedback_testing.md
├── project_deadline.md
└── ...
```

路徑解析優先級（`getAutoMemPath`）：

1. `CLAUDE_COWORK_MEMORY_PATH_OVERRIDE` 環境變量（Cowork 場景用）
2. `settings.json` 中的 `autoMemoryDirectory`（僅信任 policy/local/user 來源，**不信任項目級 .claude/settings.json**，防止惡意倉庫重定向寫入 `~/.ssh`）
3. 默認：`~/.claude/projects/<sanitized-git-root>/memory/`

同一 git 倉庫的所有 worktree 共享同一個記憶目錄（通過 `findCanonicalGitRoot` 確保）。

### MEMORY.md：索引文件

MEMORY.md 是**索引**，不是內容本身。每條記錄一行：

```
- [用戶角色](user_role.md) — 數據科學家，關注可觀測性
- [測試規範](feedback_testing.md) — 禁止 mock 數據庫，原因：歷史事故
- [項目截止日期](project_deadline.md) — merge freeze 2026-03-05
```

嚴格限制：

- **最多 200 行**，超出截斷並附警告
- **最多 25,000 字節**，防止長行撐爆 token

MEMORY.md 的內容**每次對話都會直接注入 System Prompt**，是所有記憶中唯一"無條件加載"的。

### 記憶文件上限

掃描時最多處理 **200 個** `.md` 文件（按最近修改時間排序取前 200），超出部分在本次對話中不可見。


## 三、記憶的生成（寫入）

記憶有兩條寫入路徑：**主動寫入**和**後臺提取**。

### 3.1 主動寫入（主模型）

Claude 在對話過程中自主判斷何時需要保存記憶，System Prompt 中的規則驅動這個判斷：

**觸發時機**：

- 用戶糾正 Claude 的行為（"不要這樣做"、"停止 X"）
- 用戶確認某個不顯而易見的做法是正確的（"對，就是這樣"）
- 用戶說"記住這個"
- Claude 獲知用戶背景信息（角色、技能、偏好）
- 瞭解到項目上下文（截止日期、決策原因）

**寫入流程（兩步操作）**：

```
步驟 1：寫具體記憶文件
  → 使用 Write 工具創建 feedback_testing.md
  → 包含 frontmatter（name/description/type）和正文

步驟 2：更新 MEMORY.md 索引
  → 在 MEMORY.md 末尾追加一行指針
  → 格式：- [標題](文件名.md) — 一行摘要
```

寫入前應先檢查是否已有可更新的現有文件，避免創建重複記憶。

### 3.2 後臺提取（後臺 Agent，`EXTRACT_MEMORIES` feature flag）

每次完整的 query loop 結束時（模型產出最終響應、無工具調用），後臺會異步啟動一個**記憶提取子 Agent**：

```
對話結束（模型無工具調用）
    ↓
檢查：主模型本輪是否已寫過記憶？
  ├── 是 → 跳過（避免重複）
  └── 否 → 啟動 forked agent
              ↓
         分析最近 N 條消息
              ↓
         判斷是否有值得保存的內容
              ↓
         寫入記憶文件 + 更新 MEMORY.md
```

後臺 Agent 的權限受到嚴格限制：

- 允許：Read、Grep、Glob、只讀 Bash（ls/find/cat/stat 等）
- 允許：Edit/Write，**但僅限記憶目錄內的路徑**
- 禁止：MCP 工具、Agent 工具、有寫權限的 Bash、`rm` 命令

後臺 Agent 使用與主對話相同的 prompt cache，不額外消耗緩存。


## 四、記憶的使用（讀取）

### 4.1 MEMORY.md 始終加載

每次對話開始，`loadMemoryPrompt()` 在構建 System Prompt 時同步讀取 MEMORY.md，將其內容直接注入 System Prompt 的動態段。模型在整個對話中都能看到索引。

### 4.2 相關記憶文件按需注入

每輪對話開始時，`startRelevantMemoryPrefetch()` 異步啟動相關記憶搜索，**與主模型流式輸出並行執行**：

```
用戶發消息
    ↓
並行啟動兩件事：
  ① 調用主模型（流式輸出）
  ② 相關記憶預取（異步）：
       a. 掃描記憶目錄，讀取所有文件的 frontmatter（name + description）
       b. 把文件名+描述列表發給 Sonnet 模型
       c. Sonnet 根據當前用戶 query 選出最相關的文件（最多 5 個）
       d. 讀取這些文件的完整內容
    ↓
主模型響應結束後，把相關文件內容作為 attachment 注入下一輪
```

篩選邏輯（`findRelevantMemories`）：

- 用 **Sonnet 做語義篩選**，而非關鍵詞匹配或向量檢索
- 如果近期已使用某工具，不推薦該工具的參考文檔（避免噪音）
- 每次最多注入 **5 個**文件
- 有**會話級 byte 上限**，防止記憶累積撐爆 context
- `alreadySurfaced` 集合去重，同一文件在同一會話中不重複注入

### 4.3 訪問規則

System Prompt 中明確的訪問規則：

- 記憶看起來相關時，主動讀取
- 用戶明確要求"記住/回憶"時，**必須**訪問記憶
- 用戶說"忽略記憶"時：視 MEMORY.md 為空，不應用、不引用、不提及任何記憶內容


## 五、記憶的時效性與驗證

### 新鮮度標註

記憶文件有 mtime（最後修改時間）。超過 1 天的記憶在被注入時會附帶時效性警告：

```
This memory is 47 days ago. Memories are point-in-time observations, not live state —
claims about code behavior or file:line citations may be outdated.
Verify against current code before asserting as fact.
```

當天或昨天修改的記憶不附加警告（避免噪音）。

### 使用前驗證規則

System Prompt 中明確要求模型在推薦記憶內容前先驗證：

- 記憶中提到某個**文件路徑** → 檢查文件是否存在
- 記憶中提到某個**函數或 flag** → grep 確認
- 用戶即將基於記憶採取行動 → 先驗證，再推薦

**"記憶說 X 存在" ≠ "X 現在存在"**

記憶是寫入時刻的快照，不是實時狀態。如果記憶與當前觀察到的代碼衝突，**信任當前代碼，更新或刪除過時記憶**。


## 六、記憶的更新與廢棄

### 更新

寫入新記憶前，應先檢查是否有可以更新的現有文件：

```
1. 讀取 MEMORY.md，查找相關條目
2. 如果找到相關文件 → 用 Edit 工具修改現有文件
3. 如果沒有 → 創建新文件，並在 MEMORY.md 中添加指針
```

記憶文件的 frontmatter（name/description/type）應隨內容同步更新。

### 廢棄

用戶要求"忘記"某事時，找到對應文件並刪除，同時從 MEMORY.md 中移除對應指針。

記憶在以下情況下應主動廢棄或更新：

- 當前觀察到的代碼/事實與記憶內容衝突
- 記憶描述的項目狀態已發生變化（截止日期已過、決策已改變）
- 記憶中的文件路徑、函數名已不存在


## 七、相近與衝突記憶的處理

### 沒有自動化的衝突檢測

Claude Code **沒有相似度計算或自動仲裁機制**。對於相近或衝突的記憶，完全依賴 LLM 的語義理解，通過 prompt 規則約束行為。

### 寫入時的防重複

每次寫記憶之前，prompt 在三處都有明確指令（主模型 System Prompt、後臺提取 Agent prompt、團隊記憶 prompt）：

> "Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one."

後臺提取 Agent 啟動時還會收到**當前所有記憶文件的 manifest 列表**（文件名 + description + 修改時間），並被告知：

> "Check this list before writing — update an existing file rather than creating a duplicate."

模型在寫入前能看到"已有什麼"，但判斷"是否相似"完全靠模型自己的語義理解，沒有向量檢索或相似度閾值。

### 團隊記憶中的私有/團隊衝突

這是唯一有**明確衝突處理規則**的場景。對於 `feedback` 類型的私有記憶，prompt 規定：

> "Before saving a private feedback memory, check that it doesn't contradict a team feedback memory — if it does, either don't save it or note the override explicitly."

即：私有 feedback 不能靜默覆蓋團隊規範，要麼放棄寫入，要麼在文件中明確標註"此條覆蓋了團隊規範 X"。

### 讀取時的衝突處理

讀取時同樣沒有自動合併，依賴兩條規則：

1. **時效性優先**：記憶與當前代碼衝突時，信任當前代碼，更新或刪除過時記憶（`MEMORY_DRIFT_CAVEAT`）。
2. **時間戳作為參考**：記憶文件按 `mtime` 倒序排列，manifest 中帶 ISO 時間戳，超過 1 天的記憶附加新鮮度警告，幫助模型感知哪條記憶更新。

### 已知侷限

如果兩條矛盾的記憶同時存在、都不過時、都被篩選進了當次 context，系統**沒有任何機制能自動發現並解決這個矛盾**。模型會同時看到它們，如何取捨完全取決於當前對話上下文中的 LLM 判斷。系統通過"寫入前先檢查"和"讀取時驗證"來儘量減少矛盾記憶的產生，但不保證消除。


## 八、記憶與其他持久化機制的區別

| 機制 | 生命週期 | 用途 |
| --- | --- | --- |
| **記憶（Memory）** | 跨對話永久持久 | 用戶偏好、項目背景、協作方式 |
| **計劃（Plan）** | 當前對話內 | 實現方案的對齊與規劃 |
| **任務（Task）** | 當前對話內 | 工作進度追蹤、步驟分解 |
| **CLAUDE.md** | 跟隨代碼庫 | 項目級規範、代碼約定（可被 git 追蹤） |


## 九、團隊記憶（Team Memory）

通過 feature flag `TEAMMEM` 啟用，支持兩個目錄：

```
memory/           ← 私有記憶（個人偏好、工作方式）
memory/team/      ← 團隊記憶（項目規範、測試策略）
```

各類型的默認 scope：

| 類型 | 默認 scope | 說明 |
| --- | --- | --- |
| `user` | 始終私有 | 個人信息不共享 |
| `feedback` | 默認私有 | 只有明確的項目約定才存 team |
| `project` | 強烈建議 team | 項目狀態對所有貢獻者都有價值 |
| `reference` | 通常 team | 外部系統指針對團隊共享有意義 |

私有 feedback 記憶在寫入前應檢查是否與已有的 team feedback 記憶衝突；如有衝突，應明確標註覆蓋關係。


## 十、完整流程圖

```
新對話開始
    │
    ├─ 同步：讀取 MEMORY.md → 注入 System Prompt
    │
用戶發消息
    │
    ├─ 並行：
    │   ├─ 主模型流式響應
    │   └─ Sonnet 篩選相關記憶文件（異步預取）
    │
    ├─ 相關記憶文件內容作為 attachment 注入
    │
    ├─ 主模型響應過程中：
    │   └─ 判斷是否需要主動寫記憶
    │       ├─ 是 → 寫文件 + 更新 MEMORY.md
    │       └─ 否 → 繼續
    │
對話輪次結束（無工具調用）
    │
    └─ 後臺：檢查主模型是否已寫記憶
        ├─ 已寫 → 跳過
        └─ 未寫 → 啟動後臺提取 Agent
                    └─ 分析對話 → 判斷 → 寫記憶
```
