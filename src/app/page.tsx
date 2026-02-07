import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Bell, CheckCircle, Clock, Sparkles, Zap, BarChart3, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/landing/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-white grid-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto animate-reveal">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-violet-100">
              <Sparkles className="h-4 w-4" />
              AI-Powered Reminder System
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gray-900 mb-4 leading-[1.1] tracking-tight">
              Automated
              <br />
              <span className="gradient-text shine-sweep">Chaser Agent</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
              Intelligent reminders that chase deadlines for you.
              <br className="hidden sm:block" />
              AI-powered. Fully automated. No manual follow-ups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 h-14 gradient-bg hover:shadow-glow shine-sweep">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-white/60 backdrop-blur border-gray-200 hover:bg-white">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto stagger">
            {[
              { label: 'Tasks Managed', value: '10K+' },
              { label: 'Reminders Sent', value: '50K+' },
              { label: 'On-Time Rate', value: '94%' },
              { label: 'Teams Active', value: '100+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center animate-reveal">
                <div className="text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 relative overflow-hidden">
        {/* Dark rounded container */}
        <div className="max-w-[90rem] mx-auto px-4">
          <div className="bg-gray-950 rounded-[2.5rem] py-20 px-6 sm:px-12 lg:px-16 relative overflow-hidden">
            {/* Subtle top shadow/glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />

            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 bg-gray-900 border border-gray-800 px-4 py-2 rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  Innovation
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                  What Makes Us
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Different</span>
                </h2>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                  Built specifically for deadline management, not adapted from generic tools.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Smart Reminders', description: 'Automated reminders at 3 days, 1 day, and on deadline day. Plus escalation for overdue tasks.', badge: 'AUTO REMIND', step: '01', color: 'text-green-400' },
                  { title: 'AI-Powered Messages', description: 'Context-aware messages that adapt tone based on urgency, priority, and reminder count.', badge: 'GROQ LLAMA 3.1', step: '02', color: 'text-violet-400' },
                  { title: 'Boltic Integration', description: 'Seamless workflow automation with Boltic platform for powerful trigger-based actions.', badge: 'WEBHOOKS', step: '03', color: 'text-orange-400' },
                  { title: 'Smart Scheduling', description: 'Respects working hours, timezones, and weekend preferences. Never annoy your team at night.', badge: 'TIMEZONE AWARE', step: '04', color: 'text-green-400' },
                  { title: 'Analytics Dashboard', description: 'Track completion rates, response times, and team performance with beautiful charts.', badge: 'REAL-TIME', step: '05', color: 'text-violet-400' },
                  { title: 'Team Collaboration', description: 'Comments, @mentions, task dependencies, and real-time activity feeds.', badge: 'MULTI-USER', step: '06', color: 'text-orange-400' },
                ].map((feature) => (
                  <div key={feature.title} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 hover:border-gray-700 hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <span className={`text-sm font-bold font-mono ${feature.color}`}>{feature.step}</span>
                      <div className="h-px w-8 bg-gray-700"></div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">{feature.description}</p>
                    <span className="inline-block text-[10px] font-semibold tracking-[0.1em] text-gray-500 bg-gray-800/80 border border-gray-700/50 px-3 py-1.5 rounded-full">
                      {feature.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Stacked Steps (RetailSync style) */}
      <section className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              How It Works
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
              Three Steps to
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Perfect Automation</span>
            </h2>
            <p className="text-gray-500 text-lg">From setup to automated reminders in minutes, not hours.</p>
          </div>

          <div className="relative max-w-3xl ml-auto">
            {/* Vertical timeline line */}
            <div className="absolute left-[18px] top-[36px] bottom-[36px] w-px bg-gradient-to-b from-violet-500/40 via-green-500/40 to-orange-500/40" />

            <div className="space-y-6">
              {[
                { step: '01', title: 'Create & Assign Tasks', description: 'Add tasks with assignees, deadlines, and priorities. Our system instantly starts tracking every deadline.', color: 'bg-violet-500', shadow: 'shadow-violet-500/20' },
                { step: '02', title: 'AI Generates Reminders', description: 'Watch AI craft personalized reminder messages that adapt tone based on urgency, priority, and how many times the assignee has been reminded.', color: 'bg-green-500', shadow: 'shadow-green-500/20' },
                { step: '03', title: 'Automated Delivery', description: 'Reminders are sent automatically via email at the right time. Track delivery, response rates, and team performance in real-time.', color: 'bg-orange-500', shadow: 'shadow-orange-500/20' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-6 group">
                  <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-6 relative z-10 shadow-lg ${item.shadow}`}>
                    {item.step}
                  </div>
                  <div className="flex-1 bg-gray-900/60 border border-gray-800/60 rounded-2xl p-7 flex items-center justify-between gap-6 group-hover:border-gray-700 transition-all duration-300">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-gray-800/80 border border-gray-700 flex items-center justify-center flex-shrink-0 group-hover:border-violet-500/50 transition-colors">
                      <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Grade Tools - Full Width with Grid */}
      <section className="py-24 bg-white grid-bg relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-gray-500 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
              Complete Toolkit
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Professional-Grade Tools
            </h2>
            <p className="text-gray-500 text-lg">Every feature crafted for efficiency. Zero learning curve.</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 auto-rows-[140px]">
            {/* Big card - AI Reminders */}
            <div className="col-span-3 row-span-2 bg-gray-900 rounded-2xl p-7 text-white flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center mb-4">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Reminders</h3>
                <p className="text-sm text-gray-400">Context-aware messages powered by LLaMA 3.1. Just type what you want — personalized tone, urgency-based escalation, smart scheduling.</p>
              </div>
              <div className="flex gap-2 mt-4">
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Groq LLaMA 3.1</span>
                <span className="text-[10px] font-semibold tracking-wider text-gray-400 bg-gray-800 px-3 py-1 rounded-full">Auto Tone</span>
              </div>
            </div>

            {/* Boltic Integration */}
            <div className="col-span-3 md:col-span-3 bg-white rounded-2xl p-5 border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Boltic Integration</h3>
              <p className="text-xs text-gray-500">Scheduled webhook automation with Boltic platform.</p>
            </div>

            {/* Analytics */}
            <div className="col-span-3 md:col-span-3 bg-white rounded-2xl p-5 border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-3">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Analytics Dashboard</h3>
              <p className="text-xs text-gray-500">Track completion rates and team performance.</p>
            </div>

            {/* OTP Auth */}
            <div className="col-span-2 bg-gradient-to-br from-green-50 to-white rounded-2xl p-5 border border-green-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">OTP Auth</h3>
              <p className="text-[11px] text-gray-500">Passwordless login</p>
            </div>

            {/* Email Notifications - Gradient card */}
            <div className="col-span-2 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-white text-sm">Email Notifications</h3>
              <p className="text-[11px] text-violet-200">Gmail SMTP • Nodemailer</p>
            </div>

            {/* Team */}
            <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Collaboration</h3>
              <p className="text-[11px] text-gray-500">Comments & mentions</p>
            </div>

            {/* Gamification */}
            <div className="col-span-3 bg-white rounded-2xl p-5 border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">🏆</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Gamification</h3>
                <p className="text-[11px] text-gray-500">Leaderboards, badges, streaks</p>
              </div>
            </div>

            {/* Automation Rules */}
            <div className="col-span-3 bg-white rounded-2xl p-5 border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Automation Rules</h3>
                <p className="text-[11px] text-gray-500">Custom triggers, conditions, actions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Dark bg with white rounded card */}
      <section className="py-24 bg-gray-950 relative overflow-hidden grid-bg-dark">
        {/* Orange/violet fade glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-orange-500/20 via-violet-500/10 to-transparent rounded-full blur-3xl" />

        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <div className="bg-white rounded-3xl p-10 sm:p-12 text-center shadow-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
              Free to start • No credit card
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Ready to Transform
              <br />
              <span className="text-violet-600">Your Workflow?</span>
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Join teams already saving hours on every project. Automate reminders and hit every deadline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-base px-8 h-12 bg-gray-900 hover:bg-gray-800 text-white">
                  Get Started — Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8 h-12 border-gray-300 hover:bg-gray-50">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Created For */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 animate-reveal">
          <p className="text-sm font-semibold tracking-[0.3em] text-gray-400 uppercase mb-4">Created For</p>
          <h2 className="text-5xl sm:text-6xl font-bold mb-16">
            <span className="text-gray-900">Fynd </span>
            <span className="text-gray-300 italic font-light">Hiring Challenge</span>
          </h2>
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg mb-6 hover:shadow-glow transition-shadow duration-500">
              <Image
                src="/profile.jpg"
                alt="Jaykumar Girase"
                width={160}
                height={160}
                className="profile-photo w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Jaykumar <span className="italic text-gray-400 font-light">Girase</span>
            </h3>
            <p className="text-gray-500 mt-1">Full Stack Developer</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">Chaser Agent</span>
                  <p className="text-xs text-gray-500">AI-Powered Reminders</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Intelligent automated reminder system that eliminates manual follow-ups. Built for teams who demand efficiency.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs bg-violet-950/50 text-violet-300 px-3 py-1.5 rounded-full border border-violet-800">
                🏆 Fynd Hiring Challenge 2026
              </span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/dashboard" className="hover:text-violet-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard/tasks" className="hover:text-violet-400 transition-colors">Tasks</Link></li>
                <li><Link href="/dashboard/analytics" className="hover:text-violet-400 transition-colors">Analytics</Link></li>
                <li><Link href="/dashboard/automation" className="hover:text-violet-400 transition-colors">Automation</Link></li>
                <li><Link href="/login" className="hover:text-violet-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Built With</h4>
              <div className="flex flex-wrap gap-2">
                {['Next.js 14', 'MongoDB', 'Groq LLaMA 3.1', 'Tailwind CSS', 'NextAuth.js', 'Nodemailer'].map((tech) => (
                  <span key={tech} className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:text-violet-400 hover:border-violet-600 transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">© 2026 Chaser Agent. Made for Fynd Hiring Challenge.</p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/JaykumarGirase11" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 hover:text-violet-400 hover:border-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="https://linkedin.com/in/jaykumar-girase" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-500 hover:text-violet-400 hover:border-violet-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
