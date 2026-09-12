export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ...rest
}) {
  const variantClass =
    variant === "secondary" ? "btn-secondary" : variant === "ghost" ? "btn-ghost" : "btn-primary";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
