"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function FilterPill({ label, selected, onClick }: FilterPillProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={false}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: selected ? [1, 1.06, 1] : 1,
      }}
      transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "h-9 px-4 rounded-full text-sm font-medium border inline-flex items-center gap-1.5 transition-colors duration-200",
        selected
          ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]"
          : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      )}
    >
      {label}
    </motion.button>
  );
}
