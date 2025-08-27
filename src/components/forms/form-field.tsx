import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import * as React from "react";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, description, required, error, htmlFor, className, children, ...props }, ref) => {
    const fieldId = htmlFor || React.useId();

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label} 
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="space-y-1">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              const childProps = child.props as any;
              return React.cloneElement(child, {
                id: fieldId,
                'aria-describedby': description ? `${fieldId}-description` : undefined,
                'aria-invalid': error ? 'true' : 'false',
                className: cn(
                  childProps.className,
                  error && "border-destructive focus-visible:ring-destructive"
                ),
                ...childProps,
              } as any);
            }
            return child;
          })}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
export type { FormFieldProps };