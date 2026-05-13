<div style="display: flex; justify-content: center; align-items: center; gap: 40px;">
  <img src="/Templates/logo_holberton.jpg" alt="Logo 1" style="width: 400px;">
  <img src="/Templates/logo_haven.png" alt="Logo 2" style="width: 400px;">
</div>

## Table of Contents

- [0. User Stories and Mockups](#0-user-stories-and-mockups)  
  - [0.1 User Stories](#01-user-stories)  
  - [0.2 Mockups (Main Screens)](#02-mockups-main-screens)  
- [1. Design System Architecture](#1-design-system-architecture)  
- [2. Components, Classes & Database Design (MVP)](#2-components-classes--database-design-mvp)  
  - [2.1 Front-end Components (React)](#21-front-end-components-react)  
  - [2.2 Back-end Classes ( à voir )](#22-back-end-classes-nodejs--express)  
  - [Backend Components Overview](#backend-components-overview)  
  - [Relational Database (MVP)](#relational-database-mvp)  
- [3. High-Level Sequence Diagrams (MVP)](#3-high-level-sequence-diagrams-mvp)  
  - [3.1 User Login (JWT)](#31-user-login-jwt)  
  - [3.2 Report Harassment](#32-Report-an-harassment)  
  - [3.3 Chatbot conversation](#33-Chatbot-conversation)  
- [4. API & Methods](#4-api--methods)  
  - [4.1 External APIs Used](#41-external-apis-used)  
  - [4.2 Internal API Endpoints (MVP)](#42-internal-api-endpoints-mvp)  
- [5. SCM & QA Strategy](#5-scm--qa-strategy)  
  - [5.1 Source Control Management (SCM)](#51-source-control-management-scm)  
  - [5.2 QA (Quality Assurance)](#52-qa-quality-assurance)  
  - [5.3 Deployment Pipeline](#53-deployment-pipeline)  
---

</p>

<p align="center">
  <img src="/Templates/logo_bun.png" alt="Bun.js" width="80" height="80"/>
  <img src="/Templates/logo_flutter.png" alt="Flutter" width="80" height="80"/>
  <img src="/Templates/logo_postgre.png" alt="PostgreSQL" width="80" height="80"/>
  <img src="/Templates/logo_prisma.jpg" alt="Prisma" width="80" height="80"/>
  <img src="Templates/logo_elysia.png" alt="ElysiaJS" width="80" height="80"/>
</p>

<p align="center">
  <b>Bun.js</b> • <b>Flutter</b> • <b>PostgreSQL</b> • <b>Prisma</b> • <b>ElysiaJS</b>
</p>

---

## 0. User stories and Mockups

### 0.1 User Stories

#### ➤ Must Have (MVP)
- As a **student**, I want to **register and log in** to have my own account and report safely
- As a **student**, I want to **choose my level of anonymity**, so I can report harassment safely
- As a **student**, I want to **report harassment**, as a victim or a witness
- As a **student**, I want to **chat with chatbot**, so I can explain safely what I experienced or saw
- As a **student**, I want to **find emergency numbers**, so I can find solutions to my problems
- As a **student**, I want to **see my previous reports**, so I can see the progress.

- As a **supervisor**, I want to **register and log in** to have my own account and manage the reports
- As a **supervisor**, I want to **see the dashbord** to manage safely all the reports
- As a **supervisor**, I want to **see the progress of reports** with color rating
- As a **supervisor**, I want to **manage my teams** to handle reports safely
- As a **supervisor**, I want to **have an access to the onitoring of the situations**
- As a **supervisor**, I want to **have statistical analysis**, to detect trends, clusters or predict risks.

- As a **parent**, I want to **see the progess of my child reports**
- As a **parent**, I want to **have the school phone number**, to cal them if I need informations.

#### ➤ Should Have (important but not critical for MVP)
- As a **student**, I want to **have a progress timeline**, to see my report progress
- As a **student**, I want to **delete my report** if I need/want to.

- As a **supervisor**, I want to **download closed reports** to archive them
- As a **supervisor**, I want to **filter reports** to quickly find what I want
- As a **supervisor**, I want to **see live notifications** in case of emergency reports.

#### ➤ Could Have (nice to have, next update)
- As a **student**, I want to **upload pictures or videos** to argue my report
- As a **student**, I want to **change color mode** so I can adapt the screen to my needs.

- As a **supervisor**, I want to **write team suggestion**, so I can handle situations safely
- As a **supervisor**, I want to **know probable peaks**, so I can schedule teams based on that.

#### ➤ Won't Have (what Haven don't do)
- As a **student**, I don't want **chatbot take decision for me**, it's too dangerous
- As a **student**, I don't want **to forget the emergency numbers**, if I'm in danger I have to use them

- As a **supervisor**, I don't want **to replace the pHARE protocol**, Haven is a complementary tool
- As a **supervisor**, I don't want to **make a medical diagnosis**, Haven is an alert tool.

---

### 0.2 Mockups (Main Screens)

We design simple wireframes for the MVP :
- **Home Page** → choose if you're student or admin.
- **Login/Register Page** → fields for email and password.
- **Main Page** → two options, report an harassment as victim or witness.
- **Report Page** → explain the situation with the chatbot.
- **Dashboard** → summary of all datas and reports.

[➤ Interactive Mockups](./Templates/HavenMockups.pdf)

---

## 1. Design System Architecture

<p align="center">
  <img src="/Templates/DesignSystemDiagram.png" alt="Flowchart Documentation Architecture" width="1200" />
</p>

What this diagram says ? 

- **Front-End (Flutter)**
The student web app and the Admin Dashboard communicate with the backend using HTTPS.

- **Backend API (Bun.js + ElysiaJS)**
This is the core of the application. It contains three main services : 
    - **Auth Service** → manages user login and authentification (JWT, passwords).
    - **Reports Management** → enter harassment reports and track the progress of the case.
    - **Chatbot Service** → retrieves the first reports and issues alerts based on the severity of the report.

- **DataBase (PostgreSQL via Prisma)**
Stores all persistent data (users, reports...).

---

**➤ Shortly :** 

The **student** writes a report → the **backend** processes it → data is stored in the **database** → from it **updates** can be made → it changes the datas in **database**.

**➤ Step-by-step :**
1. Student report (HTTPS) → Backend API
2. Backend Validates & routes → Auth/Report/Chatbot
3. Services read/write → PostgreSQL (via Prisma)
4. Supervisor updates report status (HTTPS) → Backend API
5. Services read/write → PostgreSQL (via Prisma) → Student and Supervisor see result.

---

## 2. Components, Classes, & Database Design (MVP)

### 2.1 Front-end Components (Flutter)

| Component / Page   | Type        | Purpose                                                                 |
|--------------------|-------------|-------------------------------------------------------------------------|
| `HomePage`         | Page        | Landing page choose if you're student or admin.                         |
| `LoginPage`        | Page        | User login with email and password.                                     |
| `MainPage`         | Page        | Shows two options, report an harassment as victim or witness.           |
| `ReportPage/:id`   | Page        | Shows a chatbot to explain the situation.                               |
| `RegisterPage`     | Page        | User registration (create account).                                     |
| `Dashboard`        | Page        | Shows a summary of all datas and reports.                               |
| `AdminDashboard`   | Page        | Protected area for staff.                                               |
| `Header`           | UI Component| Displays user's identity, access to the profile, and the logout button. |
| `EmergencyButton`  | UI Component| Quick access to emergency numbers.                                      |
| `PortalSelector`   | UI Component| Allows you to choose between the Student space and the Supervisor space.|
| `LoginForm`        | UI Component| Email and password entry form.                                          |
| `ActionCard`       | UI Component| Two push buttons for reports.                                           |
| `ChatWindow`       | UI Component| Main exchange area with the chatbot with `ChatBubble`.                  |
| `ReportStatusCard` | UI Component| Dashboard map summarizing the reports.                                  |
| `SeverityBadger`   | UI Component| Colored visual indicator of the severity of the situation.              |
| `TreatmentTimeline`| UI Component| timeline of the progress of handling the situation.                     |
| `AuthGuard`        | Utility     | Redirects user to login if not authenticated (JWT required).            |

---

**Interaction examples:**
- Clicking **Report as Victim** → send to the chatbot.  
- **Login/Register** → calls backend `/auth` API and stores JWT.  
- Cliking **Emergency** → Open the list of emergency numbers.

---

### 2.2 Back-end Classes (Bun.js + ElysiaJS)

We group backend logic into **services** and **tables**.

**Services** = contain the business logic.
**Tables** = store the database records.

For this part, I will do a simple example of illustration to make sure you will understand how the back end is working. I did something more illustrative and less technical which looks like a map of responsibilities. This diagram provides a simple representation of how my back end works.

I’ll give some clear explanations of this diagram right below, presented in a table.

<p align="center">
  <img src="/Templates/diagramclassBack.png" alt="Diagram Back end Classes" width="1200" />
</p>

### Backend Components Overview

| Component/Table           | Type                      | Role & Responsability                                                                                       |
|---------------------------|---------------------------|-------------------------------------------------------------------------------------------------------------|
| **Report Service**        | Service                   | Main orchestrator. Receives user reports, manages workflow status and coordinates with other services.      |
| **Chatbot Service**       | Service                   | Handles the automated conversation logic, guiding students through a safe reporting process step-by-step.   | 
| **Auth Service**          | Service                   | Manages user registration, password hashing, and issues secure JWT tokens to protect the application.       |
| **Stats Service**         | Service                   | Analyzes anonymized data to generate trends, clusters, and risk predictions for the supervisor dashboard.   |
| **Report Table**          | Database Table            | Stores global report details (ID, status, severity levels, anonymity preferences).                          |
| **Chat Messages Table**   | Database Table            | Logs the history of conversation bubbles between students and the chatbot.                                  | 
| **Users Table**           | Database Table            | Securely stores user credentials, profiles, and access roles (Student, Supervisor, Parent).                 |
| **Analytics Table**       | Database Table            | Stores aggregated metrics used by the Stats Service to render dashboard graphs.                             |

**➤ Shortly :**
- **Report Service** = manager, delagating tasks to `Chatbot`,`Auth` & `Stats`.
- **PostgreSQL Database** = filing cabinet of each assistant.

### Relational Database (MVP)

For the relational database we did a relational diagram on Mermaid. *Notice that it can change in the future with future implementations*. 

<p align="center">
  <img src="/Templates/ERdiagram.png" alt="Diagram Back end Classes" width="1200" />
</p>

Let us give you some explanations about this relational database. 

### 🔍 Database Relationships Overview

| Relationship | Type | Logic & Business Rules |
| :--- | :--- | :--- |
| **USER ➔ REPORT** | One-to-Many (`\|\|--o{`) | A user (student, parent, or supervisor) can create or manage **zero or more** reports. Conversely, a report must be linked to **one and only one** user for traceability purposes, even if the `is_anonymous` flag is enabled on the front-end. |
| **REPORT ➔ CHAT_MESSAGE** | One-to-Many (`\|\|--o{`) | A report contains its own discussion history made of **zero or more** chatbot messages. Each individual message is anchored to a single, specific report via the `report_id` foreign key. |
| **REPORT ➔ ANALYTICS_DATA** | Optional One-to-One (`\|\|--o\|`) | Each report can automatically generate **zero or one** analytics entry. This allows the Stats Service to detect risk trends or clusters without compromising the student's personal data or anonymity. |


**➤ Shortly :**

- User = who you are
- Report = the situation
- Chat Message = all messages about the situation
- Analytics Data = data about the reports for stats

---

