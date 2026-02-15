import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Textarea = forwardRef(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
            {props.required && <span className="text-amber-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 resize-y min-h-[100px]',
            'bg-[#0A0E17] text-white placeholder:text-gray-500',
            'border-gray-800 hover:border-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40',
            error ? 'border-red-500/70 focus:ring-red-500/30' : '',
            'disabled:bg-[#12161F] disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70',
            className
          )}
          {...props}
        />

        {error && <p className="mt-1.5 text-sm text-red-300">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
