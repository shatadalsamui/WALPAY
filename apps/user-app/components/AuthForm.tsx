'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@repo/ui/button"
import { TextInput } from "@repo/ui/textinput"
import { Card } from "@repo/ui/card"

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
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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

        <TextInput
          label="Password"
          onChange={(value) => setFormData({ ...formData, password: value })}
          placeholder="Enter your password"
        />
        <div className="pt-4">
          <Button onClick={handleButtonClick}>
            {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </Button>
        </div>
      </form>
    </Card>
  )
}