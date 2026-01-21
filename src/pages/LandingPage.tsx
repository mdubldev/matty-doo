import { useState } from 'react'
import { useConvexAuth } from 'convex/react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/AuthModal'

export function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const openLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const openSignup = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-semibold tracking-tight mb-4">
            Matty Doo
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            A super lightweight to-dos app
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="lg" onClick={openLogin}>
              Log in
            </Button>
            <Button size="lg" onClick={openSignup}>
              Sign up
            </Button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        Built for getting things done.
      </footer>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
