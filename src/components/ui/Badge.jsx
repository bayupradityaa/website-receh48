import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-white/5 text-gray-200 border-gray-800',
    success: 'bg-green-500/15 text-green-200 border-green-500/30',
    warning: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-200 border-red-500/30',
    info: 'bg-sky-500/15 text-sky-200 border-sky-500/30',
    purple: 'bg-purple-500/15 text-purple-200 border-purple-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
