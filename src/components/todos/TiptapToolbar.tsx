import type { Editor } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Link2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TiptapToolbarProps {
  editor: Editor | null;
}

export function TiptapToolbar({ editor }: TiptapToolbarProps) {
  if (!editor) {
    return null;
  }

  const handleLinkClick = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex items-center gap-1 border-t border-input bg-muted/30 px-2 py-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'h-7 w-7',
          editor.isActive('bold') && 'bg-accent text-accent-foreground'
        )}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'h-7 w-7',
          editor.isActive('italic') && 'bg-accent text-accent-foreground'
        )}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'h-7 w-7',
          editor.isActive('bulletList') && 'bg-accent text-accent-foreground'
        )}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'h-7 w-7',
          editor.isActive('orderedList') && 'bg-accent text-accent-foreground'
        )}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleLinkClick}
        className={cn(
          'h-7 w-7',
          editor.isActive('link') && 'bg-accent text-accent-foreground'
        )}
        title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
      >
        {editor.isActive('link') ? (
          <Unlink className="h-4 w-4" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
