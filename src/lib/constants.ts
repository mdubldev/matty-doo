// Predefined color palette for spaces
export const SPACE_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
] as const;

// Default emojis for quick selection
export const DEFAULT_EMOJIS = [
  '📋', '📝', '✅', '🎯', '💼', '🏠', '🛒', '💡',
  '📚', '🎨', '🏃', '🍳', '✈️', '💰', '🎵', '🌱',
] as const;

// Get a random color from the palette
export function getRandomColor(): string {
  const index = Math.floor(Math.random() * SPACE_COLORS.length);
  return SPACE_COLORS[index].value;
}

// Default emoji for new spaces
export const DEFAULT_SPACE_ICON = '📋';
