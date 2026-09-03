# Product Requirements Document (PRD)

## AI-Enabled Adaptive Learning & Assessment Platform for India's Official Statistical System

| Field | Detail |
|---|---|
| Problem Statement ID | SIH26101 |
| Category | Software |
| Organization / Ministry | Ministry of Statistics and Programme Implementation (MoSPI) |
| Hackathon | Smart India Hackathon (SIH) 2026 |
| Document Owner | Product/Engineering Team |
| Version | 1.0 |
| Status | Draft |

---

## 1. Executive Summary

The Ministry of Statistics and Programme Implementation (MoSPI) requires a scalable, AI-driven platform to diagnose skill gaps among statistical officers and administrative personnel, deliver personalized learning pathways aligned with the **iGOT Karmayogi** ecosystem, and automatically generate high-quality assessments (MCQs, scenario-based quizzes, case studies) from official statistical documents using NLP/LLM techniques.

This platform will replace static, one-size-fits-all training with a continuous, adaptive capacity-building system — improving competency visibility, reducing manual content-creation overhead, and providing institutional-level readiness analytics to decision-makers.

---

## 2. Problem Statement

### 2.1 Background
India's Official Statistical System spans multiple administrative tiers (central, state, district) and involves personnel who must continuously stay current with evolving statistical methodologies, survey management workflows, and data science tooling. Existing training mechanisms are largely static, manually administered, and disconnected from individual proficiency levels.

### 2.2 Core Challenges

| # | Challenge | Impact |
|---|---|---|
| 1 | **Competency Mismatches** — no automated diagnostic exists to baseline individual skills against evolving methods/tools | Officers may be under- or over-trained; skill gaps go undetected until they affect survey/data quality |
| 2 | **Generic vs. Personalized Training** — static programs don't adapt to proficiency or role | Low training ROI, disengagement, redundant learning for already-proficient staff |
| 3 | **Assessment Generation Overhead** — manual creation of MCQs/case studies from dense official documents is slow and resource-intensive | Bottleneck in scaling training; inconsistent assessment quality and difficulty calibration |

### 2.3 Opportunity
An AI/NLP-powered platform can automate diagnostic testing, personalize course recommendations via integration with iGOT Karmayogi, auto-generate assessments from source documents using RAG pipelines, and provide real-time analytics — directly addressing all three challenges at scale across a geographically distributed workforce.

---

## 3. Goals & Objectives

### 3.1 Primary Goals
1. Build an automated **competency diagnostic engine** that maps individual/role-based proficiency against target competency frameworks.
2. Deliver **personalized learning pathways** by recommending iGOT Karmayogi courses based on identified gaps.
3. Automate **assessment generation** (MCQs, scenario-based quizzes, case studies with answer keys and difficulty ratings) from official statistical reference material using an LLM/RAG pipeline.
4. Provide **real-time analytics dashboards** for individuals, supervisors, and institutional administrators.

### 3.2 Success Metrics (KPIs)

| Metric | Target (Post-Pilot, 6 months) |
|---|---|
| Officers onboarded with a completed diagnostic assessment | ≥ 70% of pilot cohort |
| Reduction in manual assessment-authoring time | ≥ 60% reduction vs. baseline |
| Course completion rate (personalized vs. generic, A/B) | ≥ 25% relative improvement |
| Skill-gap closure rate (re-assessment score delta) | ≥ 15-point average improvement |
| Auto-generated question quality (SME-approved without edits) | ≥ 75% acceptance rate |
| Dashboard adoption by institutional admins | ≥ 80% monthly active usage |
| Platform uptime | ≥ 99.5% |

---

## 4. Target Users & Personas

| Persona | Description | Key Needs |
|---|---|---|
| **Statistical Officer (End Learner)** | Field/HQ officers across tiers (Junior Statistical Officer to Senior Statistician) | Quick diagnostic, relevant course suggestions, mobile-friendly bilingual UI, clear progress tracking |
| **Departmental Training Coordinator** | Manages training rollout for a division/state unit | Bulk assessment creation from internal documents, cohort progress visibility, reporting |
| **Subject Matter Expert (SME) / Content Reviewer** | Validates AI-generated assessments before publishing | Efficient review/edit interface, confidence scores on generated content, source traceability |
| **Institutional Administrator (MoSPI HQ)** | Oversees national readiness and capacity metrics | Aggregate dashboards, competency heatmaps by region/role, iGOT integration status |
| **System Administrator** | Manages platform, integrations, and security | RBAC controls, audit logs, integration health monitoring |

---

## 5. Scope

### 5.1 In Scope (MVP + Near-Term)
- Diagnostic assessment engine with adaptive question difficulty (CAT-style or rule-based adaptive logic)
- Competency framework mapping (role × skill matrix)
- RAG-based document ingestion pipeline for MCQ/case-study generation
- SME review-and-approve workflow for AI-generated content
- Course recommendation engine mapped to iGOT Karmayogi course catalog (via API/manual catalog sync)
- Learner, coordinator, and admin dashboards
- Bilingual (English + Hindi, extensible to regional languages) responsive UI
- Role-based access control and basic audit logging

### 5.2 Out of Scope (MVP)
- Full replacement of iGOT Karmayogi's LMS/content-hosting infrastructure (this platform integrates with, not replaces, iGOT)
- Native mobile apps (responsive web only in MVP; native app is a future phase)
- Automated grading of free-text/essay answers beyond basic NLP similarity scoring (stretch goal)
- Multi-language support beyond English/Hindi in MVP (architecture should allow extension)
- Offline-first functionality (may be considered in later phases for low-connectivity field offices)

---

## 6. Functional Requirements

### 6.1 Competency Gap Identification
- **FR-1.1**: System shall maintain a configurable **competency framework** (skills × proficiency levels × roles) editable by admins.
- **FR-1.2**: System shall administer **diagnostic assessments** that adapt question difficulty based on real-time learner responses (adaptive branching or IRT-lite logic).
- **FR-1.3**: System shall compute a **proficiency score per competency area** and compare it against role-based target thresholds.
- **FR-1.4**: System shall visually represent gaps via a **skill-gap heatmap** per individual and aggregated per role/department.
- **FR-1.5**: System shall support periodic re-assessment to track proficiency drift/improvement over time.

### 6.2 Personalized Course Recommendation
- **FR-2.1**: System shall integrate with the **iGOT Karmayogi course catalog** (via API where available, or a periodically synced course metadata store) to retrieve available courses.
- **FR-2.2**: System shall generate a **ranked list of recommended courses** per learner based on identified skill gaps, role requirements, and (optionally) past learning behavior.
- **FR-2.3**: System shall allow learners to accept, defer, or provide feedback on recommendations, feeding back into the recommendation model.
- **FR-2.4**: System shall support **manual override** by training coordinators to assign/mandate specific courses regardless of algorithmic recommendation.
- **FR-2.5**: System shall track course enrollment/completion status (via iGOT integration or manual entry) to close the feedback loop with re-assessment.

### 6.3 Automated Quiz & Assessment Generation (NLP/LLM)
- **FR-3.1**: System shall allow authorized users to **upload reference documents** (PDF/DOCX) — manuals, guidelines, survey handbooks.
- **FR-3.2**: System shall **chunk, embed, and index** documents into a vector database for retrieval-augmented context.
- **FR-3.3**: System shall use an LLM to **generate structured assessment items**: MCQs (with distractors), scenario-based questions, and case studies.
- **FR-3.4**: Each generated item shall include an **explanatory answer key**, a **difficulty rating** (e.g., Easy/Medium/Hard, calibrated via heuristic or historical response data), and a **traceable source citation** (document + section).
- **FR-3.5**: System shall route AI-generated content through an **SME review queue** before publishing to learners (human-in-the-loop).
- **FR-3.6**: System shall flag low-confidence or potentially hallucinated content (e.g., no strong source grounding) for mandatory review.
- **FR-3.7**: System shall support **regeneration/edit** of individual questions without reprocessing the entire document.
- **FR-3.8**: System shall support tagging generated questions to specific competency areas for use in diagnostics.

### 6.4 Progress Tracking & Analytics
- **FR-4.1**: System shall provide a **learner dashboard**: assessment history, scores, skill-gap trend, recommended/enrolled courses.
- **FR-4.2**: System shall provide a **coordinator dashboard**: cohort completion rates, score distributions, at-risk learner flags.
- **FR-4.3**: System shall provide an **institutional dashboard** (MoSPI HQ level): national/state/department readiness scores, competency heatmaps, training ROI indicators.
- **FR-4.4**: System shall support **exportable reports** (PDF/Excel/CSV) for institutional reporting cycles.
- **FR-4.5**: Dashboards shall update in **real time or near-real time** (sub-5-minute latency acceptable) as assessments/courses are completed.
- **FR-4.6**: System shall support drill-down filtering by region, department, role, and time period.

### 6.5 Platform / Cross-Cutting
- **FR-5.1**: Role-based access control (Learner, Coordinator, SME/Reviewer, Institutional Admin, System Admin).
- **FR-5.2**: Bilingual UI (English/Hindi) with i18n architecture for future language additions.
- **FR-5.3**: Responsive design supporting desktop, tablet, and mobile browsers.
- **FR-5.4**: Audit logging of content generation, review actions, and assessment attempts.
- **FR-5.5**: Notification system (in-app/email) for new recommendations, pending reviews, and assessment reminders.

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Diagnostic assessment page loads < 2s; dashboard queries < 3s for aggregates up to 100K users |
| **Scalability** | Support 50,000+ concurrent registered users (national rollout scale); horizontally scalable backend and vector store |
| **Availability** | ≥ 99.5% uptime SLA for production |
| **Security** | Compliance with Government of India data security guidelines (e.g., MeitY guidelines); encryption at rest and in transit (TLS 1.2+, AES-256); secure API gateway |
| **Data Privacy** | PII handling per applicable government data protection norms; role-based data visibility; anonymized/aggregated analytics at institutional level |
| **Accessibility** | WCAG 2.1 AA compliance for UI components |
| **Auditability** | Immutable audit trail for AI-generated content approvals and score computations |
| **Interoperability** | RESTful APIs for iGOT Karmayogi integration; support SCORM/xAPI where applicable for course tracking |
| **Maintainability** | Modular microservice-friendly architecture; documented API contracts |
| **Localization** | i18n-ready front end; content pipeline supports bilingual assessment generation |

---

## 8. Proposed System Architecture

### 8.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Next.js)                  │
│   Learner Portal | Coordinator Console | Admin Dashboard | SME UI │
└───────────────────────────────┬───────────────────────────────────┘
                                 │ REST/GraphQL API (HTTPS)
┌───────────────────────────────▼───────────────────────────────────┐
│                     Backend API Layer (FastAPI/Django)             │
│  Auth & RBAC | Assessment Engine | Recommendation Service          │
│  Document Ingestion Service | Analytics Service | Notification Svc │
└───────┬───────────────┬────────────────┬───────────────┬──────────┘
        │               │                │               │
┌───────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐ ┌─────▼─────────┐
│ PostgreSQL   │ │ Redis Cache  │ │ Vector DB    │ │ iGOT Karmayogi │
│ (users,      │ │ (sessions,   │ │ (ChromaDB/   │ │ Integration    │
│ competencies,│ │ rate limits) │ │ FAISS/Milvus)│ │ (Course API)   │
│ scores)      │ │              │ │              │ │                │
└──────────────┘ └──────────────┘ └──────┬───────┘ └────────────────┘
                                          │
                                 ┌────────▼─────────┐
                                 │  RAG / LLM Layer  │
                                 │ LangChain/LlamaIdx │
                                 │ + LLM (API/OSS)    │
                                 └────────────────────┘
```

### 8.2 Component Breakdown

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React / Next.js, Tailwind CSS | Accessible, bilingual, responsive UI for all personas |
| Backend | Python (FastAPI or Django) / Node.js | Business logic, API orchestration, auth |
| AI/NLP Pipeline | LangChain / LlamaIndex (RAG) | Document parsing, chunking, retrieval-augmented generation |
| Vector Database | ChromaDB / FAISS / Milvus | Semantic indexing of statistical guidelines/manuals |
| LLM | Open-source (e.g., Llama-family) or API-driven (e.g., Claude/GPT via API) | MCQ generation, semantic gap analysis, answer explanation generation |
| Relational DB | PostgreSQL | User profiles, competency framework, scores, course metadata |
| Cache/Session | Redis | Session state, rate limiting, caching frequent queries |
| Integration | REST API / SCORM-xAPI adapters | iGOT Karmayogi course catalog & completion sync |
| Infra | Containerized (Docker/Kubernetes), CI/CD pipeline | Scalable, government-cloud (e.g., MeghRaj/NIC) deployable |

### 8.3 Data Flow (Assessment Generation Example)
1. Coordinator/Admin uploads a reference document (PDF/DOCX).
2. Document Ingestion Service extracts text, chunks it, and generates embeddings.
3. Embeddings stored in vector DB with metadata (source, section, page).
4. On generation request, RAG pipeline retrieves relevant chunks and prompts the LLM to produce MCQs/case studies with citations.
5. Generated items are stored in a "pending review" state in PostgreSQL.
6. SME reviews, edits, approves, or rejects items via the review UI.
7. Approved items enter the **question bank**, tagged to competency areas, and become available for diagnostic/assessment delivery.

### 8.4 Data Flow (Diagnostic → Recommendation Example)
1. Learner takes adaptive diagnostic assessment drawn from the tagged question bank.
2. Scoring engine computes per-competency proficiency and compares against role-based targets.
3. Gap analysis output feeds the Recommendation Service.
4. Recommendation Service queries iGOT Karmayogi catalog metadata (cached in PostgreSQL) and ranks courses against identified gaps.
5. Learner dashboard displays ranked recommendations; enrollment/completion status synced back via iGOT integration.
6. Post-course re-assessment updates the competency profile, closing the loop.

---

## 9. Integration Requirements

| System | Integration Type | Notes |
|---|---|---|
| **iGOT Karmayogi** | REST API (preferred) or periodic catalog export/import | Course metadata sync, enrollment triggers, completion status pull |
| **Government SSO / Digital Identity** (if applicable) | SAML/OAuth2 | Single sign-on for officers using existing government credentials |
| **Email/SMS Gateway** | API | Notifications and reminders |
| **Document Repositories** (departmental manuals) | Manual upload / bulk import (MVP); connector-based sync (future) | Source material for assessment generation |

---

## 10. User Flows (Summary)

### 10.1 Learner Flow
Login → Take Diagnostic Assessment → View Skill-Gap Report → Receive Course Recommendations → Enroll (redirected to/synced with iGOT) → Complete Course → Re-assess → Updated Progress Dashboard

### 10.2 Coordinator Flow
Login → Upload Reference Document → Trigger Assessment Generation → Review Generation Status → View Cohort Dashboard → Assign/Override Recommendations → Export Reports

### 10.3 SME/Reviewer Flow
Login → View Pending Review Queue → Review Generated Question (with source citation) → Edit/Approve/Reject → Publish to Question Bank

### 10.4 Institutional Admin Flow
Login → View National/State Readiness Dashboard → Drill Down by Region/Role → Export Institutional Report → Configure Competency Framework

---

## 11. Assumptions & Constraints

- iGOT Karmayogi exposes (or will expose) an API or structured data feed for course catalog and completion status; if not available at hackathon stage, a mock/sample dataset will be used to simulate integration.
- Reference documents provided for assessment generation are primarily text-based (scanned/OCR-heavy documents may require additional preprocessing, considered a stretch goal).
- LLM usage must account for **data sensitivity** — if using an external API-driven LLM, sensitive government documents may need to be processed via approved/on-premise or sovereign-cloud-hosted models depending on classification.
- Hackathon prototype will demonstrate core flows end-to-end with a limited dataset; full-scale national rollout considerations (load, multi-tenancy across states) are addressed at an architectural level but not fully load-tested in the prototype.

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM hallucination in generated questions/answers | Medium | High | Mandatory SME review-and-approve workflow; source-citation grounding; confidence flagging |
| iGOT Karmayogi API unavailability/limited access | Medium | Medium | Build with an abstraction layer; fallback to manual catalog sync/mock data |
| Low learner adoption of diagnostic assessments | Medium | High | Gamification, clear value communication, integration into mandatory training cycles |
| Data sensitivity of official statistical documents | Medium | High | On-premise/sovereign model hosting option; strict access controls; document classification checks before ingestion |
| Bilingual content generation quality (Hindi) | Medium | Medium | Use multilingual-capable LLMs; SME review specifically for regional-language accuracy |
| Scalability at national rollout | Low (at hackathon stage) | High | Microservice architecture, horizontal scaling, load-testing roadmap post-MVP |

---

## 13. Milestones (Indicative Hackathon-to-Pilot Roadmap)

| Phase | Deliverable |
|---|---|
| Phase 1 (Hackathon Prototype) | Core diagnostic engine, basic RAG-based MCQ generation, SME review UI, learner/coordinator dashboards (demo dataset) |
| Phase 2 (Pilot) | iGOT Karmayogi live integration, expanded competency framework, real document ingestion at scale, institutional dashboard |
| Phase 3 (Scale-Up) | Multi-language expansion, mobile app, advanced adaptive testing (IRT-based), analytics-driven recommendation refinement |

---

## 14. Appendix

### 14.1 Glossary
- **RAG**: Retrieval-Augmented Generation — combining vector-based document retrieval with LLM generation for grounded outputs.
- **iGOT Karmayogi**: Government of India's integrated online training platform for capacity building of civil servants.
- **MCQ**: Multiple Choice Question.
- **SME**: Subject Matter Expert.
- **RBAC**: Role-Based Access Control.

### 14.2 Recommended Tech Stack (as specified)
- **Frontend**: React / Next.js, Tailwind CSS
- **Backend**: Python (FastAPI / Django) or Node.js
- **AI/NLP**: LangChain / LlamaIndex (RAG), ChromaDB / FAISS / Milvus, open-source or API-driven LLM
- **Database**: PostgreSQL (relational), Redis (cache/session)

