import { type ButtonHTMLAttributes, type FC } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean; // Controls layout stretch for mobile views
}

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  children,
  icon: Icon,
  disabled,
  className = '',
  ...props
}) => {
  
  // High-end foundational styles matching the premium layout profile
  const baseClasses = 'inline-flex items-center justify-center font-semibold tracking-wide rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-950 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none';
  
  // Premium gradient maps and depth treatments
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-blue-950 to-blue-900 hover:brightness-110 text-white hover:scale-[1.03] hover:shadow-[0_12px_30px_rgba(15,23,42,0.18)] border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 hover:scale-[1.02] hover:shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-100/80 text-slate-700 border border-transparent',
    danger: 'bg-gradient-to-r from-rose-700 to-red-600 hover:brightness-110 text-white hover:scale-[1.03] hover:shadow-[0_12px_30px_rgba(225,29,72,0.15)] border border-transparent',
  };
  
  // Perfectly proportioned padding-to-height scales
  const sizeClasses: Record<ButtonSize, string> = {
    small: 'px-4 py-2 h-9 text-xs gap-1.5',
    medium: 'px-5 py-3 h-11 text-sm gap-2',
    large: 'px-7 py-4 h-14 text-base gap-2.5 rounded-2xl', // Escalated radius for prominence
  };

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <button
      type={props.type || "button"}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span className="opacity-90">Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;