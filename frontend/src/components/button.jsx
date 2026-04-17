import React from "react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

const variantClasses = {
  default: "bg-teal-600 text-white hover:bg-teal-700",
  ghost: "bg-transparent hover:bg-slate-100",
  outline: "border border-slate-300 bg-white hover:bg-slate-50",
};

const sizeClasses = {
  default: "h-10 px-4 py-2",
  lg: "h-11 px-6 py-2.5",
  sm: "h-9 px-3",
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}) {
  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
