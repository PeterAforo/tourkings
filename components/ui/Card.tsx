import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container-low rounded-xl overflow-hidden",
        hover && "transition-all duration-500 hover:translate-y-[-8px] hover:shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
