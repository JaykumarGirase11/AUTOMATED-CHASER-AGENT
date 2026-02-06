import Link from 'next/link'
import { ArrowRight, Bell, CheckCircle, Clock, Sparkles, Zap, BarChart3, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Chaser Agent</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Reminder System
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Never Miss a
              <span className="gradient-text"> Deadline </span>
              Again
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Automated Chaser Agent sends intelligent, personalized reminders at the right time. 
              Like having a program manager who ensures every task gets done on time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 h-14">
                  Start Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Tasks Managed', value: '10K+' },
              { label: 'Reminders Sent', value: '50K+' },
              { label: 'On-Time Rate', value: '94%' },
              { label: 'Teams Active', value: '100+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay on Track
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to eliminate manual follow-ups and ensure deadlines are met.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bell,
                title: 'Smart Reminders',
                description: 'Automated reminders at 3 days, 1 day, and on deadline day. Plus escalation for overdue tasks.',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Messages',
                description: 'Context-aware messages that adapt tone based on urgency, priority, and reminder count.',
              },
              {
                icon: Zap,
                title: 'Boltic Integration',
                description: 'Seamless workflow automation with Boltic platform for powerful trigger-based actions.',
              },
              {
                icon: Clock,
                title: 'Smart Scheduling',
                description: 'Respects working hours, timezones, and weekend preferences. Never annoy your team at night.',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track completion rates, response times, and team performance with beautiful charts.',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Comments, @mentions, task dependencies, and real-time activity feeds.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to automated deadline management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Tasks',
                description: 'Add tasks with assignees, deadlines, and priorities. Set it and forget it.',
              },
              {
                step: '02',
                title: 'Automated Tracking',
                description: 'Our AI monitors deadlines and sends personalized reminders automatically.',
              },
              {
                step: '03',
                title: 'Stay Informed',
                description: 'Track analytics, view reminder history, and watch your team hit every deadline.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-7xl font-bold text-blue-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-8 w-8 text-blue-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Eliminate Manual Follow-ups?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join teams who trust Chaser Agent to keep their projects on track.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Chaser Agent</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Built for Fynd SDE Hiring Challenge</span>
              <span>•</span>
              <span>© 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
