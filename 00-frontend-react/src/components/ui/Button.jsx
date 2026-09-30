import React from 'react';
import PropTypes from 'prop-types';
import { LoaderCircle } from 'lucide-react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55';

  const variants = {
    primary: 'border-brand-600 bg-brand-600 text-white shadow-sm hover:border-brand-700 hover:bg-brand-700',
    secondary: 'border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50',
    outline: 'border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50',
    ghost: 'border-transparent bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'border-red-600 bg-red-600 text-white shadow-sm hover:border-red-700 hover:bg-red-700',
  };

  const sizes = {
    small: 'min-h-9 px-3 py-1.5 text-sm',
    medium: 'px-4 py-2.5 text-sm',
    large: 'px-5 py-3 text-base',
  };

  const buttonClasses = `${baseClasses} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.medium} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClasses}
      {...props}
    >
      {isLoading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
