import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { getRandomColor, getRandomEmoji } from '@/lib/constants';
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
  const [color] = useState(() => getRandomColor());
  const [icon] = useState(() => getRandomEmoji());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        icon,
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

  const handleBlur = () => {
    if (!name.trim()) {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-accent">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-base shrink-0">{icon}</span>
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
