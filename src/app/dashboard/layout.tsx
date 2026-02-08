import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import DashboardNav from '@/components/dashboard/DashboardNav'
import Sidebar from '@/components/dashboard/Sidebar'
import AutomationRunner from '@/components/dashboard/AutomationRunner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/20">
      {/* Background automation - runs automatically */}
      <AutomationRunner />
      
      <DashboardNav user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
