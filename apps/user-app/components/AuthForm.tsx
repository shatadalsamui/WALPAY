'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@repo/ui/button"
import { TextInput } from "@repo/ui/textinput"
import { Card } from "@repo/ui/card"


//Input validations
const validatePhone = (phone: string) =>
  /^\d{10}$/.test(phone);

const validatePassword = (password: string) =>
  password.length >= 8 && 
  password.length <= 20 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*(),.?":{}|<>]/.test(password);

const validateName = (name: string) =>
  name.length >= 2 && name.length <= 50;

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

type AuthFormProps = {
  mode?: 'signup' | 'signin'
}

export function AuthForm({ mode = 'signin' }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('');

    if (!validatePhone(formData.phone)) {
      setError('Phone number must be 10 digits and contain only numbers !');
      setLoading(false);
      return;
    }

    // Password validation (matches Zod schema)
    if (!validatePassword(formData.password)) {
      setError('Password must be 8-20 characters with uppercase, lowercase, number, and special character !');
      setLoading(false);
      return;
    }

    // Signup-specific validations
    if (mode === 'signup') {
      if (!validateName(formData.name)) {
        setError('Name must be 2-50 characters !');
        setLoading(false);
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Invalid email address !');
        setLoading(false);
        return;
      }
    }

    try {
      const credentials = mode === 'signup' ? {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      } : {
        phone: formData.phone,
        password: formData.password
      };

      console.log('Sending credentials:', credentials);

      const result = await signIn('credentials', {
        ...credentials,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleButtonClick = () => {
    // Create a mock event since we need one for handleSubmit
    const mockEvent = { preventDefault: () => { } } as React.FormEvent;
    handleSubmit(mockEvent);
  };

  return (
    <Card title={mode === 'signup' ? 'Create Account' : 'Sign In'}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <TextInput
            label="Full Name"
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter your full name"
          />
        )}

        <TextInput
          label="Phone Number"
          onChange={(value) => setFormData({ ...formData, phone: value })}
          placeholder="Enter 10 digit phone number"
        />

        {mode === 'signup' && (
          <TextInput
            label="Email"
            onChange={(value) => setFormData({ ...formData, email: value })}
            placeholder="Enter your email"
          />
        )}

        <div className="relative">
          <TextInput
            label="Password"
            type={showPassword ? "text" : "password"}
            onChange={(value) => setFormData({ ...formData, password: value })}
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute right-3 top-[44px] text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="pt-4">
          <Button onClick={handleButtonClick}>
            {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        {mode === 'signin' ? (
          <p>
            Don't have an account?{' '}
            <a 
              href="/signup" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </a>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <a 
              href="/signin" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>
        )}
      </div>
    </Card>
  )
}