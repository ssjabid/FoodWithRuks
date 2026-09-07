import { FoodPlaceholder } from "@/components/shared/FoodPlaceholder";
import type { Instruction } from "@/types";

interface InstructionStepProps {
  instruction: Instruction;
}

export function InstructionStep({ instruction }: InstructionStepProps) {
  return (
    <div className="flex gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center text-sm font-bold">
        {instruction.step}
      </div>
      <div className="flex-1">
        <p className="text-[var(--color-text-primary)] leading-relaxed">{instruction.text}</p>
        {instruction.image && (
          <div className="mt-3 rounded-[var(--radius-sm)] overflow-hidden h-40">
            <FoodPlaceholder className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
}
