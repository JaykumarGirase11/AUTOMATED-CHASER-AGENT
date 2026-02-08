# Automated Chaser Agent — Full Technical Documentation

<div align="center">

**Version 1.0.0** | **Next.js 14 · MongoDB · Groq AI · Boltic**

*A production-grade automated task reminder system built for the Fynd SDE Intern Hiring Challenge 2026*

</div>

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack (Deep Dive)](#3-technology-stack-deep-dive)
4. [Project Structure](#4-project-structure)
5. [Environment Variables](#5-environment-variables)
6. [Database Design](#6-database-design)
7. [Authentication System](#7-authentication-system)
8. [API Reference](#8-api-reference)
9. [AI Integration (Groq + LLaMA)](#9-ai-integration-groq--llama)
10. [Email System](#10-email-system)
11. [Boltic Integration](#11-boltic-integration)
12. [Automation Engine](#12-automation-engine)
13. [Gamification System](#13-gamification-system)
14. [Frontend Architecture](#14-frontend-architecture)
15. [Middleware & Security](#15-middleware--security)
16. [Deployment](#16-deployment)
17. [Error Handling](#17-error-handling)
18. [Performance Optimizations](#18-performance-optimizations)

---

## 1. System Overview

### What is Automated Chaser Agent?

Automated Chaser Agent is an **intelligent task management and reminder system** that acts like a human program manager. It automatically sends personalized reminders to task assignees based on deadline proximity, escalation rules, and AI-generated messaging — eliminating the need for manual follow-ups.

### Core Problem Solved

In any team environment, tasks often get delayed because:
- Manual follow-ups are time-consuming
- Reminders are inconsistent or forgotten
- Escalation happens too late
- There's no visibility into reminder effectiveness

This system automates the entire chase cycle — from friendly nudges to urgent escalations — using AI to craft contextually appropriate messages.

### Key Capabilities

| Capability | How It Works |
|---|---|
| **AI-Powered Messages** | Uses LLaMA 3.3 70B via Groq API to generate personalized, tone-appropriate reminders |
| **Multi-Auth** | Supports Google OAuth, Email/Password, and OTP-based passwordless login |
| **Automation Rules** | Users create rules like "If deadline is in 3 days, send reminder automatically" |
| **Boltic Webhooks** | Boltic platform triggers cron endpoints for scheduled automation |
| **Analytics** | Charts, completion rates, AI adoption metrics, and trend analysis |
| **Gamification** | Points, badges, streaks, and leaderboard to encourage productivity |
| **Professional Emails** | HTML email templates with priority-based color coding |

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  Next.js 14 App Router  ·  React 18  ·  Tailwind CSS        │
│  ShadCN UI  ·  Recharts  ·  React Hook Form                 │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTP Requests
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS API LAYER                          │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Auth API │ │ Task API │ │ Rule API │ │ Cron API │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │             │            │             │              │
│  ┌────┴─────────────┴────────────┴─────────────┴───────┐    │
│  │              Middleware (JWT Validation)              │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────────┐
        ▼           ▼               ▼
┌──────────┐ ┌──────────┐   ┌──────────┐
│ MongoDB  │ │ Groq AI  │   │  Gmail   │
│ Atlas    │ │ (LLaMA)  │   │  SMTP    │
└──────────┘ └──────────┘   └──────────┘
                                 │
        ┌────────────────────────┘
        ▼
┌──────────────┐
│   Boltic     │──── Scheduled Webhooks ────► /api/cron/*
│   Platform   │
└──────────────┘
```

### Request Flow

1. **User Action** → Browser sends HTTP request to Next.js API route
2. **Middleware** → `middleware.ts` checks JWT/NextAuth cookies for authentication
3. **API Route** → Route handler validates input (Zod), processes business logic
4. **Database** → Mongoose models interact with MongoDB Atlas
5. **AI Service** → For reminders, Groq API generates personalized messages
6. **Email Service** → Nodemailer sends HTML emails via Gmail SMTP
7. **Boltic Trigger** → Webhook notifies Boltic for workflow tracking
8. **Response** → JSON response returned to client

---

## 3. Technology Stack (Deep Dive)

### Next.js 14 (App Router)

- **Why**: Full-stack React framework with built-in API routes, server components, and middleware
- **App Router**: Uses the `/app` directory for file-system based routing
- **Server Components**: Dashboard page renders on the server for better SEO and performance
- **API Routes**: All backend logic lives in `/app/api/*` as serverless functions
- **Middleware**: Edge middleware for authentication checks before route access

### MongoDB Atlas + Mongoose

- **Why MongoDB**: Flexible schema for tasks with varying fields, nested comments, and dynamic automation rules
- **Mongoose ODM**: Provides schema validation, middleware hooks (pre-save password hashing), and query building
- **Connection Pooling**: Uses a cached connection pattern (`global.mongoose`) to avoid multiple connections in serverless
- **Indexes**: Strategic indexes on `createdBy`, `status`, `deadline`, `assigneeEmail` for fast queries

### Groq API + LLaMA 3.3 70B

- **Why Groq**: Fastest LLM inference platform — sub-second response times
- **LLaMA 3.3 70B**: Open-source model by Meta, highly capable for text generation
- **Usage**: Generates personalized reminder messages based on context (recipient name, deadline, urgency, etc.)
- **Fallback**: If AI fails, system uses pre-written templates
- **JSON Mode**: Uses `response_format: { type: 'json_object' }` for structured output

### Nodemailer + Gmail SMTP

- **Why Nodemailer**: Most popular Node.js email library
- **Gmail SMTP**: Free, reliable email sending via Gmail App Passwords
- **HTML Templates**: Professional email templates with tone-based color coding
- **Sender**: Emails sent as `"Chaser Agent" <your-email@gmail.com>`

### Boltic Platform

- **What**: A no-code automation platform for scheduling webhooks
- **Integration**: Boltic calls our `/api/cron/*` endpoints on a schedule
- **Events**: Task created, updated, reminder triggered — all logged via webhook payloads
- **Security**: Protected by `x-cron-secret` header validation

### ShadCN UI + Radix Primitives

- **Why ShadCN**: Copy-paste component library — fully customizable, no dependency lock-in
- **Radix Primitives**: Accessible, unstyled components (Dialog, DropdownMenu, Tabs, etc.)
- **Components Used**: Button, Card, Badge, Avatar, Select, Tabs, Dialog, Switch, Progress, Toast, etc.

### Additional Libraries

| Library | Purpose |
|---|---|
| `bcryptjs` | Password hashing (salt rounds: 10) |
| `jsonwebtoken` | JWT token creation and verification |
| `zod` | Runtime schema validation for API inputs |
| `react-hook-form` | Form state management with validation |
| `@hookform/resolvers` | Connects Zod schemas to React Hook Form |
| `recharts` | Chart components (Area, Bar, Pie, Line) |
| `date-fns` | Date utility functions |
| `clsx` + `tailwind-merge` | Conditional CSS class merging |
| `class-variance-authority` | Component variant system |
| `lucide-react` | Icon library (200+ icons) |
| `jspdf` + `jspdf-autotable` | PDF export for analytics |
| `axios` | HTTP client for Boltic webhook calls |

---

## 4. Project Structure

```
automated-chaser-agent/
├── public/                          # Static assets
│   └── profile.jpg                  # Developer profile photo
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── globals.css              # Global CSS (Tailwind + utilities)
│   │   ├── layout.tsx               # Root layout (Inter font, Toaster, AuthProvider)
│   │   ├── page.tsx                 # Landing page (marketing)
│   │   ├── login/page.tsx           # Login page
│   │   ├── register/page.tsx        # Registration page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx           # Dashboard layout (Sidebar + Nav)
│   │   │   ├── page.tsx             # Dashboard overview (server component)
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx         # Task listing
│   │   │   │   ├── new/page.tsx     # Create new task
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx     # Task detail view
│   │   │   │       └── edit/page.tsx# Edit task
│   │   │   ├── reminders/page.tsx   # Send reminders
│   │   │   ├── history/page.tsx     # Reminder history
│   │   │   ├── analytics/page.tsx   # Analytics & charts
│   │   │   ├── automation/page.tsx  # Automation rules
│   │   │   ├── leaderboard/page.tsx # Gamification
│   │   │   └── settings/page.tsx    # User settings
│   │   └── api/
│   │       ├── auth/                # 8 auth endpoints
│   │       ├── tasks/               # Task CRUD + remind + comments
│   │       ├── reminders/           # Bulk send + logs
│   │       ├── rules/               # Automation rules CRUD
│   │       ├── analytics/           # Analytics aggregation
│   │       ├── leaderboard/         # Gamification data
│   │       ├── ai/generate/         # AI message generation
│   │       ├── cron/                # Scheduled jobs
│   │       │   ├── check-overdue/   # Mark overdue + notify
│   │       │   └── run-automation/  # Execute automation rules
│   │       └── webhooks/boltic/     # Boltic webhook handler
│   ├── components/
│   │   ├── ui/                      # 20+ ShadCN components
│   │   ├── dashboard/               # Dashboard-specific components
│   │   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   │   ├── DashboardNav.tsx     # Top navigation bar
│   │   │   ├── TaskActions.tsx      # Task action buttons
│   │   │   ├── CommentSection.tsx   # Task comments
│   │   │   └── AutomationRunner.tsx # Background automation
│   │   ├── landing/Navbar.tsx       # Landing page navbar
│   │   └── providers/AuthProvider.tsx # NextAuth provider
│   ├── lib/
│   │   ├── auth.ts                  # JWT utils + getAuthUser()
│   │   ├── authOptions.ts          # NextAuth configuration
│   │   ├── db.ts                    # MongoDB connection (cached)
│   │   ├── email.ts                 # Basic email sender
│   │   ├── utils.ts                 # Helper functions
│   │   └── validations.ts          # Zod schemas
│   ├── models/
│   │   ├── User.ts                  # User model
│   │   ├── Task.ts                  # Task model
│   │   ├── ReminderLog.ts          # Reminder log model
│   │   ├── AutomationRule.ts       # Automation rule model
│   │   ├── OTP.ts                   # OTP model
│   │   └── index.ts                 # Model exports
│   ├── services/
│   │   ├── ai.ts                    # Groq/LLaMA integration
│   │   ├── email.ts                 # Email templates + sending
│   │   └── boltic.ts               # Boltic webhook triggers
│   ├── types/
│   │   └── next-auth.d.ts          # NextAuth type augmentation
│   └── middleware.ts                # Route protection
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS plugins
├── next.config.js                   # Next.js configuration
├── vercel.json                      # Vercel deployment config
└── next-env.d.ts                    # Next.js type declarations
```

---

## 5. Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/chaser-agent` |
| `JWT_SECRET` | Yes | Secret key for JWT token signing (min 32 chars) | `a-very-long-random-secret-string-here` |
| `GROQ_API_KEY` | Yes | API key from console.groq.com | `gsk_xxxxxxxxxxxx` |
| `EMAIL_USER` | Yes | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASS` | Yes | Gmail App Password (not your login password) | `abcd efgh ijkl mnop` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID | `xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret | `GOCSPX-xxxxxxxxx` |
| `NEXTAUTH_URL` | Yes | Application URL for NextAuth | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth session encryption | `random-secret-string` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application URL | `http://localhost:3000` |
| `BOLTIC_WEBHOOK_URL` | No | Boltic workflow webhook URL | `https://flow.boltic.io/webhook/xxx` |
| `CRON_SECRET` | No | Secret header for cron endpoint protection | `my-cron-secret` |
| `WEBHOOK_SECRET` | No | Secret for Boltic webhook verification | `my-webhook-secret` |

### How to Get Each Key

**MongoDB URI:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Go to "Connect" → "Connect your application"
4. Copy the connection string and replace `<password>` with your DB password

**Groq API Key:**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Login
3. Go to "API Keys" → Create new key
4. Copy the key starting with `gsk_`

**Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to "App Passwords" → Generate for "Mail"
4. Copy the 16-character password

**Google OAuth Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web Application)
4. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret

---

## 6. Database Design

### User Model (`models/User.ts`)

```
User {
  _id:             ObjectId       (Auto-generated MongoDB ID)
  name:            String         (Required, 2-100 chars)
  email:           String         (Required, unique, lowercase)
  password:        String         (Optional — not needed for Google/OTP login)
  avatar:          String         (Profile image URL)
  emailVerified:   Boolean        (Default: false)
  googleId:        String         (Google OAuth ID, sparse index)
  authProvider:    Enum           ('email' | 'google')
  role:            Enum           ('admin' | 'manager' | 'member')
  settings: {
    preferredReminderTime: String
    timezone:        String       (Default: 'Asia/Kolkata')
    skipWeekends:    Boolean      (Default: false)
    digestMode:      Boolean      (Default: false)
    notificationChannels: {
      email:   Boolean            (Default: true)
      slack:   Boolean            (Default: false)
      push:    Boolean            (Default: true)
    }
    quietHoursStart: Number       (Default: 22 — 10 PM)
    quietHoursEnd:   Number       (Default: 8 — 8 AM)
  }
  stats: {
    tasksCompleted:  Number       (Default: 0)
    tasksOnTime:     Number       (Default: 0)
    avgResponseTime: Number       (Default: 0)
    badges:          [String]     (Array of badge IDs)
  }
  createdAt:       Date           (Auto)
  updatedAt:       Date           (Auto)
}

Hooks:
  - pre('save'): Hashes password with bcrypt (salt: 10)
Methods:
  - comparePassword(candidatePassword): Returns boolean
```

### Task Model (`models/Task.ts`)

```
Task {
  _id:                  ObjectId
  title:                String      (Required, max 100)
  description:          String      (Max 1000)
  assigneeName:         String      (Required)
  assigneeEmail:        String      (Required, lowercase)
  deadline:             Date        (Required)
  priority:             Enum        ('high' | 'medium' | 'low')
  status:               Enum        ('pending' | 'todo' | 'in-progress' | 'completed' | 'overdue')
  tags:                 [String]
  category:             String
  createdBy:            ObjectId    (Ref: User)
  reminderCount:        Number      (Default: 0)
  lastReminderSent:     Date
  nextReminderScheduled:Date
  completedAt:          Date
  comments: [{
    userId:    ObjectId   (Ref: User)
    userName:  String
    content:   String     (Max 500)
    mentions:  [String]
    createdAt: Date
  }]
  dependencies:         [ObjectId]  (Ref: Task)
  isDelayRisk:          Boolean     (Default: false)
  delayRiskScore:       Number      (0-100)
  createdAt:            Date
  updatedAt:            Date
}

Indexes:
  - { createdBy: 1, status: 1 }
  - { deadline: 1 }
  - { assigneeEmail: 1 }

Virtual:
  - isOverdue: Returns true if deadline < now and status != completed

Hooks:
  - pre('save'): Auto-sets status to 'overdue' if deadline has passed
```

### ReminderLog Model (`models/ReminderLog.ts`)

```
ReminderLog {
  _id:             ObjectId
  taskId:          ObjectId    (Ref: Task)
  taskTitle:       String
  recipientEmail:  String
  recipientName:   String
  channel:         Enum       ('email' | 'slack' | 'push')
  messageType:     Enum       ('scheduled' | 'manual' | 'escalation')
  tone:            Enum       ('friendly' | 'firm' | 'urgent' | 'escalation')
  subject:         String
  message:         String
  isAIGenerated:   Boolean
  status:          Enum       ('pending' | 'sent' | 'delivered' | 'failed' | 'bounced')
  errorMessage:    String
  sentAt:          Date
  deliveredAt:     Date
  openedAt:        Date
  respondedAt:     Date
  reminderNumber:  Number
  createdBy:       ObjectId   (Ref: User)
  createdAt:       Date
  updatedAt:       Date
}

Indexes:
  - { taskId: 1, createdAt: -1 }
  - { createdBy: 1, createdAt: -1 }
  - { status: 1, createdAt: -1 }
  - { recipientEmail: 1 }
```

### AutomationRule Model (`models/AutomationRule.ts`)

```
AutomationRule {
  _id:             ObjectId
  name:            String      (Required, max 100)
  description:     String      (Max 500)
  isActive:        Boolean     (Default: true)
  trigger: {
    type:          String      ('deadline_approaching' | 'task_overdue' | 'no_response' | 'reminder_count')
    conditions:    Object      (Dynamic — e.g., { days: 3 } or { count: 5 })
  }
  actions: [{
    type:          String      ('send_reminder' | 'mark_urgent' | 'send_escalation')
    params:        Object      (Dynamic action parameters)
  }]
  createdBy:       ObjectId    (Ref: User)
  executionCount:  Number      (Default: 0)
  lastExecutedAt:  Date
  createdAt:       Date
  updatedAt:       Date
}

Indexes:
  - { createdBy: 1, isActive: 1 }
```

### OTP Model (`models/OTP.ts`)

```
OTP {
  _id:       ObjectId
  email:     String      (Required, lowercase)
  otp:       String      (6-digit code)
  purpose:   Enum        ('registration' | 'login' | 'password-reset')
  expiresAt: Date        (TTL index — auto-deleted on expiry)
  verified:  Boolean     (Default: false)
  attempts:  Number      (Default: 0, max: 5)
  createdAt: Date
}

Indexes:
  - { email: 1, purpose: 1 }
  - { expiresAt: 1 } (TTL — MongoDB auto-deletes expired docs)
```

---

## 7. Authentication System

The application supports **three authentication methods**:

### Method 1: Email + Password

**Flow:**
1. User registers at `/api/auth/register` with name, email, password
2. Password is hashed with bcrypt (salt: 10) in the User model's pre-save hook
3. JWT token is created with `{ userId, email, name }` payload, signed with `JWT_SECRET`
4. Token is set as `auth_token` httpOnly cookie (7 days expiry)
5. On login, password is compared using `user.comparePassword()`

### Method 2: Google OAuth (NextAuth)

**Flow:**
1. User clicks "Sign in with Google" → redirected to Google OAuth consent
2. Google returns to `/api/auth/callback/google`
3. `authOptions.ts` → `signIn` callback:
   - Checks if user exists in MongoDB
   - If not, creates new user with `authProvider: 'google'`
   - If exists, links Google ID to existing account
4. `jwt` callback: Adds `userId` (MongoDB `_id`) to the JWT token
5. `session` callback: Makes user data available in `session.user`
6. Cookie: `next-auth.session-token` (or `__Secure-` prefix in production)

### Method 3: OTP-Based Passwordless Login

**Flow:**
1. User enters email → frontend calls `/api/auth/send-otp`
2. Server generates 6-digit OTP, saves to `OTP` model (10-min expiry)
3. OTP sent via email using professional HTML template
4. User enters OTP → frontend calls `/api/auth/otp-login`
5. Server verifies OTP (max 5 attempts), checks expiry
6. If valid:
   - If user exists → logs in
   - If new email → creates account automatically (username = email prefix)
7. JWT token set as `auth_token` cookie

### Unified Auth Check

`getAuthUser()` in `lib/auth.ts` checks both authentication methods:

1. First checks `auth_token` cookie (custom JWT for email/OTP login)
2. Then checks NextAuth session (for Google login)
3. Returns `{ userId, email, name }` or `null`

### Middleware Protection

`middleware.ts` runs on Edge Runtime:
- Protected routes (`/dashboard/*`): Redirects to `/login` if no valid session
- Auth routes (`/login`, `/register`): Redirects to `/dashboard` if already authenticated
- Checks three cookie names: `auth_token`, `next-auth.session-token`, `__Secure-next-auth.session-token`

---

## 8. API Reference

### Authentication APIs

#### POST `/api/auth/register`
Creates a new user account.
- **Body**: `{ name, email, password }`
- **Validation**: Zod `registerSchema` (name >= 2 chars, valid email, password >= 6 chars)
- **Response**: `{ success, user: { id, name, email } }`
- **Side Effect**: Sets `auth_token` cookie

#### POST `/api/auth/login`
Authenticates existing user.
- **Body**: `{ email, password }`
- **Validation**: Zod `loginSchema`
- **Response**: `{ success, user: { id, name, email } }`

#### POST `/api/auth/logout`
Clears authentication cookie.
- **Response**: `{ success, message }`
- **Side Effect**: Deletes `auth_token` cookie

#### GET `/api/auth/me`
Returns current authenticated user's profile.
- **Auth**: Required
- **Response**: `{ user: { id, name, email, role, settings, stats, createdAt } }`

#### POST `/api/auth/send-otp`
Sends OTP to email.
- **Body**: `{ email, purpose: 'registration' | 'login' | 'password-reset' }`
- **Response**: `{ success, message, expiresIn: 600, isNewUser }`

#### POST `/api/auth/verify-otp`
Verifies OTP without logging in.
- **Body**: `{ email, otp, purpose }`
- **Response**: `{ success, verified: true }`

#### POST `/api/auth/otp-login`
Verifies OTP and creates session.
- **Body**: `{ email, otp }`
- **Response**: `{ success, isNewUser, user }`
- **Side Effect**: Creates user if new, sets `auth_token` cookie

#### POST `/api/auth/reset-password`
Resets password after OTP verification.
- **Body**: `{ email, otp, newPassword }`
- **Response**: `{ success, message }`

### Task APIs

#### GET `/api/tasks`
Fetches all tasks for the authenticated user.
- **Auth**: Required
- **Query Params**: `status`, `priority`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ tasks: Task[] }`
- **Side Effect**: Auto-updates overdue tasks

#### POST `/api/tasks`
Creates a new task.
- **Auth**: Required
- **Body**: `{ title, description?, assigneeName, assigneeEmail, deadline, priority, status?, tags?, category? }`
- **Validation**: Zod `taskSchema`
- **Response**: `{ success, task }`
- **Side Effect**: Triggers Boltic `task_created` webhook

#### GET `/api/tasks/[id]`
Fetches a single task with computed fields.
- **Response**: `{ task: { ...task, daysRemaining } }`

#### PATCH `/api/tasks/[id]`
Updates a task (partial update).
- **Body**: Any subset of task fields
- **Side Effect**: Sets `completedAt` if status changes to 'completed'; triggers Boltic

#### DELETE `/api/tasks/[id]`
Deletes a task permanently.

#### POST `/api/tasks/[id]/remind`
Sends a manual reminder for a specific task.
- **Body**: `{ customMessage?, useAI?: true }`
- **Flow**:
  1. Determines tone based on reminder count and days remaining
  2. If `useAI: true`, generates AI message via Groq
  3. Builds HTML email template
  4. Sends email via Nodemailer
  5. Creates ReminderLog record
  6. Increments task's `reminderCount`
  7. Triggers Boltic `manual_nudge` webhook
- **Response**: `{ success, reminder: { id, status, isAIGenerated, tone, subject, sentAt } }`

#### GET/POST `/api/tasks/[id]/comments`
- **GET**: Fetches all comments for a task (sorted newest first)
- **POST**: Adds a comment `{ content, mentions? }`

### Reminder APIs

#### POST `/api/reminders/bulk`
Sends reminders for multiple tasks at once.
- **Body**: `{ taskIds: string[], customMessage?, useAI?: true }`
- **Response**: `{ success, summary: { total, sent, failed }, results[] }`

#### GET `/api/reminders/logs`
Fetches reminder history with filters.
- **Query Params**: `taskId`, `status`, `channel`, `startDate`, `endDate`, `page`, `limit`
- **Response**: `{ logs[], pagination: { page, limit, total, totalPages } }`

### Automation APIs

#### GET `/api/rules`
Lists all automation rules for the user.

#### POST `/api/rules`
Creates a new automation rule.
- **Body**: `{ name, description?, isActive, trigger: { type, conditions }, actions: [{ type, params }] }`

#### GET/PATCH/DELETE `/api/rules/[id]`
Get, update, or delete a specific rule.

### Analytics API

#### GET `/api/analytics`
Returns comprehensive analytics data.
- **Query Params**: `period` (`7days` | `30days` | `90days`)
- **Response**: Overview stats, tasks by status/priority, reminder stats, trends, most reminded tasks

### Leaderboard API

#### GET `/api/leaderboard`
Returns gamification leaderboard.
- **Query Params**: `timeframe` (`all` | `week` | `month`)
- **Response**: `{ leaderboard[], userStats }`
- **Points Formula**: `(completed * 10) + (onTime * 5) + (reminders * 2)`

### Cron APIs

#### GET/POST `/api/cron/check-overdue`
Finds and marks overdue tasks, sends notification emails.
- **Auth**: `x-cron-secret` header (if CRON_SECRET env var is set)
- **Actions**: Updates status to 'overdue', emails task owner + assignee

#### GET/POST `/api/cron/run-automation`
Executes all active automation rules.
- **Auth**: `x-cron-secret` header
- **Trigger Types**: `deadline_approaching`, `task_overdue`, `no_response`, `reminder_count`
- **Actions**: `send_reminder`, `mark_urgent`, `send_escalation`

### Webhook API

#### POST `/api/webhooks/boltic`
Receives webhook events from Boltic platform.
- **Auth**: `x-webhook-secret` header
- **Events**: `check_deadlines` (process all due reminders), `send_reminder` (specific task)

### AI API

#### POST `/api/ai/generate`
Generates AI-powered content.
- **Body**: `{ type: 'reminder' | 'nudge' | 'analyze-risk', ...context }`
- **Response**: Generated message or risk analysis

---

## 9. AI Integration (Groq + LLaMA)

### Overview

The AI system uses **Groq's inference API** with **Meta's LLaMA 3.3 70B Versatile** model to generate contextually appropriate reminder messages.

### How It Works

**File**: `services/ai.ts`

1. **Context Building**: Gathers recipient name, task details, deadline, urgency level, reminder count
2. **Tone Determination**: Uses `getReminderTone()` function:
   - `friendly`: First reminder, deadline far away
   - `firm`: 2+ reminders or deadline ≤ 1 day
   - `urgent`: 4+ reminders
   - `escalation`: Task is overdue
3. **Prompt Engineering**: Detailed system prompt with tone guidelines and output format
4. **API Call**: `groq.chat.completions.create()` with JSON response format
5. **Fallback**: If API fails, uses pre-written template messages

### Groq API Configuration

```typescript
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,  // Key from console.groq.com
})

const completion = await groq.chat.completions.create({
  messages: [{ role: 'user', content: prompt }],
  model: 'llama-3.3-70b-versatile',  // Meta's LLaMA 3.3 70B
  temperature: 0.7,                   // Creativity level (0-1)
  max_tokens: 500,                    // Max response length
  response_format: { type: 'json_object' },  // Forces JSON output
})
```

### AI Functions

| Function | Purpose | Model |
|---|---|---|
| `generateReminderMessage()` | Full reminder with subject + body | LLaMA 3.3 70B |
| `generateCustomNudge()` | Short, casual nudge message | LLaMA 3.1 70B |
| `analyzeDelayRisk()` | Risk scoring (no AI — rule-based) | N/A |

### Delay Risk Analysis

This function uses a rule-based approach (no AI):
- **History Risk** (0-30): Based on assignee's delay percentage
- **Time Risk** (5-30): Based on days until deadline
- **Complexity Risk** (0-25): Checks for keywords like "integration", "migration", "refactor"
- **Total Score**: Capped at 100

---

## 10. Email System

### Two Email Files

The project has two email-related files:

1. **`lib/email.ts`**: Basic email sender (used for OTP emails)
2. **`services/email.ts`**: Advanced email with HTML templates (used for task reminders)

### Email Template Structure

Professional HTML email with:
- **Header**: Gradient background color based on tone (blue/yellow/red)
- **Body**: Recipient greeting, custom message, task card with details
- **Task Card**: Shows title, priority badge, deadline, days remaining
- **CTA Button**: "View Task Details" link to the dashboard
- **Footer**: "Sent by Automated Chaser Agent" branding

### Tone-Based Styling

| Tone | Color | Usage |
|---|---|---|
| Friendly | Blue (#3b82f6) | First reminder, far from deadline |
| Firm | Yellow (#f59e0b) | 2-3 reminders, getting close |
| Urgent | Red (#ef4444) | 4+ reminders, very close |
| Escalation | Dark Red (#dc2626) | Overdue tasks |

---

## 11. Boltic Integration

### What is Boltic?

Boltic is a no-code automation platform that provides webhook-based scheduling. It replaces the need for server-side cron jobs.

### Integration Architecture

```
Boltic Scheduler (runs daily at 9 AM, 2 PM, 5 PM)
    │
    ├─── POST /api/cron/check-overdue
    │    (Marks overdue tasks, sends notifications)
    │
    └─── POST /api/cron/run-automation
         (Executes user-defined automation rules)
```

### Outbound Webhooks

The app also sends events TO Boltic when:
- Task is created (`notifyTaskCreated`)
- Task is updated (`notifyTaskUpdated`)
- Manual reminder is sent (`triggerManualNudge`)
- Scheduled reminder is triggered (`reminder_triggered`)

### Security

- Inbound: Validated via `x-cron-secret` or `x-webhook-secret` headers
- Outbound: Sent to `BOLTIC_WEBHOOK_URL` with 10-second timeout

---

## 12. Automation Engine

### How Rules Work

Users create rules with a **trigger** and one or more **actions**.

### Trigger Types

| Trigger | Description | Conditions |
|---|---|---|
| `deadline_approaching` | Deadline is within X days | `{ days: 3 }` |
| `task_overdue` | Task has passed its deadline | None |
| `no_response` | No activity after reminder | `{ days: 2 }` |
| `reminder_count` | X or more reminders sent | `{ count: 5 }` |

### Action Types

| Action | Description |
|---|---|
| `send_reminder` | Generates AI message and sends email |
| `mark_urgent` | Changes task priority to 'high' |
| `send_escalation` | Sends escalation email to task owner |

### Execution Flow

1. Boltic triggers `/api/cron/run-automation`
2. Fetches all active rules (`AutomationRule.find({ isActive: true })`)
3. For each rule, queries tasks matching the trigger conditions
4. Executes actions for each matching task
5. Logs results and returns summary

---

## 13. Gamification System

### Points System

| Action | Points |
|---|---|
| Complete a task | 10 |
| On-time completion bonus | 5 |
| Send a reminder | 2 |

**Formula**: `points = (completedTasks × 10) + (onTimeTasks × 5) + (remindersSent × 2)`

### Badges

| Badge ID | Name | Criteria |
|---|---|---|
| `first_task` | First Task | Complete 1 task |
| `task_beginner` | Task Beginner | Complete 10 tasks |
| `task_pro` | Task Pro | Complete 50 tasks |
| `task_master` | Task Master | Complete 100 tasks |
| `streak_7` | Week Warrior | 7-day completion streak |
| `streak_30` | Monthly Master | 30-day completion streak |
| `on_time_pro` | On-Time Pro | 90% on-time rate |
| `reminder_pro` | Reminder Pro | Send 50 reminders |
| `reminder_guru` | Reminder Guru | Send 100 reminders |
| `ai_adopter` | AI Adopter | Use AI for 50 reminders |

### Streak Calculation

Counts consecutive days (backwards from today) where the user completed at least one task. Checks up to 365 days.

### Leaderboard

- All users ranked by points
- Filterable by timeframe: All Time, This Week, This Month
- Current user highlighted in the leaderboard

---

## 14. Frontend Architecture

### Rendering Strategy

| Page | Type | Why |
|---|---|---|
| Landing (`/`) | Static | Marketing page, no dynamic data |
| Login/Register | Static | Forms, client-side only |
| Dashboard Overview | **Server Component** | Fetches data on server, better performance |
| Tasks, Reminders, etc. | Client Component | Interactive features (filters, modals, etc.) |

### Component Library (ShadCN UI)

20+ components in `components/ui/`:
- `button.tsx` — Variants: default, destructive, outline, secondary, ghost, link
- `card.tsx` — CardHeader, CardTitle, CardDescription, CardContent
- `badge.tsx` — Variants: default, secondary, destructive, outline, success, info, warning
- `dialog.tsx` — Modal dialogs
- `dropdown-menu.tsx` — Context menus
- `select.tsx` — Custom select dropdowns
- `tabs.tsx` — Tab navigation
- `toast.tsx` + `toaster.tsx` — Toast notifications
- `input.tsx`, `textarea.tsx`, `label.tsx` — Form elements
- `avatar.tsx` — User avatars
- `progress.tsx` — Progress bars
- `skeleton.tsx` — Loading skeletons
- `switch.tsx` — Toggle switches
- `separator.tsx` — Visual separators
- `checkbox.tsx` — Checkboxes

### Dashboard Layout

- **Sidebar** (`Sidebar.tsx`): Collapsible navigation with 8 menu items, tooltip on collapsed mode, pro-tip card at bottom
- **Navbar** (`DashboardNav.tsx`): Search bar with live results, notification dropdown, user menu, "New Task" button
- **Layout** (`dashboard/layout.tsx`): Wraps sidebar + nav + page content with gradient background

### Styling System

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: HSL color system for theme consistency
- **Custom Utilities**: `glass`, `gradient-bg`, `gradient-text`, `shadow-premium`, `card-gradient-top`, `sidebar-active`
- **Animations**: `page-enter`, `slideUp`, `fadeIn`, `smoothReveal`, `stagger` (children animation delays)
- **Font**: Inter (via Next.js `next/font/google`)

---

## 15. Middleware & Security

### Route Protection (`middleware.ts`)

```
Protected Routes: /dashboard/*
Auth Routes: /login, /register (redirect to dashboard if logged in)

Matcher excludes: /api/*, /_next/static, /_next/image, favicon.ico
```

### Security Measures

| Measure | Implementation |
|---|---|
| Password Hashing | bcrypt with 10 salt rounds |
| JWT Tokens | Signed with HMAC-SHA256, 7-day expiry |
| HTTP-Only Cookies | Cannot be accessed via JavaScript |
| Secure Cookies | HTTPS-only in production |
| SameSite Cookies | Lax — prevents CSRF |
| Input Validation | Zod schemas on all API inputs |
| OTP Rate Limiting | Max 5 attempts, 10-min expiry |
| Cron Auth | `x-cron-secret` header validation |
| Webhook Auth | `x-webhook-secret` header validation |

---

## 16. Deployment

### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["bom1"],          // Mumbai region (closest to India)
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30          // 30-second timeout for API routes
    }
  }
}
```

### Deploy Steps

1. Push to GitHub
2. Import in Vercel → select repo
3. Add all environment variables
4. Deploy

### Post-Deployment

- Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel domain
- Update Google OAuth redirect URI to `https://your-domain.vercel.app/api/auth/callback/google`
- Configure Boltic webhooks to point to production URLs

---

## 17. Error Handling

### API Error Pattern

Every API route follows this pattern:
```
try {
  // Auth check
  // Input validation (Zod)
  // Business logic
  // Return success response
} catch (error) {
  console.error('[Context] Error:', error)
  return NextResponse.json({ error: 'User-friendly message' }, { status: 500 })
}
```

### Error Status Codes

| Code | Meaning |
|---|---|
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (not logged in) |
| 404 | Not Found |
| 500 | Internal Server Error |

### AI Fallback

If Groq API fails (rate limit, timeout, etc.), the system gracefully falls back to pre-written template messages. The user still receives a reminder — just not AI-generated.

### Boltic Non-Blocking

Boltic webhook calls are wrapped in try-catch and are **non-blocking** — if the webhook fails, the main operation (task creation, reminder sending) still succeeds.

---

## 18. Performance Optimizations

| Optimization | Implementation |
|---|---|
| **DB Connection Pooling** | Cached connection in `global.mongoose` |
| **MongoDB Indexes** | On frequently queried fields |
| **Lean Queries** | `.lean()` for read-only operations |
| **Server Components** | Dashboard page renders on server |
| **Edge Middleware** | Runs at the edge, near the user |
| **Parallel Queries** | Multiple `countDocuments` run in parallel |
| **Debounced Search** | 300ms debounce on task search |
| **Pagination** | Reminder logs paginated (20 per page) |
| **Font Optimization** | `next/font` for zero layout shift |
| **Image Optimization** | `next/image` with lazy loading |

---

<div align="center">

**End of Documentation**

Built by **Jaykumar Girase** for Fynd SDE Intern Hiring Challenge 2026

</div>
