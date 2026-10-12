## 1 Background

**Memory is the key to moving from general-purpose question answering to a personal assistant.** Traditional retrieval and question-answering systems rely mainly on keyword matching and short-range context. They are stateless: each interaction stands alone. AI agents, by contrast, depend on **continuity and reasoning**. The main challenges are:

1. **Context-window limits:** LLM context windows are growing, but putting years of a user's history into a prompt is expensive and increases latency.
2. **Lack of personalization:** A general model doesn't know the user's tastes, professional background, or habits.
3. **Disconnected interactions:** A user asks for “nearby restaurants for a date” yesterday and “Where are we going?” today. Without memory, the model cannot connect the two.

The opportunity in the agent era is to combine conversational data with **behavioral data: actions and transactions**. A memory module turns these heterogeneous sources into knowledge the agent can understand.

## 2 Definitions and Goals

### 2.1 Definition

An AI agent's memory module is a **dynamic read/write system**. Inspired by the human brain, it compresses large amounts of raw information, stores it in a structured form, and retrieves it precisely when needed. It is more than a database: it is a loop of **storage, retrieval, and reflection**.

### 2.2 Core goals

1. **Personalization:** Make precise recommendations using historical preferences such as tastes, situations, and budgets.
2. **Continuity:** Support multi-turn conversations and remember contextual entities.
3. **Evolution:** Understand the user more deeply over time, moving from “what is popular” to “what you like.”

### 2.3 Use cases

| Use case | Description | Examples |
| --- | --- | --- |
| **Explicit needs** | The user directly requests personalization. Retrieve memories, decide, and recommend. | Recommend places similar to the Sichuan restaurants I visit; summarize my tastes; recommend based on my preferences. |
| **Implicit needs** | Memory improves the answer even when the user doesn't mention it. A profile fills in tastes, budget, and usual location. | Positive example: “Good food near Wangjing.” Negative example: “The hotpot most recommended by Changsha locals.” |
| **Situation awareness** | Understand the user's short-term state. | “I've caught a cold” → prefer mild food → ask later about recovery. |
| **Session memory** | Continue short-term context. | Use the restaurant or post just viewed to recommend related content next. |

### 2.4 Evaluation criteria and datasets

Across open evaluation datasets and related papers, common dimensions and metrics include:

| Dimension | Metric | Prevalence | Method | Representative benchmark / paper | Value |
| --- | --- | --- | --- | --- | --- |
| **Memory recall** | Accuracy / EM | ⭐⭐⭐⭐⭐ | Ask about history and check whether the right memory is found. | MemoryBank / MemoryAgentBench / MemBench | A basic requirement shared by all systems. |
| | Recall@K | ⭐⭐⭐⭐⭐ | Check whether retrieval finds the key evidence. | LoCoMo / MemBench | Often more revealing about memory structure than accuracy. |
| **Grounding in actual memories** | Response Correctness | ⭐⭐⭐⭐ | Check whether answers rely on real history rather than fabrication. | MemoryBank | Guards against plausible but invented answers. |
| **Long-term consistency** | Contextual Coherence | ⭐⭐⭐⭐ | Check consistency of tone, persona, and state across turns. | MemoryBank / LoCoMo | Subjective, but highly relevant to products. |
| **Temporal / causal understanding** | Temporal / Multi-hop QA | ⭐⭐⭐⭐⭐ | Check reasoning across time and multiple events. | LoCoMo / EventQA | Distinguishes long-term memory from long context. |
| **Event modeling** | Event Summarization (FactScore) | ⭐⭐⭐⭐ | Check whether event timelines are reconstructed correctly. | LoCoMo | Evaluates facts rather than writing style. |
| **Memory updating** | Selective Forgetting Accuracy | ⭐⭐⭐⭐ | Check whether new facts replace outdated ones. | MemoryAgentBench / MemBench | A common source of failures across the industry. |
| **Online learning** | Test-Time Learning Accuracy | ⭐⭐⭐⭐ | Check whether new rules can be learned from past examples. | MemoryAgentBench / Evo-Memory | A key capability for agents. |
| **Reflection / abstraction** | Reflective Memory Accuracy | ⭐⭐⭐⭐ | Infer preferences or profiles from multiple facts. | MemBench | Relates to persona and user insights. |
| **Robustness at scale** | Memory Capacity Curve | ⭐⭐⭐ | Check whether performance collapses as noise increases. | MemBench | Important for engineering and production. |
| **System efficiency** | Read / Write Latency | ⭐⭐⭐ | Measure the cost of storing and retrieving memories. | MemBench | Determines whether a system is practical in production. |

## 3 Industry Survey

Across models and products, the shared view is that **memory is core infrastructure for long-term personalization and task continuity**. It generally consists of three operations:

1. **Write:** Extract reusable preferences, constraints, events, and knowledge from conversations, actions, and tasks.
2. **Process:** Merge, abstract, deduplicate, forget, resolve conflicts, and organize memories.
3. **Read:** Retrieve relevant memories and inject them into the model to support query rewriting, reasoning, decisions, and filtering.

The goal has expanded beyond extending context:

- Build a user profile: **who**.
- Preserve a behavioral timeline: **when and what**.
- Support task-level reasoning: **now and next**.

### 3.1 Academic developments

Research can be divided into three broad stages:

| Stage | Name | Memory form | Technical characteristics | Problems addressed | Main limitations | Representative systems |
| --- | --- | --- | --- | --- | --- | --- |
| **Stage 1** | Short-term / within-trial memory | Conversation history, trajectories, summaries | History concatenation and summary compression | Multi-step reasoning and continuity within a task | Cleared when the task ends | Early Generative Agents / early MemGPT |
| **Stage 2** | External long-term memory: Memory as Component | External vector, KV, or graph storage | Extract → store → retrieve; works across sessions | Cross-conversation memory and reusable preferences | Fragmentation, weak consistency, persona not built in | Mem0 / A-Mem / Zep / MemoryBank |
| **Stage 3** | System-level memory: Memory as Operating System | Hierarchical long-term memory | STM / MTM / LTM, event streams, automatic updates and forgetting | A consistent long-term persona and evolution across tasks | Complex engineering; still exploratory | MemoryOS / EverMemOS / MIRIX |

Criteria for classifying mainstream applications:

| Criterion | Stage 2: component | Stage 3: system |
| --- | --- | --- |
| **Automatic writing** | Explicit trigger such as “Remember this.” | Automatic extraction by the model or system. |
| **Updates / overwriting** | Limited support. | Conflict resolution and correction. |
| **Timeline** | Absent or weak. | Explicit event stream. |
| **Effect on behavior** | Mainly affects replies. | Affects planning and tool selection. |

The survey positions mainstream systems as follows:

| System | Stage | Rationale |
| --- | --- | --- |
| **ChatGPT** | Stage 2 | Long-term memory, but no system-level scheduling. |
| **Claude** | Stage 2 | Strong working memory, without autonomous evolution. |
| **Gemini** | Stage 1.5–2 | Primarily context and user profiles. |

### 3.2 Product developments

Memory mechanisms in mainstream conversational applications:

| Application | Characteristics |
| --- | --- |
| **ChatGPT** | **Four memory layers.**<br>**Saved Memory:** written when the user explicitly says “Remember that…”, viewable and deletable; suited to important, clear, stable facts.<br>**Session History:** a short buffer containing the most recent day or few messages; complete, ordered, and directly quotable.<br>**Conversation Retrieval:** retrieves earlier messages through a vector database. This survey describes exact quotations as available for the previous two weeks and summaries for older material. Retrieval operates on message chunks rather than complete conversation flows; messages are embedded into the database.<br>**User Insights:** automatically identifies patterns across conversations, such as a preference for technical detail or familiarity with Rust. Related messages are clustered and summarized with confidence levels.<br>Overall, the approach depends more on a large context and a strong model's integration than on complex retrieval. |
| **Claude** | Explicit, project-level memory stored in editable files such as CLAUDE.md. Transparent, controllable, and strongly isolated. Emphasizes engineering reliability and safety rather than automatic inference. |
| **Gemini** | Long-term memory with automatic updates, vector retrieval, summary compression, and user-feature aggregation. Closer to automatically learning the user's habits. |
| **Qwen** | Explicit trigger → explicit write. |
| **Doubao** | Implicit preference extraction → automatic evolution. |

A rough organization of a ChatGPT prompt:

```
[System instructions and role description]
[Explicit Saved Memory list]
[User Insights list]
--- retrieved context ---
[Conversation Retrieval excerpts]
--- recent messages ---
[Most recent N messages in the Session Buffer]
User: <latest user message>
```

## 4 Core Modules

Using the four-layer architecture as a reference, a general agent's memory can be divided into four data forms.

### 4.1 Data

| Memory type | Definition | Problem / use case | Data form | Usage |
| --- | --- | --- | --- | --- |
| **Saved Memory** | Factual information: relatively stable details such as nickname, age, and gender, plus entities the user has bookmarked, visited, purchased from, or reviewed. | Context awareness | KV storage | Actively called for specific queries. |
| **Current Session History** | Near-real-time behavior in the last 30 minutes, hour, or day: opened entities, searches, transactions, viewed posts, and so on. | Short-term context | Real-time engineering extraction and concatenation | Passively included in each conversation. |
| **Conversation Retrieval** | Summaries of earlier conversations. Use all recent summaries when there are few; embed and retrieve when there are many. | Conversation continuity | Text / embeddings | Included in context. |
| **User Insights** | Hypotheses about the user: attributes, interests, long-term preferences, and recent intentions inferred from behavior and conversation. | Personalization and growth | Text | Included in context. |

### 4.2 Storage

| Memory type | Storage |
| --- | --- |
| **Saved Memory** | KV format, updated by an offline warehouse on T+1 and imported into online KV storage for retrieval. |
| **Current Session History** | Real-time collection and client/server parsing and concatenation. Sensitive, high-volume data requires attention to governance and compression. |
| **Conversation Retrieval** | An LLM produces a one-sentence summary at the end of each session. The most recent X summaries are added to context. |
| **User Insights** | A list of text entries, each carrying confidence, update time, and validity period. The following persona template and JSON illustrate this. |

**User Insights classification template:**

| Category | ID | Description | Include / exclude | Special rules |
| --- | --- | --- | --- | --- |
| **Nickname** | 0 | Nickname or preferred form of address | Include explicitly supplied nicknames and preferred names; exclude other information. | Add or update only, never delete; record nicknames only. |
| **Basic user information** | 1 | Identifying information | Include real name, nickname, and form of address; exclude contact details, addresses, occupation, age, and other sensitive information. | — |
| **Food preferences** | 2 | Preferences and restrictions around food | Include tastes and dietary restrictions related to allergies, religion, or health; exclude meal times, frequency, favorite individual restaurants, and one-off needs. | — |
| **Leisure preferences** | 3 | Entertainment preferences the user actively expresses | Include leisure activities, travel preferences, hobbies, and talents; exclude work skills, passive participation, and one-time experiences. | — |
| **Family relationships** | 4 | Family relationships mentioned by the user | Include partners, children, parents, and siblings; exclude strangers, service providers, and one-time contacts. | — |
| **Important dates** | 5 | Dates with special significance | Include birthdays, anniversaries, major events, and recurring important activities; exclude ordinary appointments, work schedules, and temporary plans. | — |
| **Communication preferences** | 6 | Preferences for interacting with AI | Include formal/casual style, direct/indirect answers, length, and tone; exclude the user's own speaking habits, temporary emotional requests, and one-off situations. | — |

**Example storage JSON:**

```json
{
  "user_id": "u123",
  "time": "2025-04-20 19:00:00",
  "source": "dialogue",
  "key": "Food preferences",
  "value": "Spicy food",
  "evidence": "My stomach has mostly recovered; I can eat spicy food again",
  "confidence": "high",
  "valid_time": "long"
}
```

### 4.3 Updates

At the end of each session, an LLM performs two tasks:

| Task | Update |
| --- | --- |
| Summarize the session | `{"tool": "add", "session_id": "...", "time": "...", "summary": "The user asked for good Japanese food nearby; the agent answered..."}` |
| Decide whether to update User Insights | `{"tool": "add"/"delete"/"edit", "key": "Food preferences", "value": {"key": "Food preferences", "value": "The user likes spicy food", "confidence": "high", "valid_time": "long"}}` |

### 4.4 Retrieval

| Memory type | Retrieval method |
| --- | --- |
| **Saved Memory** | A tool call specifies a key → RAG retrieves entity information → text is returned. |
| **Current Session History** | Pulled directly from engineering APIs and concatenated by time window. |
| **Conversation Retrieval** | With few average turns, add the most recent N summaries directly; use embedding retrieval at larger volumes. |
| **User Insights** | Use embeddings to select the insights most relevant to the current query and inject them into context. |

### 4.5 Use

| Usage | Module | Description |
| --- | --- | --- |
| **Active call** | Saved Memory | Used only when the agent decides to invoke a memory tool. |
| **Passive use** | Current Session History | Added to context and available in every conversation; keep context length under control. |
| **Passive use** | Conversation Retrieval | Same as above. |
| **Passive use** | User Insights | Same as above. |

## 5 Other Considerations

**Boundaries on information use**

A responsible agent memory system distinguishes information that can be used from information that can be disclosed:

- **May use and disclose:** explicit bookmarks, browsing, reviews, and clearly stated preferences.
- **May use but not disclose:** implicit behavioral labels such as budget tendencies or spending capacity.
- **May neither use nor disclose:** sensitive information such as religion, political views, or detailed health information.

## Appendix

**Representative systems and papers**

- Generative Agents (Park et al., 2023)
- MemGPT (Packer et al., 2023)
- Mem0
- A-Mem
- Zep
- MemoryBank
- MemoryOS
- EverMemOS
- MIRIX

**Representative benchmarks**

- LoCoMo
- MemoryBench / MemoryAgentBench / MemBench
- EventQA
- Evo-Memory
