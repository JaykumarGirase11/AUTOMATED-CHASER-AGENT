'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      scrolled ? "py-2 px-4" : "py-0"
    )}>
      <div className={cn(
        "transition-all duration-500",
        scrolled
          ? "max-w-5xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-[0_2px_20px_rgba(0,0,0,0.08)] px-6"
          : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-md border-b border-gray-100"
      )}>
        <div className={cn(
          "flex justify-between items-center transition-all duration-300",
          scrolled ? "h-14" : "h-20"
        )}>
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "rounded-xl gradient-bg flex items-center justify-center shadow-md hover:shadow-glow transition-all duration-300",
              scrolled ? "w-9 h-9" : "w-11 h-11"
            )}>
              <Bell className={cn("text-white", scrolled ? "h-4 w-4" : "h-5 w-5")} />
            </div>
            <span className={cn(
              "font-bold gradient-text transition-all duration-300",
              scrolled ? "text-xl" : "text-2xl"
            )}>
              Chaser Agent
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size={scrolled ? "sm" : "default"} className="text-base hover:text-violet-600">Login</Button>
            </Link>
            <Link href="/login">
              <Button size={scrolled ? "sm" : "default"} className="text-base gradient-bg hover:shadow-glow shine-sweep">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
