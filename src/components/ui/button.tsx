import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
// import { Slot } from '@radix-ui/react-slot';

// I need to install @radix-ui/react-slot for "asChild" prop pattern typically used in shadcn/ui. 
// If I don't want to install it yet, I can skip it, but it's good for polymorphic buttons.
// For now, I will skip Slot and just use standard button, or install it.
// User didn't ask for Radix specifically, but it's standard. I'll stick to simple implementation first to reduce deps.

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation',
  {
    variants: {
      variant: {
        default: 'bg-accent-green text-text hover:bg-accent-green/80 shadow-sm',
        secondary: 'bg-white text-text border-2 border-accent-green hover:bg-zinc-50 shadow-sm',
        ghost: 'hover:bg-black/5 text-text',
        destructive: 'bg-accent-pink text-white hover:bg-accent-pink/90',
        outline: 'border-2 border-input bg-transparent hover:bg-accent-yellow/20 text-text',
      },
      size: {
        default: 'h-12 px-8 py-2',
        sm: 'h-9 px-4',
        lg: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Simplified: no Slot support without installing generic slot utility or radix.
    // I will just render button. Be aware asChild prop will be ignored here.
    const Comp = 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
