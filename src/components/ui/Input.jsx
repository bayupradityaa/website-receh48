import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              'text-gray-300'
            )}
          >
            {label}
            {props.required && <span className="text-amber-400 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            // base
            'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',

            // ✅ dark theme default
            'bg-[#0A0E17] text-white placeholder:text-gray-500',
            'border-gray-800 hover:border-gray-700',

            // ✅ focus
            'focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40',

            // ✅ error state
            error
              ? 'border-red-500/70 focus:ring-red-500/30 focus:border-red-500/70'
              : '',

            // ✅ disabled state
            'disabled:bg-[#12161F] disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70',

            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-sm text-red-300">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
