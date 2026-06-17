# CloudSketch Vision

*Last updated: June 2026*

---

## Positioning

### For engineers (external)

> Describe your system, get editable Terraform and instant security/reliability feedback — with every resource explaining why it exists.

### For investors (internal)

CloudSketch is building the **infrastructure reasoning layer** — a living, queryable graph that replaces fragmented architecture docs, diagrams, and IaC with something engineers can validate, simulate, and deploy through Git.

### What CloudSketch is not

- Not another Lucidchart or draw.io
- Not a Brainboard clone ("draw cloud diagrams that generate Terraform")
- Not an "AI draws your architecture" novelty — AWS Kiro CLI, Diagram MCP, and Brainboard already commoditize that lane
- Not a deployment orchestrator — Spacelift, env0, and Terraform Cloud own apply infrastructure

CloudSketch wins when judged as:

> A queryable, collaborative infrastructure graph that explains decisions, validates continuously, simulates failures, and stays synced from requirements → design → deploy → runtime.

---

## The Problem

Designing cloud infrastructure today is fragmented across multiple tools, documents, and teams.

Requirements live in Confluence. Architecture discussions happen in meetings. Diagrams are created separately and outdated within weeks. Infrastructure-as-Code is written later by another engineer. Security reviews happen after implementation. Cost analysis runs in spreadsheets. Capacity planning, failure analysis, and deployment considerations are delayed until production pain surfaces.

As systems grow, engineers spend more time **translating between formats** than reasoning about infrastructure itself.

### The daily pain

| Activity | Typical tool | Disconnect |
|----------|-------------|------------|
| Requirements | Google Docs, Confluence | Never linked to architecture |
| Diagramming | Lucidchart, draw.io | Static; drifts from code within weeks |
| IaC | Terraform, Pulumi | Written separately; no design intent |
| Security review | Manual checklists | After-the-fact, not continuous |
| Cost planning | AWS Calculator | Disconnected from architecture changes |
| Deployment | CI/CD, Terraform Cloud | No link back to *why* decisions were made |

There is no single source of truth connecting requirements, architecture, operational decisions, infrastructure code, deployment, and ongoing analysis.

### Cultural friction

Senior DevOps engineers often distrust canvas-only tools. They want Git as source of truth, modules with code review, and generated Terraform they can audit. Any product that traps users in a proprietary canvas without a Git escape hatch will struggle for adoption.

**Diagram-vs-code drift is the #1 daily pain CloudSketch must eliminate.**

---

## The Insight

CloudSketch represents infrastructure as a **canonical graph (UGCP — Universal Graph Communication Protocol)**.

Every capability — diagrams, Terraform, validation, reasoning, cost, simulation, deployment — is a **projection** of that graph, never a separate artifact.

The moat is not the canvas. The moat is **provenance**: every node knows *why* it exists.

```
Requirements & Documents ──┐
Natural Language (AI)    ──┼──► UGCP Graph (with provenance) ──► Visual Canvas
Existing IaC / Inventory ──┘         │           │              │
                                     ▼           ▼              ▼
                                Reasoning    Validation      Terraform
                                Engine       Engine          Export → Git
                                     │           │
                                     ▼           ▼
                              Failure Sim    Partner APIs
                              (design-time)  (Infracost, TFC)
```

If CloudSketch stores provenance on every graph node — requirement link, AI rationale, human override, pattern reference — it becomes a **queryable knowledge system**, not a drawing tool. That is genuinely differentiated. No major competitor owns this full loop today.

---

## Strategic Principles

These principles govern all product and engineering decisions. They are derived from [grok-report.md](./grok-report.md) market analysis.

1. **Graph-first** — UGCP is the source of truth. Canvas, Terraform, and analysis are views.
2. **Git-first** — Terraform lives in repos. CloudSketch exports to Git; imports from Git. The canvas is a view, not a trap.
3. **Wedge before breadth** — Ship reasoning + validation before heavy AI polish or real-time collaboration.
4. **AWS depth before multi-cloud** — Prove the model on AWS 3-tier and serverless patterns before Azure/GCP.
5. **Integrate specialists** — Partner with Infracost (cost), Terraform Cloud / Spacelift (deploy). Do not rebuild their core in Year 1–2.
6. **Human-in-the-loop** — AI generates and recommends; engineers always retain full edit control.
7. **Narrow ICP first** — Series A–C SaaS on AWS, 10–50 engineers, 3-tier web + serverless patterns.

---

## Competitive Frame

The market pays for infrastructure intelligence. CloudSketch's bet — that all intelligence should live in one graph — is logical but unproven at platform scale. Many players own slices.

| Competitor | What they own | CloudSketch wedge |
|------------|--------------|-------------------|
| **[Brainboard](https://www.brainboard.co/)** | Visual multi-cloud designer, real-time TF, collaboration, drift, AI diagrammer, enterprise logos | Weak on deep reasoning, failure simulation, requirements ingestion |
| **[StackGen](https://stackgen.com/)** | Visual AppStacks → hardened TF → HCP Terraform | Less AI-native; not positioned as reasoning platform |
| **[Infracost](https://www.infracost.io/)** | Shift-left cost at PR/design time | CloudSketch integrates, does not compete |
| **[Eraser](https://www.eraser.io/)** | AI diagram from Terraform/code | Reverse direction (code → diagram), not full design loop |
| **[Firefly](https://www.firefly.ai/)** | Cloud asset management, codify, drift remediation | CloudSketch focuses design-time reasoning first |
| **AWS Kiro / Diagram MCP** | Free AI diagram generation from natural language | Commoditizes AI drawing; CloudSketch cannot win on this alone |
| **Spacelift / env0 / TFC** | Deploy, policy, drift, CI/CD for IaC | CloudSketch partners; becomes the design brain |

### Positioning quadrant

```
                    Design + Operate Loop
                           ▲
                           │
         CloudSketch       │    Firefly
         (vision)          │    Lucidscale
                           │
    Brainboard ●           │         ● CloudSketch
    StackGen ●             │           (today)
                           │
  Low Integration ─────────┼───────── High Integration
                           │
         Eraser ●          │
         AWS Kiro ●        │
                           │
                           ▼
                    Design-Time Only
```

**Today:** CloudSketch is early on table-stakes (visual → TF) but **on time** for the differentiated pieces — reasoning, design-time failure simulation — because nobody has built them credibly yet.

---

## Provenance Model

Provenance is the foundation of the reasoning engine. Every UGCP node carries metadata explaining its origin and rationale.

### Node provenance schema

| Field | Type | Description |
|-------|------|-------------|
| `source` | `ai` \| `human` \| `import` \| `template` | How the node was created |
| `requirementRef` | string \| null | Link to requirement doc / RFC section |
| `rationale` | string | Human- or AI-generated explanation of why this resource exists |
| `patternRef` | string \| null | Reference to architecture pattern (e.g., `aws-3-tier-web`) |
| `promptRef` | string \| null | AI prompt that generated this node (if `source: ai`) |
| `overrides` | array | Human edits that diverged from AI/pattern suggestion, with reason |
| `createdAt` | ISO timestamp | Creation time |
| `createdBy` | user ID | Author |

### Example: "Why is RDS in a private subnet?"

Trace path:

1. `requirementRef` → RFC section 3.2: "Database must not be publicly accessible"
2. `patternRef` → `aws-3-tier-web` pattern enforces private subnet placement for data tier
3. `rationale` → "PostgreSQL stores PII; placed in private subnet per security requirement"
4. `overrides` → [] (no human override; AI/pattern placement accepted)

This trace is answerable without a full RAG system in the MVP — provenance fields plus graph context are sufficient for Phase 1.

---

## Core Capabilities

CloudSketch's long-term platform has 13 capabilities. They are organized by **strategic priority**, not build order.

### Priority tiers

| Tier | Capabilities | Strategy |
|------|-------------|----------|
| **Wedge (build first)** | 4 Ingestion, 5 Reasoning, 6 Validation, 9 Failure simulation | Differentiation — ship before AI polish or collab |
| **Table stakes (build well)** | 1 AI design, 2 Visual design, 11 TF generation | Must be good; not unique alone |
| **Partner (integrate)** | 7 Cost (Infracost), 12 Deploy (TFC/Spacelift) | Integrate in Year 1–2; do not compete |
| **Long-term (build late)** | 3 Collaboration, 8 Capacity, 10 Optimization, 13 Digital twin | After wedge is proven with paying users |

---

### 1. AI-Powered Infrastructure Design
**Tier: Table stakes**

Engineers describe systems in natural language.

> Build a 3-tier web app on AWS with PostgreSQL, Redis, and auto-scaling.

CloudSketch should:

- Parse workload characteristics and constraints (region, HA, budget, RTO/RPO)
- Generate an editable UGCP graph with provenance on every node
- Support incremental edits ("add a cache layer") that merge into the existing graph
- Remain fully editable — AI suggests, humans decide

AI generation is expected, not novel. AWS and Brainboard already offer it. CloudSketch's AI must output structured UGCP with provenance, not just icons on a canvas.

---

### 2. Interactive Visual Architecture Design
**Tier: Table stakes**

A visual canvas for designing infrastructure, synchronized with the UGCP graph.

Users can:

- Create architectures visually (drag, drop, connect)
- Organize resources into VPCs, subnets, tiers, and regions
- Model networking boundaries and service dependencies
- Use reusable templates (3-tier web, serverless API, data lake)
- Search and filter nodes by type, tag, or property

The diagram is always a projection of the graph — never a separate artifact.

Multi-cloud visual design is a long-term goal. Near-term focus is **AWS depth** for 3-tier and serverless patterns.

---

### 3. Real-Time Collaborative Editing
**Tier: Long-term**

Multiple engineers work on the same design simultaneously.

Features include shared sessions, presence indicators, shared cursors, comment threads, team workspaces, RBAC, change history, version control, and approval workflows.

Collaboration is expensive engineering (CRDT/real-time sync). CloudSketch will ship **async collaboration** (comments, review mode, version history) before live multi-cursor editing. Table-stakes for enterprise, but not the wedge.

---

### 4. Infrastructure Knowledge Ingestion
**Tier: Wedge**

Organizations upload existing knowledge and CloudSketch transforms it into UGCP graphs.

Sources:

- Requirement documents, RFCs, architecture docs (PDF, DOCX, Markdown, Confluence)
- Existing Terraform, CloudFormation, Kubernetes manifests
- Cloud inventories (AWS Resource Groups, Terraform state, Pulumi state)

Ingested resources carry `source: import` provenance with links back to the source file and extracted constraints. Platform teams drowning in brownfield infra are an underserved wedge.

---

### 5. Infrastructure Reasoning Engine
**Tier: Wedge — strongest differentiation bet**

CloudSketch understands infrastructure rather than merely generating it.

Users ask:

- Why was this component added?
- What problem does this service solve?
- Why is this database in a private subnet?
- What alternatives exist and what are the tradeoffs?

Answers trace through provenance (requirement → pattern → rationale → overrides) and graph context. Over time, RAG over organizational documents enriches answers.

**Nobody credibly answers "why?" today.** Even a basic provenance-backed Q&A beats Brainboard on differentiation.

---

### 6. Architecture Review & Validation
**Tier: Wedge — sellable now**

Every architecture is continuously analyzed as the user designs.

### Reliability

- Single points of failure, missing redundancy, backup gaps
- Regional dependencies, availability risks, disaster recovery gaps

### Security

- Publicly exposed resources, excessive IAM permissions, open security groups
- Unencrypted storage, unsecured databases, compliance violations

### Operational

- Missing monitoring, observability, logging, alerting
- Deployment risks

### Architectural

- Anti-patterns, over-engineering, misconfiguration, dependency concerns

Findings are severity-scored with remediation steps. "Fix it" actions propose graph mutations the user approves. Validation is the **90-day MVP** — 30 rules (15 security, 15 reliability) that make CloudSketch sellable before AI or collaboration mature.

---

### 7. Cost Intelligence
**Tier: Partner — integrate Infracost**

Real-time cost visibility during design.

- Per-resource and per-architecture cost estimates
- Architecture variant comparison ("Option A vs B")
- Growth scenario simulation

**Do not build a custom pricing engine.** Infracost dominates shift-left cost with 3,500+ companies and Fortune 500 adoption. CloudSketch integrates Infracost's API and surfaces cost in the graph context.

---

### 8. Scalability & Capacity Analysis
**Tier: Long-term**

Evaluate whether an architecture handles expected workloads.

- Traffic growth, request spikes, regional expansion, data growth
- Bottleneck identification across compute, network, DB, cache
- Scaling recommendations with headroom metrics

Graph-native capacity analysis is rare. Build after validation and failure simulation prove the graph model.

---

### 9. Failure Simulation & Resilience Analysis
**Tier: Wedge**

Test architectures **before deployment** — design-time, not runtime chaos engineering.

Scenarios:

- What happens if Redis fails?
- What happens if a region goes offline?
- What happens if the primary database becomes unavailable?
- What happens if traffic increases 10x?

CloudSketch traverses the dependency graph, visualizes blast radius on the canvas, and estimates RTO/RPO gaps. Chaos tools (Gremlin, Litmus) run against deployed systems. Simulating failure on the architecture graph before deploy is rare and a strong enterprise sales hook.

---

### 10. Infrastructure Optimization
**Tier: Long-term**

Continuous improvement recommendations with tradeoff explanations.

- Reduce costs, improve availability, improve performance
- Reduce complexity, improve security, improve deployment speed

Recommendations propose graph mutations with a tradeoff matrix. User approves before applying. Builds on validation (Phase 1) and cost/failure intelligence (Phase 4).

---

### 11. Terraform & Infrastructure-as-Code Generation
**Tier: Table stakes**

The graph is deployable. CloudSketch generates:

- Terraform / OpenTofu (primary)
- Kubernetes manifests and Helm charts (later)
- Environment-specific variable extraction

Generated code synchronizes with graph changes. Export to Git is the primary delivery mechanism — not a proprietary download.

Module-aware generation (VPC module, 3-tier reference architecture) is required for developer trust.

---

### 12. Deployment Automation
**Tier: Partner — integrate TFC / Spacelift**

Users deploy from CloudSketch, but CloudSketch does not build apply infrastructure.

Near-term:

- Export Terraform to GitHub / GitLab
- Trigger `terraform plan` via Terraform Cloud or Spacelift
- Show plan results in CloudSketch UI
- Environment promotion via Git branches (dev/staging/prod)

**Out of scope for Year 1–2:** custom apply runners, state backends, policy engines, multi-account orchestration. Spacelift ($51M Series C) and TFC own this lane.

---

### 13. Infrastructure Digital Twin
**Tier: Long-term — Phase 6 outcome**

A living representation of deployed infrastructure.

Every node reflects three states: **design** | **deployed** | **runtime**.

CloudSketch continuously compares planned ↔ actual infrastructure and identifies drift, risks, and opportunities. Runtime metrics overlay on the canvas. Orphan detection finds resources in cloud not in design (and vice versa).

**Do not market the digital twin externally until the deploy loop works.** Engineers will not believe it until they see reasoning + validation + Git export prove the graph model first.

---

## What We Will Not Do

Explicit non-goals, derived from [grok-report.md](./grok-report.md):

1. **No multi-cloud before AWS depth is undeniable** — 50+ AWS resources with validation and reasoning before Azure/GCP.
2. **No deployment orchestration before 100+ weekly active users** — partner with TFC/Spacelift instead.
3. **No Infracost competitor** — integrate their API; cost is not our wedge.
4. **No external "infrastructure OS" marketing** until reasoning + validation ship and engineers adopt.
5. **No AI-diagram positioning** — "AI draws your architecture" is commoditized by AWS Kiro/MCP.
6. **No canvas-only trap** — every project must have a Git export path from day one.
7. **No building all 13 capabilities in parallel** — ruthless sequencing per [roadmap.md](./roadmap.md).

---

## Long-Term Goal

CloudSketch is not a diagramming tool. It is not a Terraform generator. It is not a chatbot.

The long-term vision is an **infrastructure reasoning platform** where engineers design, understand, validate, simulate, optimize, and deploy cloud systems from a single graph.

Infrastructure becomes something that can be discussed, queried, reviewed, simulated, collaborated on, and executed — with every decision traceable to a requirement, pattern, or explicit human choice.

Internally, the ambition remains an "infrastructure OS." Externally, we earn that label only after engineers trust the reasoning and validation layer.

---

## Success Definition

### Engineer adoption signals

- Weekly Git export usage (Terraform pushed to repos, not just viewed in UI)
- Validation engagement (users act on findings, not just dismiss them)
- "Why?" queries return useful answers (measured by thumbs-up or zero re-asks)

### Differentiation signals

- Design partners choose CloudSketch over Brainboard for **validation + reasoning**, not diagramming
- Inbound interest cites "explainable architecture" or "design-time failure simulation"
- Generated Terraform passes `terraform validate` without manual fixes on standard patterns

### Failure signals (pivot triggers)

- Users treat CloudSketch as a diagram export tool only (no validation, no provenance engagement)
- Design partners churn because generated Terraform requires >10 manual fixes per architecture
- Brainboard or AWS tooling ships reasoning/provenance before CloudSketch reaches Phase 1 exit criteria

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [roadmap.md](./roadmap.md) | 36-month phased execution plan |
| [grok-report.md](./grok-report.md) | Market research, competitive analysis, strategic recommendations |
| [business-plan.md](./business-plan.md) | Business model, GTM, financial projections |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Current technical state and repo structure |

---

*CloudSketch vision — June 2026. Revisit quarterly against market signals and product progress.*