## Overview

Claude Code's cross-conversation memory is a persistent mechanism implemented **entirely on the file system**. It uses no vector database or embedding model, relying instead on structured Markdown files and LLM understanding. Its central principle is to **save only information that cannot be inferred from the codebase itself**.

## 1. What Counts as Memory

### Definition

Memories are **unstructured textual observations** about the user, the project, and how to collaborate, retained across conversations. Each memory is a separate Markdown file with standard frontmatter:

```
---
name: Memory name
description: A specific one-line description used to assess relevance
type: user | feedback | project | reference
---

Memory body
**Why:** Why this memory was created
**How to apply:** When to use this memory
```

### Four memory types

| Type | What it stores | Typical trigger |
| --- | --- | --- |
| `user` | The user's role, background, skills, and preferences | The user is a data scientist, or knows Go but not React. |
| `feedback` | Corrections or confirmations of Claude's behavior | “Don't mock the database,” or “This approach works; keep doing it.” |
| `project` | Project context: deadlines, reasons for decisions, ongoing work | A merge freeze begins on a given date; the user explains why a module must be rewritten. |
| `reference` | Pointers to external systems | Bugs are tracked in Linear's INGEST project. |

### What should not be saved

The following should **not** become memories, even if explicitly requested:

- Code patterns, architecture, paths, or project structure: read the code instead.
- Git history, recent changes, or who changed what: `git log` and `git blame` are authoritative.
- Debugging recipes or fixes: the fix is in the code and its context is in the commit message.
- Information already in CLAUDE.md.
- Temporary task status or work in progress within the current conversation.

If asked to save a list of pull requests or an activity summary, ask which parts are **surprising or non-obvious**. Those are the parts worth keeping.

## 2. Storage Structure

### Directory layout

Memory is isolated **by project**, using the current Git repository's root:

```
~/.claude/projects/<sanitized-git-root>/memory/
├── MEMORY.md              ← Index loaded in every conversation
├── user_role.md           ← Individual memory file
├── feedback_testing.md
├── project_deadline.md
└── ...
```

Path-resolution priority in `getAutoMemPath`:

1. The `CLAUDE_COWORK_MEMORY_PATH_OVERRIDE` environment variable for Cowork.
2. `autoMemoryDirectory` in settings.json. Only policy, local, and user sources are trusted; **project-level .claude/settings.json is not**, preventing a malicious repository from redirecting writes into `~/.ssh`.
3. The default: `~/.claude/projects/<sanitized-git-root>/memory/`.

All worktrees of the same repository share a memory directory, using `findCanonicalGitRoot`.

### MEMORY.md: the index

MEMORY.md is an **index**, not the memories themselves. Each entry occupies one line:

```
- [User role](user_role.md) — Data scientist focused on observability
- [Testing rules](feedback_testing.md) — No database mocks because of a past incident
- [Project deadline](project_deadline.md) — Merge freeze 2026-03-05
```

Strict limits:

- **200 lines maximum:** excess lines are truncated and a warning is added.
- **25,000 bytes maximum:** long lines must not overwhelm the token budget.

The index is **injected directly into the system prompt in every conversation**. It is the only memory loaded unconditionally.

### Limit on memory files

Scanning handles at most **200 Markdown files**, selecting the most recently modified. Files beyond that limit are invisible in the current conversation.

## 3. Creating Memories: Writing

There are two write paths: **active writing** and **background extraction**.

### 3.1 Active writing by the main model

During a conversation, Claude decides whether to save a memory according to system-prompt rules.

**Triggers:**

- A user corrects its behavior: “Don't do that,” or “Stop X.”
- A user confirms a non-obvious approach: “Yes, exactly.”
- A user says “Remember this.”
- Claude learns the user's role, skills, or preferences.
- It learns a project deadline or a reason behind a decision.

**Two-step writing process:**

```
Step 1: Write the individual memory file
  → Create feedback_testing.md with the Write tool
  → Include frontmatter (name/description/type) and the body

Step 2: Update the MEMORY.md index
  → Append a pointer to MEMORY.md
  → Format: - [Title](filename.md) — One-line summary
```

Before writing, look for an existing file to update instead of creating duplicates.

### 3.2 Background extraction: the EXTRACT_MEMORIES feature flag

After a complete query loop ends with a final response and no tool calls, a **memory-extraction sub-agent** may start asynchronously:

```
Conversation turn ends with no tool call
    ↓
Did the main model write a memory this turn?
  ├── Yes → Skip to avoid duplication
  └── No  → Start a forked agent
              ↓
         Analyze the latest N messages
              ↓
         Decide whether anything is worth saving
              ↓
         Write memory files and update MEMORY.md
```

The background agent's permissions are tightly restricted:

- Allowed: Read, Grep, Glob, and read-only Bash such as ls, find, cat, and stat.
- Allowed: Edit and Write, **only inside the memory directory**.
- Forbidden: MCP tools, Agent tools, write-capable Bash, and `rm`.

It shares the main conversation's prompt cache rather than consuming an additional cache.

## 4. Using Memories: Reading

### 4.1 MEMORY.md is always loaded

At the beginning of each conversation, `loadMemoryPrompt()` synchronously reads MEMORY.md while constructing the system prompt and inserts it into the dynamic portion. The model can see the index throughout the conversation.

### 4.2 Relevant files are injected on demand

At the beginning of each turn, `startRelevantMemoryPrefetch()` launches a search **in parallel with the main model's streamed response**:

```
User sends a message
    ↓
Start two operations in parallel:
  ① Call the main model for a streamed response
  ② Prefetch relevant memories asynchronously:
       a. Scan the directory and read each file's name and description
       b. Send the filename/description list to Sonnet
       c. Sonnet selects up to five files relevant to the query
       d. Read those files in full
    ↓
After the main response, inject their contents as attachments into the next turn
```

Selection in `findRelevantMemories`:

- **Sonnet performs semantic selection**, rather than keyword matching or vector retrieval.
- Reference documents for a recently used tool are not recommended, reducing noise.
- At most **five files** are injected per selection.
- A **session-level byte limit** prevents accumulating memories from overwhelming context.
- The `alreadySurfaced` set prevents repeated injection of the same file within a session.

### 4.3 Access rules

The system prompt specifies:

- Read memory proactively when it appears relevant.
- **Access memory when the user explicitly asks to remember or recall.**
- If the user says to ignore memory, treat MEMORY.md as empty: do not apply, cite, or mention its contents.

## 5. Freshness and Verification

### Freshness annotations

Memory files have a modification time, `mtime`. Older memories may be injected with a warning:

```
This memory is 47 days ago. Memories are point-in-time observations, not live state —
claims about code behavior or file:line citations may be outdated.
Verify against current code before asserting as fact.
```

Memories modified today or yesterday do not receive the warning, avoiding unnecessary noise.

### Verify before use

Before recommending something based on memory, the model must verify it:

- If a **file path** is mentioned, check that it exists.
- If a **function or flag** is mentioned, confirm it with a search.
- If the user is about to act on a memory, verify before recommending.

**“The memory says X exists” does not mean “X exists now.”**

A memory is a snapshot taken when it was written. When it conflicts with current code, **trust the current code and update or remove the outdated memory**.

## 6. Updating and Retiring Memories

### Updating

Check for an existing file before creating a new one:

```
1. Read MEMORY.md and look for related entries
2. If a relevant file exists, update it with Edit
3. Otherwise, create a file and add its pointer to MEMORY.md
```

Update the frontmatter—name, description, and type—along with the content.

### Retiring

When a user asks to forget something, delete the corresponding file and remove its index pointer.

Proactively retire or update memories when:

- Current code or facts contradict them.
- Project circumstances have changed, such as an expired deadline or a revised decision.
- Referenced paths or functions no longer exist.

## 7. Similar and Conflicting Memories

### No automatic conflict detection

Claude Code has **no similarity scoring or automatic arbitration mechanism**. Similar or conflicting memories are handled through the LLM's semantic understanding, guided by prompt rules.

### Duplicate prevention during writing

Three prompts—the main system prompt, background extractor prompt, and team-memory prompt—explicitly instruct:

> Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.

The background extractor also receives a **manifest of all existing files**, with names, descriptions, and modification times, and is told:

> Check this list before writing — update an existing file rather than creating a duplicate.

It can see what already exists, but similarity judgments depend on the model alone. There is no vector search or similarity threshold.

### Private versus team feedback

This is the only scenario with **explicit conflict-resolution rules**. For private `feedback` memories:

> Before saving a private feedback memory, check that it doesn't contradict a team feedback memory — if it does, either don't save it or note the override explicitly.

A private memory must not silently override team conventions. Either do not save it or explicitly record which team rule it overrides.

### Conflicts during reading

There is no automatic merge. Two rules guide the model:

1. **Freshness first:** when a memory contradicts current code, trust the code and update or remove the memory (`MEMORY_DRIFT_CAVEAT`).
2. **Timestamps as evidence:** files are sorted by descending `mtime`; manifests include ISO timestamps, and older memories receive freshness warnings.

### Known limitation

If two conflicting memories coexist, are both fresh, and are both selected into context, **the system has no mechanism that automatically detects and resolves their contradiction**. The LLM sees both and decides using the current conversation. Checking before writing and verifying during reading reduce conflicts, but do not guarantee their elimination.

## 8. Memory and Other Persistent Mechanisms

| Mechanism | Lifetime | Purpose |
| --- | --- | --- |
| **Memory** | Persistent across conversations | User preferences, project background, and collaboration style. |
| **Plan** | Current conversation | Aligning and planning an implementation. |
| **Task** | Current conversation | Tracking progress and breaking down work. |
| **CLAUDE.md** | Stored with the codebase | Project rules and coding conventions, trackable in Git. |

## 9. Team Memory

The `TEAMMEM` feature flag enables two directories:

```
memory/           ← Private memory: personal preferences and working style
memory/team/      ← Team memory: project conventions and testing strategies
```

Default scope by type:

| Type | Default scope | Explanation |
| --- | --- | --- |
| `user` | Always private | Personal information is not shared. |
| `feedback` | Private by default | Only explicit project conventions belong in team memory. |
| `project` | Team strongly recommended | Project state is useful to every contributor. |
| `reference` | Usually team | Pointers to external systems are useful to share. |

Before writing private feedback, check for conflicts with team feedback and explicitly note any override.

## 10. Complete Flow

```
New conversation
    │
    ├─ Synchronous: read MEMORY.md → inject into system prompt
    │
User sends a message
    │
    ├─ In parallel:
    │   ├─ Main model streams a response
    │   └─ Sonnet selects relevant memory files asynchronously
    │
    ├─ Inject selected files as attachments
    │
    ├─ During the main response:
    │   └─ Decide whether to write a memory actively
    │       ├─ Yes → Write file and update MEMORY.md
    │       └─ No  → Continue
    │
Turn ends without a tool call
    │
    └─ Background: check whether the main model wrote memory
        ├─ Yes → Skip
        └─ No  → Start the background extractor
                    └─ Analyze → decide → write memory
```
