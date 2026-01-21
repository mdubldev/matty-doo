import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_EMOJIS } from '@/lib/constants';

interface EmojiPickerProps {
  currentEmoji: string;
  onSelect: (emoji: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function EmojiPicker({
  currentEmoji,
  onSelect,
  open,
  onOpenChange,
  children,
}: EmojiPickerProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-2"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-4 gap-1">
          {DEFAULT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className={cn(
                'w-8 h-8 rounded flex items-center justify-center text-lg transition-colors hover:bg-accent',
                currentEmoji === emoji && 'bg-accent ring-1 ring-primary'
              )}
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
