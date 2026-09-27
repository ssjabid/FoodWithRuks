import { ButtonLink } from "@/components/ui/Button";

/** A real link to the ingredients; smooth scrolling comes from CSS (and is off under reduced motion). */
export function JumpToRecipe() {
  return (
    <ButtonLink href="#ingredients" className="no-print">
      Jump to recipe
    </ButtonLink>
  );
}
