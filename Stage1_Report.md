# HAVEN  Stage 1 Report
### Project Portfolio | Holberton School  Cohort C28

**Team:** Ainy Ourzik · Benjamin Bommier · Cyril Iglesias
**Academic Year:** 2025–2026

---

## Table of Contents

1. [Team Formation Overview](#1-team-formation-overview)
   - 1.1 [Team Members & Technical Roles](#11-team-members--technical-roles)
   - 1.2 [Project Manager](#12-project-manager)
   - 1.3 [Collaboration Strategy](#13-collaboration-strategy)
   - 1.4 [Stakeholders](#14-stakeholders)
2. [Ideas Explored](#2-ideas-explored)
   - 2.1 [Idea 1  InternLink (Rejected)](#21-idea-1--internlink-rejected)
   - 2.2 [Idea 2  Haven (Selected)](#22-idea-2--haven-selected)
3. [Selected MVP Concept](#3-selected-mvp-concept)
   - 3.1 [Project Summary](#31-project-summary)
   - 3.2 [Reasons for Selection](#32-reasons-for-selection)
   - 3.3 [Potential Challenges & Opportunities](#33-potential-challenges--opportunities)

---

## 1. Team Formation Overview

### 1.1 Team Members & Technical Roles

Our team consists of three students from Holberton School Cohort C28, each contributing fullstack development skills across both frontend and backend layers of the application. Role assignments reflect both technical versatility and individual interest areas.

| Name | Technical Role | Focus Area | Rationale |
|---|---|---|---|
| Ainy Ourzik | Fullstack Developer | UI/UX & Frontend Lead | Strong design sensibility and frontend experience |
| Benjamin Bommier | Fullstack Developer | Backend & API Architecture | Solid backend fundamentals and system design interest |
| Cyril Iglesias | Fullstack Developer | Integration & DevOps | Experience with deployment pipelines and API integration |

### 1.2 Project Manager

A temporary **Project Manager** role has been designated within the team to coordinate Stage 1 deliverables, facilitate meetings, and ensure alignment across all workstreams. This role may rotate across subsequent stages to distribute leadership responsibilities equally among team members.

### 1.3 Collaboration Strategy

The team established the following communication and collaboration norms during the initial kickoff meeting:

- **Primary communication channel:** Discord (dedicated server with channels per topic)
- **Weekly synchronous check-ins** to review progress and blockers
- **Asynchronous updates** posted daily in a `#wrap-up` channel
- **Shared documentation** managed via Google Docs for accessibility and version control
- **Decision-making:** consensus-based; in case of disagreement, the PM holds a casting vote
- **Version control:** GitHub each team member works on a dedicated branch, merged into a shared `dev` branch, which is then merged into `main` upon validation.
### 1.4 Stakeholders

The Haven project is a tutored project proposed and supervised within the Holberton School framework. It was presented to the entire C28 cohort, and our team self-selected to take it on. The following stakeholders have been identified:

| Stakeholder | Type | Role | Impact |
|---|---|---|---|
| Holberton School | Internal / Academic | Project sponsor & evaluator | **High** — validates MVP scope and grades deliverables |
| L'Académie (National Education) | External / Institutional | Partner & end-user authority | **High** — provides domain requirements and deployment context |
| School Psychologists & Pedagogical Staff | End User / Operator | Receive and handle reports | **High** — must trust the system to act on alerts effectively |
| Haven Lab (havenlab.fr) | External / Technical | Vision holder & original project initiator | **Medium** — shapes product direction and branding |

---

## 2. Ideas Explored

Before committing to the Haven project, the team engaged in a structured brainstorming session to evaluate multiple possible directions. Two main concepts were considered and assessed against criteria including feasibility, social impact, technical complexity, and alignment with team skills.

### 2.1 Idea 1  InternLink (Rejected)

**Concept:** A LinkedIn-style web platform exclusively dedicated to free internship and work-study (*alternance*) listings, designed to reduce friction for job-seeking students.

**Key Features Envisioned:**
- Free posting of internship and alternance offers by companies
- Student profiles with skills, availability, and portfolio links
- Filter and search by sector, location, duration, and level
- Direct messaging between students and recruiters

**Reasons for Rejection:**
- **Market saturation:** existing platforms (LinkedIn, Indeed, HelloWork, Jobteaser) already dominate this space
- **Low differentiation:** the free-posting value proposition alone is insufficient to drive adoption
- **Sustainability challenges:** no clear monetization or long-term business model
- **Limited social impact:** addresses convenience, not a critical or urgent need
- **Regulatory complexity:** GDPR compliance for professional student profiles adds significant overhead

---

### 2.2 Idea 2  Haven (Selected)

**Concept:** A mobile-first platform enabling students across all educational levels to safely report bullying incidents, with AI-assisted intake and escalation to trained professionals.

This idea was proposed as a tutored project by Holberton School in partnership with Haven Lab and the French National Education system (l'Académie). The team chose to position on this project following its presentation to the full C28 cohort, motivated by its clear social value, well-defined scope, and institutional backing.

**Why Haven over InternLink:**
- Addresses a **critical and underserved social problem** — school bullying affects millions of students
- Institutional partnership with l'Académie provides a **real deployment context** and end-user base
- Clearer MVP scope with a defined user journey *(report → AI triage → professional alert)*
- Higher innovation potential through **AI-assisted chatbot** and anonymous reporting mechanisms
- Stronger alignment with the team's motivation to build something meaningful

---

## 3. Selected MVP Concept

### 3.1 Project Summary

Haven is a **mobile-first web application** designed to provide students (from middle school through university) with a safe, private, and accessible channel to report bullying situations they are experiencing or witnessing within their educational institution.

**Core MVP User Journey:**

1. The student creates a **private, secure account** on the platform
2. They initiate a **report** about a bullying incident (as victim or witness)
3. An **AI-powered conversational chatbot** guides them through the report, helping structure information and providing emotional support
4. Once submitted, a designated **psychologist or pedagogical staff member** at the institution is automatically notified
5. The professional reviews the report and initiates appropriate **follow-up**

The platform prioritizes anonymity options, data privacy, and a non-judgmental user experience tailored to the sensitivity of the subject matter. An optional extension to cover out-of-school bullying situations may be considered in future iterations.

The project is developed in collaboration with **Haven Lab** ([havenlab.fr](https://havenlab.fr)) and the **French National Education system (l'Académie)**, ensuring real-world relevance and eventual deployment potential.

---

### 3.2 Reasons for Selection

| Criterion | Assessment |
|---|---|
| **Feasibility** | Well-scoped MVP with defined user flows; institutional support reduces scope creep risks |
| **Social Impact** | Directly addresses school bullying, a documented and widespread issue in France and globally |
| **Innovation** | AI-driven chatbot for sensitive intake is a novel UX approach in this domain |
| **Institutional Alignment** | Partnership with l'Académie provides legitimacy, user access, and a real deployment pathway |
| **Team Motivation** | All team members expressed genuine interest in contributing to a project with tangible social value |
| **Technical Fit** | Requires fullstack skills (frontend UX, backend API, chatbot integration) well-matched to the team's profile |

---

### 3.3 Potential Challenges & Opportunities

| Challenges | Opportunities |
|---|---|
| Data privacy & RGPD compliance for minors' sensitive data | First-mover advantage in digital-first bullying reporting for French schools |
| Ensuring anonymity while enabling meaningful follow-up | Scalable to other institutions and potentially other countries |
| Designing a chatbot that is empathetic and appropriate for distressed users | AI-assisted triage opens the door to smart escalation and pattern detection |
| Gaining trust from students who may fear retaliation or disbelief | Partnership with l'Académie provides immediate credibility and access to real users |
| Managing scope to deliver a polished MVP within academic deadlines | Opportunity to contribute to student welfare policy through data insights |

---

*End of Stage 1 Report — Haven Project | Holberton School Cohort C28*
