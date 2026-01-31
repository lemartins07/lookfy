import type React from "react";
import NextLink from "next/link";

interface LinkProps {
  href: string;
  text: string;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "gray"
    | "blue-light";
  underline?: boolean;
  opacity?: 10 | 25 | 50 | 75 | 100;
  hoverEffect?: boolean;
}

const Link: React.FC<LinkProps> = ({
  href,
  text,
  variant = "gray",
  underline = false,
  opacity,
  hoverEffect = false,
}) => {
  // Base styles
  const baseStyles = "text-sm font-normal transition-colors";

  // Variant colors
  const variants: Record<string, string> = {
    primary: "text-gray-500 dark:text-gray-400",
    secondary: "text-brand-500 dark:text-brand-500",
    success: "text-success-500",
    danger: "text-error-500",
    warning: "text-warning-500",
    "blue-light": "text-blue-light-500",
    gray: "text-gray-500 dark:text-gray-400",
  };

  // Opacity handling
  const opacityClass = opacity
    ? `text-gray-500/${opacity} dark:text-gray-400/${opacity}`
    : "";

  // Hover effects
  const hoverClass = hoverEffect
    ? `hover:text-gray-500/${opacity || 100} dark:hover:text-gray-400/${
        opacity || 100
      }`
    : "";

  // Underline handling
  const underlineClass = underline ? "underline" : "";

  return (
    <NextLink
      href={href}
      className={`${baseStyles} ${variants[variant]} ${opacityClass} ${hoverClass} ${underlineClass}`}
    >
      {text}
    </NextLink>
  );
};

export default Link;