import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="eyebrow mb-3">404</p>
        <h1 className="h-page text-[var(--color-text-primary)] mb-4">This page doesn&apos;t exist</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Looks like this recipe got lost in the kitchen. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/recipes" variant="outline">
            Browse recipes
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
