import { Link } from "react-router-dom";

const variants = {
  primary: "bg-[#FF9900] hover:bg-[#E88B00] text-white",
  secondary: "bg-[#FFA41C] hover:bg-[#FF9900] text-white",
  outline: "border border-[#D5D9D9] hover:bg-[#F7FAFA] text-[#0F1111]",
  danger: "bg-[#B12704] hover:bg-[#960000] text-white",
  success: "bg-[#067D62] hover:bg-[#056B50] text-white",
  ghost: "hover:bg-[#F7FAFA] text-[#0F1111]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  className = "",
  ...props
}) {
  const classes = `inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
