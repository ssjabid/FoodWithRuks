import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, error, id, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          "field w-full h-11 px-4 rounded-[var(--radius-sm)] text-base",
          error && "border-[var(--color-error)]",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, id, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(
          "field w-full px-4 py-3 rounded-[var(--radius-sm)] text-base resize-y min-h-[120px]",
          error && "border-[var(--color-error)]",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Input, Textarea };
