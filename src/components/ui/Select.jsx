import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Select = forwardRef(
  ({ className, label, error, helperText, id, options = [], ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
            {props.required && <span className="text-amber-400 ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
            'bg-[#0A0E17] text-white',
            'border-gray-800 hover:border-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40',
            error ? 'border-red-500/70 focus:ring-red-500/30' : '',
            'disabled:bg-[#12161F] disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70',
            className
          )}
          {...props}
        >
          <option value="" className="bg-[#0A0E17]">
            Pilih...
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0A0E17]">
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1.5 text-sm text-red-300">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
