import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SPACE_COLORS } from '@/lib/constants';
import { ColorPicker } from './ColorPicker';
import type { Id } from '@/lib/convex';

interface SpaceCreateInlineProps {
  onCreated: (id: Id<'spaces'>) => void;
  onCancel: () => void;
  onCreateSpace: (args: { name: string; color: string; icon: string }) => Promise<Id<'spaces'>>;
}

export function SpaceCreateInline({
  onCreated,
  onCancel,
  onCreateSpace,
}: SpaceCreateInlineProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(SPACE_COLORS[0].value);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newSpaceId = await onCreateSpace({
        name: trimmedName,
        color,
        icon: '',
      });
      onCreated(newSpaceId);
    } catch (error) {
      console.error('Failed to create space:', error);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't cancel if focus is moving within the component (e.g., to color picker)
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    // Don't cancel if color picker is open
    if (colorPickerOpen) {
      return;
    }
    if (!name.trim()) {
      onCancel();
    }
  };

  return (
    <div ref={containerRef} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent">
      <ColorPicker
        currentColor={color}
        onSelect={setColor}
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
      >
        <button
          type="button"
          className="w-4 h-4 rounded-full shrink-0 hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 transition-all"
          style={{ backgroundColor: color }}
          onClick={(e) => e.stopPropagation()}
        />
      </ColorPicker>
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Space name..."
        className="h-7 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={isSubmitting}
      />
    </div>
  );
}
