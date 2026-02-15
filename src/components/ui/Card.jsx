import { cn } from '../../lib/utils';

export function Card({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-[#12161F] border border-gray-800',
    bordered: 'bg-[#12161F] border-2 border-gray-800',
    elevated: 'bg-[#12161F] border border-gray-800 shadow-lg shadow-black/20',
    subtle: 'bg-[#0A0E17] border border-gray-800',
  };

  return (
    <div
      className={cn('rounded-2xl p-6 transition-all duration-200', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight text-white', className)} {...props} />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-sm text-gray-400', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center pt-4 mt-4 border-t border-gray-800', className)} {...props} />;
}
