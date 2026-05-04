# HAVEN — Stage 2 Report
### Project Portfolio | Holberton School — Cohort C28

**Team:** Ainy Ourzik · Benjamin Bommier · Cyril Iglesias
**Project Start:** April 27, 2025
**Expected Delivery:** Mid-July 2025

---

## Table of Contents

1. [Project Objectives — SMART Method](#1-project-objectives--smart-method)
2. [Project Scope](#2-project-scope)
3. [Risk Identification](#3-risk-identification)
4. [High-Level Plan & Timeline](#4-high-level-plan--timeline)

---

## 1. Project Objectives — SMART Method

Rather than listing isolated criteria, the team formulated the project objectives as a structured set of commitments, each grounded in the SMART framework.

**Specific —** Haven aims to provide students across all educational levels with a secure, private, and accessible platform to report bullying situations — whether as a victim or a witness — within their institution. The platform will guide users through the reporting process via a conversational interface and automatically notify the appropriate school staff upon submission.

**Measurable —** The project will be considered successful if the following are delivered by mid-July 2025: a functional and accessible reporting flow, a working integration with the chatbot provided by Haven Lab, a notification system reaching designated staff members, and a tested, deployable MVP validated by the team and Holberton School.

**Achievable —** The scope has been deliberately kept focused. The team consists of three fullstack developers with complementary strengths, and the technology stack — React, Node.js, Express, and MongoDB — reflects tools the team is confident working with. The chatbot component will be provided by Haven Lab, removing a significant technical uncertainty from the MVP scope.

**Relevant —** School bullying is a documented and widespread issue in France. Haven directly addresses a gap in how institutions currently handle reporting — most rely on informal or in-person channels that students may find intimidating or inaccessible. The partnership with the French National Education system (l'Académie) gives the project real institutional grounding and a genuine deployment context.

**Time-bound —** The project runs from April 27 to mid-July 2025, spanning approximately 11 weeks. Each stage has a defined timeframe, and the team has established internal checkpoints to monitor progress and adjust if needed.

---

## 2. Project Scope

### In Scope

The following features and deliverables are part of the MVP:

- Secure user account creation and authentication (JWT-based)
- Private and anonymous incident reporting flow
- Integration of the conversational chatbot provided by Haven Lab
- Automated notification system alerting designated school staff upon report submission
- Basic staff-facing interface to view and manage incoming reports
- Mobile-first responsive design
- Deployment of a functional, testable MVP

### Out of Scope

The following elements will not be addressed in this MVP phase:

- Native mobile application (iOS / Android)
- Multi-institution or multi-academy management
- Advanced analytics or reporting dashboards
- Multi-language support
- Real-time chat between students and staff
- Coverage of out-of-school bullying situations *(may be considered in a future iteration)*

> **Note:** Several scope decisions remain pending confirmation from Thomas Spitz (Haven Lab). An initial meeting was scheduled for April 28, 2025, but was cancelled. The team is awaiting a rescheduled appointment. Points marked as speculative will be updated upon stakeholder validation.

---

## 3. Risk Identification

Risks have been categorized by criticality level to help the team prioritize mitigation efforts.

### High Criticality

| Risk | Impact | Mitigation |
|---|---|---|
| Delayed or limited communication with Haven Lab | Blocks chatbot integration and scope validation | Follow up proactively; design integration layer to be modular and replaceable |
| RGPD compliance for minors' sensitive data | Legal and ethical exposure | Research applicable French regulations early; consult Holberton staff if needed |
| Chatbot integration dependency | MVP cannot be fully tested without it | Build a mock chatbot interface for development; switch to real integration once available |

### Medium Criticality

| Risk | Impact | Mitigation |
|---|---|---|
| Timeline pressure (11 weeks, academic context) | Incomplete MVP at deadline | Follow the phased plan strictly; deprioritize non-essential features if behind schedule |
| Ensuring meaningful anonymity while enabling follow-up | Trust and usability issue for end users | Define anonymity model early in technical documentation phase |
| Team availability conflicts | Delays in development | Maintain clear task ownership on GitHub; communicate blockers immediately on Discord |

### Low Criticality

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep | Overengineered MVP | Refer back to the defined scope; any addition requires full team agreement |
| Deployment issues | Delayed public availability | Test deployment environment early; document all configuration steps |

---

## 4. High-Level Plan & Timeline

### Project Phases

| Phase | Stage | Key Deliverables | Status |
|---|---|---|---|
| **Phase 1** | Stage 1 — Idea Development | Team formation, brainstorming, MVP selection, Stage 1 Report | ✅ Completed |
| **Phase 2** | Stage 2 — Project Planning | SMART objectives, scope, risk assessment, timeline | 🔄 In Progress |
| **Phase 3** | Stage 3 — Technical Documentation | Architecture diagram, database schema, API design, user flows | ⏳ Upcoming |
| **Phase 4** | Stage 4 — MVP Development | Functional application: auth, reporting flow, chatbot integration, staff notifications | ⏳ Upcoming |
| **Phase 5** | Stage 5 — Project Closure | Testing, bug fixes, final presentation, project retrospective | ⏳ Upcoming |

---

### Timeline

```
HAVEN — Project Timeline (April 27 → Mid-July 2025)

Week        1     2     3     4     5     6     7     8     9    10    11
            Apr27 May5  May12 May19 May26 Jun2  Jun9  Jun16 Jun23 Jun30 Jul7
            |     |     |     |     |     |     |     |     |     |     |

Stage 1     ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Stage 2     ░░░░░░██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Stage 3     ░░░░░░░░░░░░██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Stage 4     ░░░░░░░░░░░░░░░░░░░░░░████████████████████░░░░░░░░░░░░░░░░░░
Stage 5     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████████████████

Legend: ██ Active   ░░ Inactive
```

---

### Weekly Breakdown

| Weeks | Period | Focus |
|---|---|---|
| Week 1–2 | Apr 27 — May 11 | Team formation, brainstorming, MVP selection *(Stage 1)* |
| Week 3 | May 12 — May 18 | Project planning, scope definition, risk assessment *(Stage 2)* |
| Week 4–5 | May 19 — Jun 1 | Architecture design, database schema, API documentation *(Stage 3)* |
| Week 6–9 | Jun 2 — Jun 29 | MVP development: authentication, reporting flow, chatbot integration, staff interface *(Stage 4)* |
| Week 10–11 | Jun 30 — Jul 13 | Testing, bug fixes, final presentation preparation *(Stage 5)* |

---

> *This document reflects the team's planning as of Stage 2. Certain elements — particularly those related to the chatbot integration and stakeholder requirements — remain subject to revision pending confirmation from Thomas Spitz (Haven Lab). The team has attempted to make decisions based on the best available information and will update this document accordingly.*

---

*End of Stage 2 Report — Haven Project | Holberton School Cohort C28*
