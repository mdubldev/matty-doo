import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { SPACE_COLORS } from '@/lib/constants';
import type { Id } from '@/lib/convex';

interface FolderCreateInlineProps {
  spaceId: Id<'spaces'>;
  onCancel: () => void;
  onCreated: (folderId: Id<'folders'>) => void;
  onCreateFolder: (args: {
    spaceId: Id<'spaces'>;
    name: string;
    color: string;
  }) => Promise<Id<'folders'>>;
}

function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * SPACE_COLORS.length);
  return SPACE_COLORS[randomIndex].value;
}

export function FolderCreateInline({
  spaceId,
  onCancel,
  onCreated,
  onCreateFolder,
}: FolderCreateInlineProps) {
  const [name, setName] = useState('');
  const [color] = useState<string>(getRandomColor);
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
      const newFolderId = await onCreateFolder({
        spaceId,
        name: trimmedName,
        color,
      });
      onCreated(newFolderId);
    } catch (error) {
      console.error('Failed to create folder:', error);
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
    // Don't cancel if focus moves within the container
    if (containerRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    if (!name.trim()) {
      onCancel();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent shrink-0"
    >
      {/* Color dot preview */}
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Name input */}
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Folder name..."
        className="h-6 w-24 text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={isSubmitting}
      />
    </div>
  );
}
