# CloudSketch Business Plan

**Infrastructure Reasoning Platform — From Design to Deployment**

*Version 1.0 — June 2026*

---

## 1. Executive Summary

CloudSketch is building the **operating system for infrastructure design and reasoning** — a collaborative platform where cloud architecture lives as a structured, living graph that powers diagrams, Terraform, validation, cost analysis, failure simulation, and deployment from a single source of truth.

Today, infrastructure work is fragmented across documents, meetings, diagramming tools, IaC repos, security reviews, and cost spreadsheets. Engineers spend more time translating between formats than reasoning about systems. CloudSketch eliminates that fragmentation.

**Current product:** A Next.js web app with an interactive AWS canvas, real-time Terraform generation, connection validation, and an emerging AI design console — the seed of the graph-first platform described in [vision.md](./vision.md).

**Business opportunity:** The cloud infrastructure software market exceeds $50B annually and is growing at ~15% CAGR, driven by multi-cloud adoption, platform engineering teams, and AI-assisted development. No incumbent owns the full lifecycle from *requirements → design → reasoning → deploy → operate*.

**Target:** $5M ARR within 36 months via product-led growth into mid-market engineering teams, expanding to enterprise platform organizations.

**Funding ask (optional framing):** $2–3M seed to reach Phase 3 (ingestion + reasoning + validation) with 50+ paying teams and proven expansion revenue.

---

## 2. Problem Statement

### The Fragmentation Tax

| Activity | Typical Tool Today | Pain |
|----------|-------------------|------|
| Requirements | Google Docs, Confluence | Disconnected from architecture |
| Diagramming | Lucidchart, draw.io | Static, outdated within weeks |
| IaC | Terraform, Pulumi | Written separately, drifts from diagrams |
| Security review | Manual checklists, spreadsheets | After-the-fact, not continuous |
| Cost planning | AWS Calculator, spreadsheets | Disconnected from architecture changes |
| Capacity / DR planning | Ad-hoc analysis | Late, inconsistent |
| Deployment | CI/CD, Terraform Cloud | No link back to design intent |

**Result:** Slow design cycles, architecture drift, security gaps discovered late, unpredictable costs, and tribal knowledge locked in senior engineers' heads.

### Who Feels This Most

- **Platform / DevOps engineers** translating architecture intent into Terraform
- **Solutions architects** maintaining diagrams that nobody trusts
- **Engineering managers** lacking visibility into design decisions and tradeoffs
- **Security & compliance teams** reviewing architectures without continuous validation
- **FinOps teams** estimating costs disconnected from actual designs

---

## 3. Solution

CloudSketch represents infrastructure as a **canonical graph (UGCP)**. Every capability is a projection of that graph:

```
Requirements & Documents ──┐
Natural Language (AI)    ──┼──► Infrastructure Graph (UGCP) ──► Visual Canvas
Existing IaC / Inventory ──┘         │              │              │
                                       ▼              ▼              ▼
                                  Terraform      Validation      Cost / Failure
                                  K8s / Helm     Reasoning       Simulation
                                                 Optimization    Deployment
```

### Core Value Propositions

1. **Design 10x faster** — Describe or draw architecture; get editable diagrams and deployable Terraform instantly.
2. **One source of truth** — No more diagram-vs-code drift; the graph syncs everything.
3. **Continuous validation** — Security, reliability, and operational issues flagged as you design, not after deploy.
4. **Reason about infrastructure** — Ask *why* decisions were made; get alternatives with tradeoffs.
5. **Simulate before you ship** — Model failures, traffic spikes, and cost scenarios on the architecture itself.
6. **Deploy from the graph** — Plan, apply, detect drift, and close the loop to a living digital twin.

---

## 4. Market Analysis

### Total Addressable Market (TAM)

| Segment | Est. Size (2026) | Notes |
|---------|------------------|-------|
| Cloud infrastructure & ops software | ~$50B+ | IDC, Gartner cloud management |
| IaC & configuration management | ~$4B | Terraform, Pulumi, Ansible ecosystem |
| Architecture diagramming & collab | ~$3B | Lucid, Miro, Figma adjacency |
| FinOps & cloud cost management | ~$2B | Fast-growing subsegment |
| **Combined TAM (CloudSketch overlap)** | **~$15–20B** | Design-through-operate lifecycle |

### Serviceable Addressable Market (SAM)

Teams of 20–500 engineers using AWS (expanding to multi-cloud) who design and deploy cloud infrastructure regularly:

- ~500K companies globally use AWS at scale
- ~50K have dedicated platform/architecture functions
- **SAM:** ~$2B (assuming $40K average annual contract value across target segment)

### Serviceable Obtainable Market (SOM) — 3-Year

- 500 paying teams × $10K average = **$5M ARR** (conservative)
- 100 enterprise accounts × $50K average = **$5M ARR** (expansion)
- **SOM target: $5–10M ARR by Year 3**

### Market Trends Favoring CloudSketch

1. **Platform engineering** — Internal developer platforms need design-to-deploy tooling.
2. **AI-assisted development** — LLMs can generate architecture, but need structured graph output and guardrails.
3. **FinOps mandate** — CFOs demand cost visibility earlier in the design phase.
4. **Compliance pressure** — SOC 2, HIPAA, PCI require continuous architecture validation.
5. **Terraform ubiquity** — 70M+ Terraform downloads/year; IaC is the deployment lingua franca.

---

## 5. Competitive Landscape

| Competitor | Strength | Gap CloudSketch Fills |
|------------|----------|----------------------|
| **Lucidchart / draw.io** | Diagramming, collaboration | No IaC, no validation, no reasoning, static |
| **Cloudcraft** | AWS-focused diagrams | Limited reasoning, no deploy, no AI ingestion |
| **Brainboard** | Diagram → Terraform | Weaker AI, limited simulation/reasoning |
| **Terraform Cloud / Spacelift** | Deploy, state, policy | No visual design, no AI generation, no simulation |
| **Pulumi / AWS CDK** | IaC frameworks | Code-first, not collaborative visual design |
| **Datadog / CloudHealth** | Runtime observability, cost | Post-deploy only, no design-time intelligence |
| **ChatGPT / Copilot** | General AI | No graph, no validation, no deploy integration |

### CloudSketch Differentiation

> **"Figma for infrastructure, with a brain and a deploy button."**

No competitor combines:
- AI-native design
- Real-time collaboration
- Graph-driven Terraform
- Continuous architecture validation
- Cost / failure / capacity simulation
- Deployment automation
- Long-term digital twin

The moat deepens with **organizational context** (ingested RFCs, policies, inventories) and **decision provenance** stored in the graph.

---

## 6. Target Customers & Personas

### Primary ICP (Ideal Customer Profile)

- **Company size:** 50–1,000 employees
- **Engineering headcount:** 20–200
- **Cloud spend:** $50K–$2M/month on AWS
- **Maturity:** Uses Terraform; has platform or DevOps function; feels diagram/IaC drift pain
- **Verticals:** SaaS, fintech, healthtech, e-commerce, media

### Personas

| Persona | Role | Job to Be Done | CloudSketch Hook |
|---------|------|----------------|------------------|
| **Alex** | Staff / Solutions Architect | Design systems, get buy-in, document decisions | AI design + reasoning + review mode |
| **Priya** | Platform / DevOps Engineer | Turn designs into Terraform, keep environments consistent | Graph → TF + deploy + drift detection |
| **Jordan** | Engineering Manager | Visibility into architecture decisions and risks | Validation dashboard + approval workflows |
| **Sam** | Security Engineer | Ensure architectures meet policy before deploy | Continuous security validation |
| **Taylor** | FinOps Lead | Predict and control cloud costs at design time | Cost intelligence + growth simulation |

### Buying Process

- **Bottom-up (PLG):** Individual architect discovers CloudSketch, designs a project, invites team.
- **Team expansion:** Workspace grows to 5–20 seats; validation and collaboration drive upgrade.
- **Top-down (enterprise):** Platform org standardizes on CloudSketch for architecture governance.

---

## 7. Product Strategy & Roadmap Alignment

Product development follows the phased [roadmap.md](./roadmap.md):

| Phase | Timeline | Product Milestone | Revenue Relevance |
|-------|----------|-------------------|-------------------|
| 0 | Months 1–2 | Graph foundation + AWS depth | Beta retention |
| 1 | Months 3–5 | AI design + templates | PLG launch, free → pro conversion |
| 2 | Months 5–8 | Real-time collaboration | Team plan revenue |
| 3 | Months 8–12 | Ingestion + reasoning + validation | Enterprise security/compliance sales |
| 4 | Months 12–18 | Cost, scale, failure simulation | FinOps + enterprise upsell |
| 5 | Months 18–24 | Deploy automation | High ACV, platform replacement |
| 6 | Months 24–36 | Digital twin + multi-cloud | Enterprise standard, expansion revenue |

**Go-to-market aligns with product:** Sell what exists; preview what's next. Do not sell the digital twin before Phase 5 deploy works reliably.

---

## 8. Business Model

### Pricing Tiers (Proposed)

| Tier | Price | Target | Includes |
|------|-------|--------|----------|
| **Free** | $0 | Individuals, students | 1 project, 3 AWS services, basic TF export, 10 AI generations/month |
| **Pro** | $29/user/mo | Individual architects | Unlimited projects, full AWS library, AI design, validation (basic) |
| **Team** | $49/user/mo | Engineering teams (5–50) | Real-time collab, workspaces, version history, approval flows, validation (full) |
| **Business** | $79/user/mo | Mid-market platform teams | Ingestion, reasoning, cost sim, SSO, audit logs |
| **Enterprise** | Custom ($60K–$250K/yr) | 200+ engineers | Deploy automation, digital twin, multi-cloud, dedicated support, SLA, on-prem option |

### Expansion Revenue Levers

- **AI usage packs** — Additional AI generation credits beyond tier limits
- **Deployment runs** — Metered terraform apply minutes / environments
- **Cloud accounts connected** — Per-account pricing for digital twin sync
- **Professional services** — Architecture review, migration, custom validation rules
- **Template marketplace** — Revenue share on premium architecture templates

### Unit Economics (Target at Scale)

| Metric | Target |
|--------|--------|
| Gross margin | 75–85% (SaaS + AI API costs) |
| CAC (PLG) | $500–$1,500 per team |
| CAC (enterprise) | $15K–$30K |
| LTV (team, 3yr) | $25K–$75K |
| LTV:CAC | >5:1 |
| Net revenue retention | 120%+ (seat expansion + tier upgrades) |
| Payback period | <12 months |

---

## 9. Go-to-Market Strategy

### Phase A: Design Partners (Months 1–6)

- Recruit **10–15 design partner teams** (free access, weekly feedback)
- Focus on SaaS companies with 20–100 engineers on AWS
- Deliver: AI design + canvas + Terraform + basic validation
- Success metric: 8/10 partners active weekly; 5 convert to paid at launch

### Phase B: Product-Led Growth Launch (Months 6–12)

**Acquisition channels:**

| Channel | Tactic | Expected CAC |
|---------|--------|--------------|
| **Content / SEO** | "Terraform from diagram", "AWS architecture patterns", "Well-Architected guides" | Low |
| **Developer community** | Hacker News launches, Reddit r/devops, AWS subreddits, DevOps Twitter/X | Low |
| **Open source** | Open UGCP schema, template library, validation rule packs | Low |
| **Product integrations** | GitHub Action for TF export, VS Code extension | Medium |
| **YouTube / demos** | "Design to deploy in 10 minutes" architecture walkthroughs | Low |
| **Conferences** | KubeCon, re:Invent, DevOpsDays sponsor/booth | High |

**Activation funnel:**

1. Sign up (Clerk auth — already integrated)
2. Generate first architecture via AI (< 3 minutes to value)
3. Export Terraform (aha moment)
4. Invite teammate (collaboration hook)
5. Hit validation insight (upgrade trigger)

**Conversion triggers:** AI limit hit, collaboration needed, validation findings, SSO required.

### Phase C: Enterprise Sales (Months 12–24)

- Hire 1–2 AEs + 1 solutions engineer
- Target platform engineering orgs at Series B–D startups and mid-market
- Sell **governance + validation + deploy** bundle
- Land with one team ($15K–$30K), expand to org-wide ($60K–$150K)
- Partnerships: AWS Marketplace listing, Terraform ecosystem partners

### Phase D: Platform & Ecosystem (Months 24+)

- Public API and webhook ecosystem
- Partner-built integrations (Jira, ServiceNow, PagerDuty)
- Architecture template marketplace
- Certification program for CloudSketch architects

---

## 10. Financial Projections (3-Year Summary)

*Illustrative model — refine with actual pricing experiments.*

### Revenue Forecast

| | Year 1 | Year 2 | Year 3 |
|---|--------|--------|--------|
| Free users (cumulative) | 5,000 | 25,000 | 80,000 |
| Paying teams | 50 | 250 | 800 |
| Avg revenue per team/yr | $3,600 | $8,400 | $12,000 |
| Enterprise deals | 0 | 8 | 30 |
| Avg enterprise ACV | — | $60,000 | $90,000 |
| **Total ARR** | **$180K** | **$2.6M** | **$12.3M** |

### Cost Structure (Year 1)

| Category | Annual Cost | Notes |
|----------|-------------|-------|
| Engineering (4 FTE) | $600K | Full-stack, infra, AI |
| Design + Product (1 FTE) | $120K | UX, research |
| GTM (1 FTE) | $100K | DevRel / growth |
| Infrastructure (AWS, Vercel, MongoDB) | $60K | Scales with usage |
| AI API costs | $40K | Groq/OpenAI inference |
| Legal, accounting, misc | $40K | Incorporation, SOC 2 prep |
| **Total Year 1 burn** | **~$960K** | Pre-revenue / early revenue |

### Funding & Milestones

| Round | Amount | Milestone to Achieve |
|-------|--------|---------------------|
| **Pre-seed / bootstrap** | $250K–$500K | Phase 0–1 complete, 10 design partners |
| **Seed** | $2–3M | Phase 2–3, $500K ARR, 100 paying teams |
| **Series A** | $8–12M | Phase 4–5, $3M ARR, enterprise traction |

---

## 11. Team & Organization

### Founding Team Needs

| Role | Responsibility |
|------|----------------|
| **CEO / Product** | Vision, GTM, fundraising, design partners |
| **CTO** | UGCP architecture, platform engineering, security |
| **Lead Engineer** | Canvas, graph sync, Terraform pipeline |
| **AI Engineer** | LLM integration, ingestion, reasoning engine |

### Year 1 Hiring Plan

1. Full-stack engineer (collaboration + persistence)
2. Infra/IaC specialist (Terraform quality + deploy)
3. Designer (UX for complex architecture workflows)
4. DevRel / growth (content, community, PLG)

### Advisors (Recommended)

- Former AWS solutions architect (well-architected credibility)
- Platform engineering leader from high-growth SaaS (buyer perspective)
- FinOps practitioner (cost intelligence validation)
- Enterprise security / compliance (SOC 2, FedRAMP path)

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Slow enterprise sales | Medium | High | PLG first; prove ROI with validation + cost sim |
| AI hallucination in architecture | Medium | High | Schema validation, rule engine, human-in-the-loop |
| Incumbent adds AI features | High | Medium | Move fast on graph + reasoning moat, not just AI |
| Terraform ecosystem shifts | Low | Medium | Multi-format output (OpenTofu, K8s, extensible) |
| Security breach / trust loss | Low | Critical | SOC 2, no cloud creds in browser, pen testing |
| High AI inference costs | Medium | Medium | Caching, smaller models for layout, tiered usage |
| Complex product, hard onboarding | Medium | High | AI-first activation, templates, 3-minute time-to-value |

---

## 13. Key Performance Indicators (KPIs)

### Product KPIs

- Weekly active projects
- Time to first Terraform export (< 5 min target)
- AI generation acceptance rate
- Validation findings per project (engagement signal)
- Terraform export → deploy conversion (Phase 5+)

### Business KPIs

- MRR / ARR growth (15% MoM target in Year 2)
- Free → paid conversion (5–8% target)
- Net revenue retention (120%+)
- Logo retention (> 90% annual)
- NPS (≥ 50 for Team tier)

### Leading Indicators

- Design partner engagement score
- Team invites sent per project
- AI prompts per user per week
- Validation rules triggered per session

---

## 14. Strategic Milestones (12 / 24 / 36 Months)

### 12 Months

- [ ] 100 paying teams, $500K ARR
- [ ] AI design + collaboration + validation shipped
- [ ] 50+ AWS resources, Terraform module output
- [ ] SOC 2 Type I in progress
- [ ] AWS Marketplace listing live

### 24 Months

- [ ] 400 paying teams + 15 enterprise accounts, $3M ARR
- [ ] Deploy automation GA
- [ ] Cost + failure simulation GA
- [ ] Series A closed
- [ ] 10+ integration partners

### 36 Months

- [ ] $10M+ ARR, 120%+ NRR
- [ ] Digital twin GA for AWS
- [ ] Azure/GCP beta
- [ ] Recognized in Gartner/Forrester cloud architecture tooling landscape
- [ ] Category leadership: "infrastructure reasoning platform"

---

## 15. Conclusion

CloudSketch addresses a clear, expensive problem: **infrastructure knowledge is fragmented, and engineers pay a translation tax every day.** The market has diagramming tools, IaC platforms, and observability suites — but no system that unifies design, reasoning, validation, simulation, and deployment around a living graph.

The technical foundation exists today: a visual AWS canvas, real-time Terraform compilation, graph protocol primitives, and an AI entry point. The [roadmap](./roadmap.md) sequences investment from graph hardening through digital twin, and this business plan maps each phase to revenue, GTM, and defensibility.

**The opportunity is to define a new category — the infrastructure reasoning platform — before incumbents bolt AI onto static diagramming tools.**

---

## Appendix A: Revenue Model Detail (Team Plan Example)

**Team of 10 engineers on Team tier ($49/user/mo):**

- Monthly: $490
- Annual: $5,880
- With 20% annual prepay discount: $4,704

**Expansion scenario (Year 2):**

- Team grows to 25 seats: $14,700/yr
- Upgrades to Business for cost sim: $23,700/yr
- Adds 3 deployment environments: +$3,600/yr
- **Total account value: ~$27K/yr** from a $5.9K land

---

## Appendix B: Comparable Company Benchmarks

| Company | Stage / ARR | Relevance |
|---------|-------------|-----------|
| Brainboard | ~$2–5M ARR est. | Direct adjacency (diagram → TF) |
| Env0 | ~$10M+ ARR | Deploy orchestration |
| Spacelift | ~$20M+ ARR | IaC management |
| Infracost | Acquired / growing | Cost at design time (feature, not platform) |
| Miro | $400M+ ARR | Collaboration UX benchmark |

CloudSketch's full-lifecycle scope positions it for higher ACV than point solutions, with platform-style retention.

---

## Appendix C: Document Index

| Document | Purpose |
|----------|---------|
| [vision.md](./vision.md) | Product vision and 13 core capabilities |
| [roadmap.md](./roadmap.md) | Phased execution plan and milestones |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Current technical state |
| [business-plan.md](./business-plan.md) | This document |

---

*Prepared for CloudSketch — June 2026. Update quarterly as product, market, and financial assumptions evolve.*