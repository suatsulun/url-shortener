import { Field } from "@base-ui/react/field";
import { Form as BaseForm } from "@base-ui/react/form";
import { cn } from "@/lib/cn";
import { Input } from "./Input";

type WithClass<T> = Omit<T, "className"> & { className?: string };

type FormProps = WithClass<React.ComponentProps<typeof BaseForm>>;
type FieldRootProps = WithClass<React.ComponentProps<typeof Field.Root>>;
type FieldLabelProps = WithClass<React.ComponentProps<typeof Field.Label>>;
type FieldCtrlProps = WithClass<React.ComponentProps<typeof Field.Control>>;
type FieldDescProps = WithClass<React.ComponentProps<typeof Field.Description>>;
type FieldErrorProps = WithClass<React.ComponentProps<typeof Field.Error>>;

export const Form = ( { className, ...rest }: FormProps) => (
    <BaseForm
      className={cn("flex flex-col gap-4", className)}
      {...rest}
    />
);

export const FormField = ({ className, ...rest }: FieldRootProps) => (
  <Field.Root className={cn("flex flex-col gap-1.5", className)} 
  {...rest} 
  />
);

export const FormLabel = ({ className, ...rest }: FieldLabelProps) => (
    <Field.Label 
    data-slot="label"
    className={cn("text-xs font-semibold text-muted", className)} 
    {...rest} 
    />
    );

export const FormControl = ({ className, ...rest }: FieldCtrlProps) => (
  <Field.Control render={<Input className={className} />} {...rest} />
);

export const FormDescription = ({ className, ...rest }: FieldDescProps) => (
    <Field.Description className={cn("text-xs text-muted", className)} 
    {...rest} 
    />
);

export const FormError = ({ className, ...rest }: FieldErrorProps) => (
    <Field.Error className={cn("text-xs text-crimson", className)} 
    {...rest} 
    />
);