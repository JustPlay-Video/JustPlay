import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

/**
 * EmptyState component for displaying empty states
 * Shows icon, message, and optional action button
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-600 mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}

      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
