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

## How to Use code-review-graph

### First Time Setup

```bash
# Install the tool
pip install code-review-graph

# Install and configure for your IDE/tool
code-review-graph install --platform opencode   # for OpenCode
code-review-graph install --platform claude-code # for Claude Code
code-review-graph install --platform cursor     # for Cursor
code-review-graph install --platform codex       # for Codex

# Build the knowledge graph
code-review-graph build
```

### Daily Commands

| Command | Description |
|---------|-------------|
| `code-review-graph build` | Build or rebuild the full graph |
| `code-review-graph update` | Incremental update (faster, only changed files) |
| `code-review-graph status` | Show graph stats (nodes, edges, files) |
| `code-review-graph detect-changes` | Analyze changes with risk scores |
| `code-review-graph visualize` | Open interactive graph viewer in browser |
| `code-review-graph watch` | Auto-update graph continuously as you work |

### After Committing Code to GitHub

**Important: The graph is local to each developer's machine.** After pushing code:

1. **Pull latest changes** in your local repo
2. **Update the graph** to reflect new code:
   ```bash
   code-review-graph update
   ```
3. **Or rebuild** for a clean slate:
   ```bash
   code-review-graph build
   ```

### For CI/CD (Optional)

To auto-build graph on CI:

```bash
# In your GitHub Actions workflow
- name: Build code graph
  run: |
    pip install code-review-graph
    code-review-graph build
```

### Troubleshooting

- **Graph out of sync?** Run `code-review-graph build`
- **Missing files?** Check `.code-review-graphignore` for exclusions
- **Need fresh start?** Delete `.code-review-graph/` folder and rebuild
