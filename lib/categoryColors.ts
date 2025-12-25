export const categoryColors: Record<string, string> = {
  'Bar': '#8B5CF6',           // Purple
  'Food': '#F97316',          // Orange
  'Cafe': '#92400E',          // Brown
  'Bakery': '#EAB308',        // Yellow
  'Dessert': '#EC4899',       // Pink
  'Chocolate': '#78350F',     // Dark Brown
  'Market': '#22C55E',        // Green
  'Museum': '#3B82F6',        // Blue
  'Cultural Space': '#6366F1', // Indigo
  'Garden': '#14B8A6',        // Teal
  'Park': '#10B981',          // Emerald
  'Plaza': '#06B6D4',         // Cyan
  'Cemetery': '#6B7280',      // Gray
  'Day Trip': '#EF4444',      // Red
  'Beach Trip': '#0EA5E9',    // Sky Blue
  'Beach': '#06B6D4',         // Cyan
  'Other': '#9CA3AF',         // Gray
};

export function getCategoryColor(category: string): string {
  // Try exact match first
  if (categoryColors[category]) {
    return categoryColors[category];
  }
  
  // Try case-insensitive match
  const lowerCategory = category.toLowerCase();
  for (const [key, color] of Object.entries(categoryColors)) {
    if (key.toLowerCase() === lowerCategory) {
      return color;
    }
  }
  
  // Default color
  return categoryColors['Other'];
}

export function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    'Bar': '🍸',
    'Food': '🍽️',
    'Cafe': '☕',
    'Bakery': '🥐',
    'Dessert': '🍰',
    'Chocolate': '🍫',
    'Market': '🛒',
    'Museum': '🏛️',
    'Cultural Space': '🎭',
    'Garden': '🌿',
    'Park': '🌳',
    'Plaza': '⛲',
    'Cemetery': '🪦',
    'Day Trip': '🚗',
    'Beach Trip': '🏖️',
    'Beach': '🏝️',
  };
  
  return emojiMap[category] || '📍';
}

