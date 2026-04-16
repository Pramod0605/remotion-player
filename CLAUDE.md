<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.

---

## code-review-graph Setup

This project uses [code-review-graph](https://github.com/tirth8205/code-review-graph) for AI-assisted code analysis.

### First Time Setup

```bash
# Install the tool
pip install code-review-graph

# Install and configure for OpenCode
code-review-graph install --platform opencode

# Build the knowledge graph
code-review-graph build
```

### Daily Workflow

```bash
# After pulling new code from GitHub:
code-review-graph update   # fast incremental update

# Or rebuild (if graph feels out of sync):
code-review-graph build

# Check graph status:
code-review-graph status

# Visualize interactive graph:
code-review-graph visualize
```

### How It Works

- **Graph is local** — each developer builds their own graph
- **Auto-updates** — hooks detect file changes
- **Token reduction** — AI reads only affected files, not entire codebase
- **Blast radius** — shows exactly what might break when you change something

### Troubleshooting

```bash
# Graph out of sync?
code-review-graph build

# Missing files?
# Check .code-review-graphignore in project root

# Need fresh start?
# Delete .code-review-graph/ folder and rebuild
```
