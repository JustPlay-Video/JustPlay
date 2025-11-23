/**
 * AgeRatingBadge Component
 *
 * Display age rating with appropriate styling
 */

interface AgeRatingBadgeProps {
  rating: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AgeRatingBadge({ rating, size = 'md' }: AgeRatingBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const colorClasses = {
    'TV-Y': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'TV-Y7': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'TV-G': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'TV-PG': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'TV-14': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'TV-MA': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  const color = colorClasses[rating as keyof typeof colorClasses] || colorClasses['TV-G'];

  return (
    <span className={`inline-block font-semibold rounded ${sizeClasses[size]} ${color}`}>
      {rating}
    </span>
  );
}
