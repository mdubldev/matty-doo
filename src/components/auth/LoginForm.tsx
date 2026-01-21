import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signIn('password', { email, password, flow: 'signIn' })
    } catch (err) {
      setError('Invalid email or password')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Log in'}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </button>
      </p>
    </form>
  )
}
