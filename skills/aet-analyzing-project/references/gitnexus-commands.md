# GitNexus Command Quick Reference

## Table of Contents

- [GitNexus Command Quick Reference](#gitnexus-command-quick-reference)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Initialization](#initialization)
  - [Cypher Queries](#cypher-queries)
  - [query Command (Semantic Search)](#query-command-semantic-search)
  - [context Command (Symbol View)](#context-command-symbol-view)
  - [impact Command (Change Impact)](#impact-command-change-impact)
  - [Multi-repository Scenarios](#multi-repository-scenarios)

---

## Installation

GitNexus is optionally installed during AET setup. Check if installed:

```bash
# Check if globally installed
gitnexus --version 2>/dev/null && echo "已安装" || echo "未安装"
```

If not installed, commands will use `npx -y gitnexus` (downloads on first run).

---

## Initialization

Execute only once in Stage 1.

```bash
cd <project-path>

# If globally installed:
gitnexus analyze --skip-agents-md --skip-git {path}

# If not installed (uses npx):
npx -y gitnexus analyze --skip-agents-md --skip-git {path}
```

## Cypher Queries

```bash
# If globally installed, use: gitnexus cypher "..."
# If not installed, use: npx gitnexus cypher "..."

# Statistics Overview
gitnexus cypher "MATCH (n) RETURN count(n) AS total_nodes" --repo <repo>

# Public API Discovery (all exported functions)
npx gitnexus cypher "MATCH (n:Function) WHERE n.isExported = true RETURN n.name, n.filePath LIMIT 30" --repo <repo>

# Execution Flow Complexity Ranking (higher stepCount = more core)
npx gitnexus cypher "MATCH (p:Process) RETURN p.heuristicLabel, p.processType, p.stepCount ORDER BY p.stepCount DESC LIMIT 10" --repo <repo>

# Module Community Discovery (natural clustering boundaries)
npx gitnexus cypher "MATCH (c:Community) RETURN c.heuristicLabel, c.symbolCount ORDER BY c.symbolCount DESC LIMIT 15" --repo <repo>

# Community Member Details
npx gitnexus cypher "MATCH (f)-[:CodeRelation {type: 'MEMBER_OF'}]->(c:Community) RETURN c.heuristicLabel, collect(f.name) LIMIT 20" --repo <repo>

# Core Files (depended on by most files)
npx gitnexus cypher "MATCH (f:File)<-[:CodeRelation {type: 'IMPORTS'}]-(g:File) RETURN f.name, count(g) AS deps ORDER BY deps DESC LIMIT 10" --repo <repo>

# Cross-file Call Heatmap (inter-module dependency strength)
npx gitnexus cypher "MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b) WHERE a.filePath <> b.filePath WITH a.filePath AS from, b.filePath AS to, count(*) AS n ORDER BY n DESC LIMIT 15 RETURN from, to, n" --repo <repo>

# Circular Dependency Detection
npx gitnexus cypher "MATCH path=(a:File)-[:CodeRelation*2..5]->(a) WHERE ALL(r IN relationships(path) WHERE r.type = 'IMPORTS') RETURN path LIMIT 10" --repo <repo>
```

## query Command (Semantic Search)

```bash
npx gitnexus query "project entry point and initialization" --repo <repo>
npx gitnexus query "authentication flow" --repo <repo>
npx gitnexus query "{ModuleName} core logic flow" --repo <repo>
npx gitnexus query "error handling" --repo <repo>

# With context and goal
npx gitnexus query "API routing" --context "web app" --goal "find request handling" --repo <repo>

# Include source code (when context is sufficient)
npx gitnexus query "core business logic" --content --limit 3 --repo <repo>
```

## context Command (Symbol View)

```bash
npx gitnexus context <SymbolName> --repo <repo>
npx gitnexus context <SymbolName> --file src/auth/service.ts --repo <repo>  # Disambiguate same name
npx gitnexus context <SymbolName> --content --repo <repo>                   # Include source code
npx gitnexus context --uid "Function:validateUser" --repo <repo>            # Exact UID
```

## impact Command (Change Impact)

```bash
npx gitnexus impact <FunctionName> --direction upstream --repo <repo>    # Who depends on it
npx gitnexus impact <FunctionName> --direction downstream --repo <repo>  # What it depends on
npx gitnexus impact <FunctionName> --depth 2 --include-tests --repo <repo>
```

## Multi-repository Scenarios

When `status` prompts `Multiple repositories indexed`, all commands must add `--repo <repo-name>`.
