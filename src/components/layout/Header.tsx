import { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SpaceList, SpaceListSkeleton } from '@/components/spaces';
import { useSpaces } from '@/hooks/useSpaces';
import type { Id } from '@/lib/convex';

interface HeaderProps {
  selectedSpaceId: Id<'spaces'> | null;
  onSelectSpace: (id: Id<'spaces'>) => void;
}

export function Header({ selectedSpaceId, onSelectSpace }: HeaderProps) {
  const { signOut } = useAuthActions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    spaces,
    isLoading,
    createSpace,
    updateSpace,
    deleteSpace,
    reorderSpaces,
  } = useSpaces();

  const handleSelectSpace = (id: Id<'spaces'>) => {
    onSelectSpace(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        {/* Mobile menu button - only visible on mobile */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open spaces menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="px-4 py-3 border-b border-border">
              <SheetTitle className="text-sm font-medium text-muted-foreground">
                Spaces
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto p-4 h-[calc(100%-57px)]">
              {isLoading ? (
                <SpaceListSkeleton count={3} />
              ) : (
                <SpaceList
                  spaces={spaces ?? []}
                  selectedSpaceId={selectedSpaceId}
                  onSelectSpace={handleSelectSpace}
                  onCreateSpace={createSpace}
                  onUpdateSpace={updateSpace}
                  onDeleteSpace={deleteSpace}
                  onReorderSpaces={reorderSpaces}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="font-semibold">Matty Doo</div>
      </div>

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
  );
}
