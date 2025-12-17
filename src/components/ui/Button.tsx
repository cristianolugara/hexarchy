import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {

        const variants = {
            primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-400/20 backdrop-blur-md",
            secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-white shadow-md border border-slate-700 backdrop-blur-md",
            danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20",
            ghost: "bg-transparent hover:bg-white/5 text-slate-300"
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-5 py-2.5 text-sm",
            lg: "px-8 py-4 text-base font-semibold"
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "rounded-xl font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";
