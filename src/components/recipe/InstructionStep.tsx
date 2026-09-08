import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import type { Instruction } from "@/types";

interface InstructionStepProps {
  instruction: Instruction;
}

export function InstructionStep({ instruction }: InstructionStepProps) {
  return (
    <li className="flex gap-4 py-4 border-b border-[var(--color-border)] last:border-b-0">
      <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center text-sm font-semibold font-heading">
        {instruction.step}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-body text-[var(--color-text-primary)]">{instruction.text}</p>
        {instruction.image && <FoodPlaceholder className="mt-3 h-44 w-full" />}
      </div>
    </li>
  );
}
