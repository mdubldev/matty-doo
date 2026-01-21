import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Id } from '@/lib/convex';

interface TodoQuickAddProps {
  spaceId: Id<'spaces'>;
  onCreateTodo: (args: { spaceId: Id<'spaces'>; title: string }) => Promise<Id<'todos'>>;
}

export function TodoQuickAdd({ spaceId, onCreateTodo }: TodoQuickAddProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateTodo({ spaceId, title: trimmedTitle });
      setTitle('');
      // Keep focus in input for batch entry
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
      <Input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a todo..."
        disabled={isSubmitting}
        className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm placeholder:text-muted-foreground"
      />
    </form>
  );
}
