import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface SpaceEditInlineProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function SpaceEditInline({
  initialValue,
  onSave,
  onCancel,
}: SpaceEditInlineProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(value.trim());
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value.trim());
  };

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      className="h-6 text-sm flex-1 px-1 py-0"
    />
  );
}
