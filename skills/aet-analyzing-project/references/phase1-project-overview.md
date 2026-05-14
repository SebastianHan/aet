# Phase 1: Project Overview Analysis

## [S1] Initialize GitNexus

Execute before any exploration or questioning. Load 'references/gitnexus-commands.md' for command syntax.

```bash
cd <project-path>
npx -y gitnexus analyze --skip-agents-md --skip-git {path}
```

- Success: Record node count, edge count, cluster count; subsequent analysis can use GitNexus for assisted navigation
- Failure: Record failure reason, use file system tools (find/grep) as substitute for subsequent work, and note in documentation

---

## [S2] Explore Project Structure

Goal: Establish cognition of the project's physical structure. This step does not read README/docs or other documentation files—they may be outdated; configuration files and code structure are the facts.

### [A2.1] Physical Structure Exploration

Example commands:

```bash
# Directory structure (3 levels deep)
find <project-path> -maxdepth 3 -type d
# Technology stack configuration files
cat package.json / go.mod / requirements.txt / Cargo.toml / pom.xml
# Configuration and environment files
ls -la <project-path>/ | grep -E '\.(json|yaml|yml|toml|ini|env)'
```

### [A2.2] GitNexus Navigation Analysis

Load 'references/gitnexus-commands.md' for complete command syntax. Execute the following queries to locate key code areas:

- Total project nodes (scale awareness)
- Most complex execution flows (sorted by stepCount)
- Core files depended on by the most files
- Natural module communities

Example commands:

```bash
# Project scale
npx gitnexus cypher "MATCH (n) RETURN count(n) AS total" --repo <repo>
# Most core execution flows (highest stepCount = most complex paths)
npx gitnexus cypher "MATCH (p:Process) RETURN p.heuristicLabel, p.stepCount ORDER BY p.stepCount DESC LIMIT 8" --repo <repo>
# Most core files (depended on by the most files)
npx gitnexus cypher "MATCH (f:File)<-[:CodeRelation {type: 'IMPORTS'}]-(g:File) RETURN f.name, count(g) AS deps ORDER BY deps DESC LIMIT 10" --repo <repo>
# Natural module communities
npx gitnexus cypher "MATCH (c:Community) RETURN c.heuristicLabel, c.symbolCount ORDER BY c.symbolCount DESC LIMIT 12" --repo <repo>
```

At this point you have a "map", but haven't done "field research" yet. Continue to the next step.

---

## [S3] Deep Reading of Key Code

This is the most important step of this phase. GitNexus tells you "where to look", this step you need to "actually look".

- **Multiple Subagents in Parallel**: Simultaneously delegate multiple Subagents to execute the following tasks.
- **Pass GitNexus usage method**: Subagents do not have the ability to use GitNexus, so you need to explicitly specify how to use GitNexus or provide examples in the prompt.

| Subagent | Task Name |
|----------|----------|
| A3.1 | Entry and Configuration Analysis |
| A3.2 | Core Business Flow Tracing |
| A3.3 | System Boundaries and Cross-cutting Concerns |
| A3.4 | Module Structure and Dependency Analysis |

---

### [A3.1] Entry and Configuration Analysis

**Reading Targets**: Entry files, package management configurations, environment variable files, build configurations, CI/CD configurations, Dockerfile.

**Understanding Points**:

- How the project initializes, what the startup command is
- Dependency injection / module loading order
- Configuration loading methods (environment variables, configuration files, command-line parameters)
- Exact versions of each technology stack component
- Environment variable list and their source files
- Deployment methods and pipeline structure

---

### [A3.2] Core Business Flow Tracing

**Reading Targets**: Starting from entry points identified in S2, trace 3-5 of the most important business flows along the call chain.

**Understanding Points**:

- Trigger conditions, participating modules, key decision points for each flow
- State transitions in the flow (whether there are explicit state machines or implicit state changes)
- Data transformation process between modules (input form → intermediate form → persistent form → output form)
- Global state management strategy (memory / Store / database / cache)

---

### [A3.3] System Boundaries and Cross-cutting Concerns

**Reading Targets**: Including but not limited to external service integration code, middleware / interceptors, error handling, logging, authentication & authorization, plugin mechanisms, and related files. (Can skip if not present)

**Understanding Points**:

- What external users / systems / services the system interacts with, and what the integration methods are
- How many actual layers the code is divided into, responsibility boundaries and violations of each layer
- Unified solutions for error handling, logging, authentication & authorization, data validation
- Whether there are plugin / Hook / middleware pipeline extension mechanisms
- API protocols exposed externally and their documentation level
- Observable architectural risks and technical debt

---

### [A3.4] Module Structure and Dependency Analysis

**Reading Targets**: Entry files / index files of each module, import relationships between modules, shared type definitions. Combine analysis from GitNexus and code file analysis results.

**Understanding Points**:

- Module responsibility understanding (why it exists, GitNexus won't tell you)
- What criteria the project uses to divide modules (business domain / technical layer / functional responsibility)
- Responsibility boundaries, corresponding paths, and architectural layer of each module
- Dependency direction and calling relationships between modules
- Communication patterns between modules (direct calls / events / message queues / HTTP/RPC / shared state)
- Which modules are depended on the most (coupling hotspots)
- External packages / services each module depends on
- Hidden design decisions (why designed this way, what are the trade-offs)

**Module Granularity Confirmation**:

Module boundaries are subjective decisions; code cannot give the correct answer. Generate at least two granularity options and ask the user:

- "Which granularity do you prefer? I recommend ___. Because___."

---

## [S4] Generate Overview.md

- **Template Loading**: Load 'assets/overview-template.md' for output structure.
- **Gap Identification**: Identify missing items from [S3], perform supplementary reading for missing items
- **Be Realistic**: DO NOT proceed to generation unless all missing items have been confirmed explored; cannot rely on speculation.
- **Final Generation**: Generate Overview.md file according to template

---

## [S5] Generate Architecture.md

This document cannot only reflect the surface structure of code. Every architectural judgment must cite specific code files and line numbers.

- **Template Loading**: Load 'assets/architecture-template.md' for output structure.
- **Gap Identification**: Identify missing items from [S3], perform supplementary reading for missing items
- **Be Realistic**: DO NOT proceed to generation unless all missing items have been confirmed explored; cannot rely on speculation.
- **Final Generation**: Generate Architecture.md file according to template

### Architecture Self-check

- [ ] System boundary diagram includes all identified external participants and external systems
- [ ] Layering reflects the actual code organization, not ideal architecture
- [ ] Cross-cutting concerns have key files annotated on each line
- [ ] Entry point table covers all entry types
- [ ] Core flows ≥ 3, each includes trigger conditions, state transition diagrams, cross-module sequence diagrams, and cites specific file:line
- [ ] State management strategy is based on actual code implementation, not speculation
- [ ] End-to-end data flow annotates modules passed through and transformation descriptions
- [ ] Extension mechanisms and external API boundaries are based on code evidence
- [ ] Architectural risks and technical debt come from code observations, annotated with probability / severity / priority

---

## [S6] Generate Modules.md

- **Template Loading**: Load 'assets/modules-template.md' for output structure.
- **Gap Identification**: Identify missing items from [S3], perform supplementary reading for missing items
- **Use Submodules Carefully**: Only split submodules when the project is large; before splitting, ask yourself "Is the parent module bloated enough to require splitting?"
- **User Feedback**: Provide at least two module granularity options, ask user preference "Which granularity do you prefer? I recommend ___. Because___."
- **Be Realistic**: DO NOT proceed to generation unless all missing items have been confirmed explored; cannot rely on speculation.
- **Final Generation**: Generate Modules.md file according to template

### Modules Self-check

- [ ] Module count is reasonable, submodules not over-split
- [ ] User has been asked to confirm module granularity plan
- [ ] Module division explains the basis and corresponds to layering in Architecture.md
- [ ] Module hierarchy tree and module list ID numbering are consistent, IDs are globally unique across the three documents
- [ ] Module layering view is consistent with layering in Architecture.md §2
- [ ] Dependency relationship diagram and dependency matrix are based on actual import / call relationships, data is consistent between them
- [ ] External dependency mapping covers all third-party dependencies of all modules, annotated with version and risk
- [ ] Coupling hotspots annotate dependency count and provide risk level
- [ ] Communication pattern table covers all communication methods actually existing in the project, annotated with key files

---

## [S7] Generate SKILL.md

This document is the entry and index to project analysis results

- **Template Loading**: Load 'assets/skill-template.md' for output structure.
- **Be Realistic**: Fill in according to currently generated documents, leave items not yet generated blank.
- **Final Generation**: Generate SKILL.md file according to template

---

## [S8] Parallel Validation of Module Documents

Validate documents `Overview.md`, `Architecture.md`, `Modules.md`. Validation Subagents use independent context, do not inherit memory from generation phase—this ensures validation objectivity and avoids inheriting blind spots from generation.

- **Ask User**: MUST ask user if validation can be skipped, as this phase is long; if user says it can be skipped, do not execute
- **Parallel Execution**: Simultaneously delegate multiple Subagents to fact-check the above three documents
- **Fix Issues**: For documents with issues, MUST prompt user and correct before finishing

---

## Completion Checklist

- [ ] GitNexus has been initialized (successful or failure reason explained)
- [ ] All four S3 Subagent tasks completed, key code has been actually read
- [ ] S4 cross-validation has no unresolved contradictions
- [ ] Overview.md has been generated and passed self-check
- [ ] Architecture.md has been generated and passed self-check
- [ ] Modules.md has been generated and passed self-check
- [ ] Module IDs, layer names, dependency relationships are consistent across the three documents
- [ ] SKILL.md has been generated and accurately reflects analysis results
