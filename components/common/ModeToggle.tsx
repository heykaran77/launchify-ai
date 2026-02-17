'use client';

import { useThemeToggle } from '@/components/ui/skiper-ui/skiper26';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function ModeToggle({
  className = ``,
  variant = 'circle',
  start = 'center',
  blur = true,
}: {
  className?: string;
  variant?: 'circle' | 'rectangle' | 'gif' | 'polygon' | 'circle-blur';
  start?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center'
    | 'top-center'
    | 'bottom-center'
    | 'bottom-up'
    | 'top-down'
    | 'left-right'
    | 'right-left';
  blur?: boolean;
}) {
  const { isDark, toggleTheme } = useThemeToggle({
    variant,
    start,
    blur,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-10 rounded-full bg-black" />;
  }

  return (
    <button
      type="button"
      className={cn(
        'size-10 cursor-pointer rounded-full p-2 transition-all duration-300 active:scale-95',
        isDark ? 'bg-black text-white' : 'bg-white text-black',
        className,
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
      >
        <clipPath id="mode-toggle-clip">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#mode-toggle-clip)">
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}
