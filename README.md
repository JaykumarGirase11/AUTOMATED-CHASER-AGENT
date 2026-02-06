# Automated Chaser Agent

An intelligent task management and automated reminder system built with Next.js, MongoDB, and AI-powered messaging using LLaMA 3.1 via Groq. The system integrates with Boltic platform for automated workflow execution.

![Automated Chaser Agent](https://via.placeholder.com/800x400?text=Automated+Chaser+Agent)

## 🚀 Features

### Core Features
- **📋 Task Management**: Create, update, and track tasks with assignees, deadlines, and priorities
- **🤖 AI-Powered Reminders**: Generate personalized reminder messages using LLaMA 3.1 70B
- **📧 Multi-Channel Notifications**: Send reminders via email (Nodemailer) and Slack integration
- **⚡ Automation Rules**: Create custom rules to automatically trigger reminders based on conditions
- **📊 Analytics Dashboard**: Visualize task completion rates, reminder effectiveness, and trends
- **🏆 Gamification**: Leaderboard, badges, and streak tracking to encourage productivity

### Boltic Integration
- **Scheduled Webhooks**: Boltic triggers the `/api/webhooks/boltic` endpoint on schedule
- **Automation Execution**: Rules are evaluated and actions executed automatically
- **Event Tracking**: All automation events are logged for audit purposes

### Advanced Features
- **🔒 JWT Authentication**: Secure user authentication with httpOnly cookies
- **📈 Delay Risk Analysis**: AI analyzes tasks to predict potential delays
- **💬 Task Comments**: Collaborate on tasks with comment threads
- **📑 Export Reports**: Export analytics data to CSV
- **🎨 Beautiful UI**: Modern, responsive design with Tailwind CSS and ShadCN components

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB with Mongoose |
| Authentication | JWT + bcryptjs |
| AI/LLM | Groq SDK (LLaMA 3.1 70B) |
| Email | Nodemailer (Gmail SMTP) |
| Automation | Boltic Platform |
| Styling | Tailwind CSS + ShadCN UI |
| Charts | Recharts |
| Validation | Zod + React Hook Form |
| Date Handling | date-fns |

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database (local or Atlas)
- Groq API key
- Gmail account for SMTP (or other email provider)
- Boltic platform account

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd automated-chaser-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/chaser-agent?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Groq AI
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM="Chaser Agent <your-email@gmail.com>"

# Boltic Platform
BOLTIC_API_KEY=your-boltic-api-key
BOLTIC_WEBHOOK_SECRET=your-webhook-secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── tasks/          # Task CRUD & reminders
│   │   ├── analytics/      # Analytics data
│   │   ├── rules/          # Automation rules
│   │   ├── reminders/      # Reminder logs
│   │   ├── ai/             # AI message generation
│   │   └── webhooks/       # Boltic webhook handler
│   ├── dashboard/          # Dashboard pages
│   │   ├── tasks/
│   │   ├── analytics/
│   │   ├── history/
│   │   ├── automation/
│   │   ├── leaderboard/
│   │   └── settings/
│   ├── login/
│   ├── register/
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # ShadCN components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── db.ts              # MongoDB connection
│   ├── auth.ts            # Auth utilities
│   ├── utils.ts           # Helper functions
│   └── validations.ts     # Zod schemas
├── models/
│   ├── User.ts
│   ├── Task.ts
│   ├── ReminderLog.ts
│   └── AutomationRule.ts
└── services/
    ├── ai.ts              # Groq AI integration
    ├── email.ts           # Nodemailer setup
    └── boltic.ts          # Boltic webhook triggers
```

## 🔄 Boltic Integration Setup

### Creating a Workflow in Boltic

1. **Log in to Boltic Platform** at https://boltic.io

2. **Create a new Workflow**
   - Name: "Chaser Agent Scheduler"
   - Trigger: Schedule (Cron)
   - Schedule: `0 9,14,17 * * *` (9 AM, 2 PM, 5 PM daily)

3. **Add HTTP Request Action**
   - Method: POST
   - URL: `https://your-domain.com/api/webhooks/boltic`
   - Headers:
     ```json
     {
       "Content-Type": "application/json",
       "x-webhook-secret": "your-webhook-secret"
     }
     ```
   - Body:
     ```json
     {
       "event": "scheduled_check",
       "timestamp": "{{$timestamp}}"
     }
     ```

4. **Activate the Workflow**

### Webhook Events Handled

| Event | Description |
|-------|-------------|
| `scheduled_check` | Check all pending tasks and send due reminders |
| `task_created` | Trigger welcome message to assignee |
| `task_overdue` | Escalate overdue tasks |
| `automation_rule` | Execute specific automation rule |

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/[id]` | Get task details |
| PATCH | `/api/tasks/[id]` | Update task |
| DELETE | `/api/tasks/[id]` | Delete task |
| POST | `/api/tasks/[id]/remind` | Send reminder |
| GET/POST | `/api/tasks/[id]/comments` | Task comments |

### Automation
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/rules` | Manage automation rules |
| PATCH/DELETE | `/api/rules?id=` | Update/delete rule |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get analytics data |
| GET | `/api/reminders/logs` | Get reminder history |

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
vercel --prod
```

### Environment Variables in Vercel

Add all variables from `.env.local` to your Vercel project settings.

## 📊 Analytics Features

- **Task Completion Rate**: Track how many tasks are completed on time
- **Reminder Effectiveness**: Measure response rates after reminders
- **Priority Distribution**: Visualize task distribution by priority
- **Weekly Trends**: Area charts showing task creation vs completion
- **Top Assignees**: Leaderboard of most productive assignees
- **AI Adoption Rate**: Track usage of AI-generated messages

## 🎮 Gamification System

### Points System
| Action | Points |
|--------|--------|
| Complete Task | +50 |
| On-Time Completion | +25 bonus |
| Daily Streak | +10 per day |
| Use AI Reminder | +5 |

### Badges
- 🌟 First Task
- 🔥 Week Warrior (7-day streak)
- 👑 Monthly Master (30-day streak)
- 🎯 On-Time Pro (90% rate)
- 📈 Reminder Guru (100+ sent)
- 🤖 AI Adopter (50+ AI reminders)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Jay Kumar Girase**
- Built for Fynd SDE Intern Hiring Challenge 2026

---

⭐ Star this repo if you found it helpful!
