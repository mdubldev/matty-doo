import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SPACE_COLORS } from '@/lib/constants';

interface ColorPickerProps {
  currentColor: string;
  onSelect: (color: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function ColorPicker({
  currentColor,
  onSelect,
  open,
  onOpenChange,
  children,
}: ColorPickerProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-2"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-4 gap-1.5">
          {SPACE_COLORS.map((color) => (
            <button
              key={color.value}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110',
                currentColor === color.value && 'ring-2 ring-offset-1 ring-primary'
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => onSelect(color.value)}
              title={color.name}
            >
              {currentColor === color.value && (
                <Check className="h-3 w-3 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
