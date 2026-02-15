import { createContext, useContext } from 'react';
import { cn } from '../../lib/utils';

const TabsContext = createContext();

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-gray-800 bg-[#12161F] p-1 gap-1',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  const { value: activeValue, onValueChange } = useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
        isActive
          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/15'
          : 'bg-transparent text-gray-300 hover:bg-white/5 hover:text-white',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { value: activeValue } = useContext(TabsContext);
  if (activeValue !== value) return null;
  return <div className={cn('mt-6', className)}>{children}</div>;
}
