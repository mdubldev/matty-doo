import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'signup'
  onModeChange: (mode: 'login' | 'signup') => void
}

export function AuthModal({
  open,
  onOpenChange,
  mode,
  onModeChange,
}: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'login' ? (
          <LoginForm onSwitchToSignup={() => onModeChange('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => onModeChange('login')} />
        )}
      </DialogContent>
    </Dialog>
  )
}
