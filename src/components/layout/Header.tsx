import { useAuthActions } from '@convex-dev/auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function Header() {
  const { signOut } = useAuthActions()

  return (
    <header className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0">
      <div className="font-semibold">Matty Doo</div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Log out</span>
      </Button>
    </header>
  )
}
