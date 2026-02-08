# Automated Chaser Agent

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=meta&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)

### Intelligent Task Management & Automated Reminder System

*Eliminates manual follow-ups by sending AI-powered, personalized reminders — acting like a human program manager.*

[Live Demo](https://automatedchaseragent.vercel.app/) · [Documentation](DOCUMENTATION.md) 

---

</div>

## About

**Automated Chaser Agent** is a production-grade task management platform that automates the entire reminder lifecycle. From friendly nudges to urgent escalations, the system intelligently adapts its tone and timing based on deadline proximity, reminder history, and task priority.

Built with **Next.js 14**, **MongoDB Atlas**, and **LLaMA 3.3 70B** (via Groq API), it features multi-method authentication (Google OAuth + OTP + Email/Password), rule-based automation via Boltic webhooks, and a gamified leaderboard to drive team productivity.

> **Developer:** Jaykumar Girase
> **Built for:** Fynd SDE Intern Hiring Challenge 2026

---

## Key Features

### Core System
- **AI-Powered Reminders** — LLaMA 3.3 70B generates personalized, tone-appropriate messages via Groq API
- **Smart Tone Escalation** — Automatically escalates from Friendly → Firm → Urgent → Escalation based on context
- **Task Management** — Full CRUD with assignees, deadlines, priorities, categories, and status tracking
- **Multi-Auth** — Google OAuth, Email/Password, and OTP-based passwordless login
- **Real-time Search** — Debounced live search across tasks and assignees

### Automation & Integration
- **Custom Automation Rules** — Create rules like "If deadline is in 3 days, send AI reminder automatically"
- **Boltic Webhook Integration** — Scheduled cron jobs via Boltic platform for daily automation execution
- **Overdue Detection** — Automatic overdue marking + email notifications to task owner and assignee
- **Bulk Reminders** — Send AI-powered reminders to multiple tasks simultaneously

### Analytics & Gamification
- **Analytics Dashboard** — Completion trends, reminder effectiveness, priority distribution, AI adoption rate
- **Leaderboard** — Points system based on task completion, on-time rate, and reminder activity
- **Badges & Streaks** — Week Warrior, Monthly Master, On-Time Pro, AI Adopter, and more
- **PDF/CSV Export** — Export analytics data for reporting

### Architecture
- **Server Components** — Dashboard overview rendered on server for performance
- **Edge Middleware** — JWT/session validation at the edge for fast route protection
- **MongoDB Indexes** — Strategic indexes for sub-millisecond queries
- **Graceful Fallbacks** — AI failures fall back to template messages; Boltic failures are non-blocking

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack React with API routes, server components, middleware |
| **Language** | TypeScript 5 | Type safety across frontend and backend |
| **Database** | MongoDB Atlas + Mongoose | Document database with schema validation and ODM |
| **AI/LLM** | Groq API + LLaMA 3.3 70B | Ultra-fast AI-powered reminder message generation |
| **Auth** | NextAuth.js + JWT + OTP | Google OAuth, email/password, and passwordless login |
| **Email** | Nodemailer + Gmail SMTP | Professional HTML email templates with tone-based styling |
| **Automation** | Boltic Platform | Scheduled webhook triggers for cron-like automation |
| **UI Library** | ShadCN UI + Radix Primitives | 20+ accessible, customizable components |
| **Styling** | Tailwind CSS 3 | Utility-first CSS with custom design system |
| **Charts** | Recharts | Area, Bar, Pie, and Line charts for analytics |
| **Validation** | Zod + React Hook Form | Runtime type checking and form state management |
| **Deployment** | Vercel | Serverless deployment with edge functions |

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Groq API key ([console.groq.com](https://console.groq.com))
- Google Cloud OAuth credentials
- Gmail with App Password

### Installation

```bash
# Clone the repository
git clone https://github.com/jaykumar-girase/automated-chaser-agent.git
cd automated-chaser-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

Create `.env.local` in the project root:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chaser-agent

# Authentication
JWT_SECRET=your-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxx

# AI (Groq)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
BOLTIC_WEBHOOK_URL=https://flow.boltic.io/webhook/xxx
CRON_SECRET=your-cron-secret
```

See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed instructions on obtaining each key.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # 8 auth endpoints (login, register, OTP, Google)
│   │   ├── tasks/           # CRUD, remind, comments
│   │   ├── reminders/       # Bulk send, history logs
│   │   ├── rules/           # Automation rules CRUD
│   │   ├── analytics/       # Aggregated analytics data
│   │   ├── leaderboard/     # Gamification rankings
│   │   ├── ai/generate/     # AI message generation
│   │   ├── cron/            # Scheduled jobs (overdue check, automation)
│   │   └── webhooks/boltic/ # Inbound webhook handler
│   └── dashboard/           # 8 dashboard pages
├── components/
│   ├── ui/                  # 20+ ShadCN components
│   └── dashboard/           # Sidebar, Nav, TaskActions, Comments
├── lib/                     # Auth, DB, utils, validations
├── models/                  # Mongoose models (User, Task, ReminderLog, etc.)
├── services/                # AI, Email, Boltic integrations
└── middleware.ts            # Edge route protection
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/send-otp` | Send OTP email |
| `POST` | `/api/auth/verify-otp` | Verify OTP |
| `POST` | `/api/auth/otp-login` | Passwordless login |
| `POST` | `/api/auth/reset-password` | Reset password |
| `*` | `/api/auth/[...nextauth]` | Google OAuth handler |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List tasks (filterable) |
| `POST` | `/api/tasks` | Create task |
| `GET` | `/api/tasks/[id]` | Task details |
| `PATCH` | `/api/tasks/[id]` | Update task |
| `DELETE` | `/api/tasks/[id]` | Delete task |
| `POST` | `/api/tasks/[id]/remind` | Send AI reminder |
| `GET/POST` | `/api/tasks/[id]/comments` | Task comments |

### Automation & Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/rules` | Manage automation rules |
| `GET/PATCH/DELETE` | `/api/rules/[id]` | Single rule operations |
| `POST` | `/api/reminders/bulk` | Bulk AI reminders |
| `GET` | `/api/reminders/logs` | Reminder history |
| `GET` | `/api/analytics` | Analytics data |
| `GET` | `/api/leaderboard` | Gamification data |
| `POST` | `/api/ai/generate` | AI message generation |

### Webhooks & Cron
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/cron/check-overdue` | Mark overdue + notify |
| `GET/POST` | `/api/cron/run-automation` | Execute automation rules |
| `POST` | `/api/webhooks/boltic` | Boltic inbound webhook |

---

## How AI Reminders Work

```
Task Context (deadline, priority, reminder count)
        │
        ▼
  Determine Tone ──► friendly / firm / urgent / escalation
        │
        ▼
  Build Prompt ──► Detailed context + tone guidelines
        │
        ▼
  Groq API Call ──► LLaMA 3.3 70B (JSON response format)
        │
        ▼
  Parse Response ──► { subject, body }
        │
        ▼
  Generate HTML Email ──► Tone-colored template
        │
        ▼
  Send via Gmail SMTP ──► Nodemailer
        │
        ▼
  Log to DB ──► ReminderLog collection
```

**Tone Escalation Logic:**
- **Friendly**: First reminder, deadline is far
- **Firm**: 2+ reminders OR deadline ≤ 1 day
- **Urgent**: 4+ reminders sent
- **Escalation**: Task is overdue (deadline passed)

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

```bash
vercel --prod
```

### Configuration

The `vercel.json` sets:
- Mumbai region (`bom1`) for low latency in India
- 30-second function timeout for API routes

---

## Documentation

| Document | Description |
|---|---|
| [DOCUMENTATION.md](DOCUMENTATION.md) | Full technical documentation — architecture, database design, API reference, auth flows, AI integration |

---

## Author

**Jaykumar Girase** — Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jaykumar-girase-874210272/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/JaykumarGirase11)

---

<div align="center">

Built for **Fynd SDE Intern Hiring Challenge 2026**

</div>
