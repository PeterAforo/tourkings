"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export default function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const chars = textRef.current.querySelectorAll(".char");
    gsap.fromTo(
      chars,
      { opacity: 0, y: 50, rotateX: -90 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay,
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
        },
      }
    );
  }, [delay]);

  return (
    <div ref={textRef} className={className} style={{ perspective: 400 }}>
      {children.split("").map((char, i) => (
        <span key={i} className="char inline-block" style={{ display: char === " " ? "inline" : "inline-block" }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}
