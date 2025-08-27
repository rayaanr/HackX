import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import * as React from "react";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  required?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, description, required, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };