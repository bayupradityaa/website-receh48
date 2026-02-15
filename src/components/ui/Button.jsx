import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Button = forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg ' +
      'disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-0';

    const variants = {
      // ✅ amber primary (dashboard vibe)
      primary:
        'bg-amber-500 text-black hover:bg-amber-400 shadow-sm hover:shadow-md shadow-amber-500/10',

      // ✅ neutral dark button
      secondary:
        'bg-[#1A1F2E] text-white border border-gray-800 hover:bg-white/5',

      // ✅ outline dark
      outline:
        'border border-gray-800 text-gray-200 hover:bg-white/5',

      // ✅ ghost
      ghost:
        'text-gray-200 hover:bg-white/5',

      // ✅ destructive
      danger:
        'bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25',
      destructive:
        'bg-red-500/15 text-red-200 border border-red-500/30 hover:bg-red-500/25',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant] || variants.primary, sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
