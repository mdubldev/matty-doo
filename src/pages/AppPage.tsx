import { useConvexAuth } from 'convex/react'
import { Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'

export function AppPage() {
  const { isAuthenticated, isLoading } = useConvexAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <AppLayout>
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Select or create a space to get started
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
