'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isNewUser, setIsNewUser] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Send OTP
  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' })
      })

      const data = await response.json()

      if (response.ok) {
        setIsNewUser(data.isNewUser || false)
        setStep('otp')
        setResendTimer(60)
        toast({
          title: "OTP Sent! 📧",
          description: `Check your email: ${email}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send OTP",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
      setOtp(newOtp.slice(0, 6))
      otpRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  // Verify OTP and Login
  const handleVerifyAndLogin = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter complete 6-digit OTP",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Verify OTP and Login in one call
      const response = await fetch('/api/auth/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
        toast({
          title: isNewUser ? "Account Created! 🎉" : "Welcome Back! 👋",
          description: "Redirecting to dashboard...",
        })
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        toast({
          title: "Verification Failed",
          description: data.error || "Invalid OTP",
          variant: "destructive"
        })
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">Chaser Agent</span>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === 'email' && 'Get Started'}
              {step === 'otp' && 'Verify OTP'}
              {step === 'success' && 'Success!'}
            </CardTitle>
            <CardDescription>
              {step === 'email' && 'Enter your email to continue'}
              {step === 'otp' && `OTP sent to ${email}`}
              {step === 'success' && (isNewUser ? 'Account created successfully!' : 'Logged in successfully!')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step 1: Email */}
            {step === 'email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSendOTP} 
                  className="w-full" 
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  We'll send you a one-time password to verify your email.
                  {' '}New users will be registered automatically.
                </p>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <div className="space-y-6">
                {isNewUser && (
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-700">
                      🆕 New user detected! Your account will be created after verification.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-center block">Enter 6-digit OTP</Label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        disabled={isLoading}
                        className="w-12 h-14 text-center text-2xl font-bold"
                      />
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleVerifyAndLogin} 
                  className="w-full" 
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & {isNewUser ? 'Create Account' : 'Login'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button 
                    onClick={() => {
                      setStep('email')
                      setOtp(['', '', '', '', '', ''])
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ← Change email
                  </button>
                  
                  {resendTimer > 0 ? (
                    <span className="text-gray-500">Resend in {resendTimer}s</span>
                  ) : (
                    <button 
                      onClick={handleSendOTP}
                      className="text-blue-600 hover:underline"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  {isNewUser ? 'Welcome to Chaser Agent!' : 'Welcome Back!'}
                </h3>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
                <div className="mt-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
