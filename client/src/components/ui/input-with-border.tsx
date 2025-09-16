import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputWithBorderProps extends InputHTMLAttributes<HTMLInputElement> {}

const InputWithBorder = forwardRef<HTMLInputElement, InputWithBorderProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative input-border-glow rounded-md overflow-hidden">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md bg-black/70 backdrop-blur-sm border border-purple-500/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-purple-500/40 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner transition-all",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

InputWithBorder.displayName = "InputWithBorder";

export { InputWithBorder };