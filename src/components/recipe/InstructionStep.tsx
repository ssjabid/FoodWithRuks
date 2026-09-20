import { Photo } from "@/components/shared/Photo";
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
        {instruction.image && <Photo src={instruction.image} alt="" fit="natural" sizes="(min-width: 1024px) 680px, 100vw" className="mt-3 w-full max-w-xl" />}
      </div>
    </li>
  );
}
