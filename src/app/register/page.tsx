import { redirect } from 'next/navigation'

export default function RegisterPage() {
  // Redirect to login page - we use Google Auth for registration
  redirect('/login')
}
