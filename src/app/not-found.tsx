import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Mark } from "@/components/brand/Mark";
import { COPY } from "@/lib/copy";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Mark variant="pair" state="open" crumbs size={72} className="mx-auto mb-6" />
        {/* DRAFT: needs Ruks */}
        <h1 className="h-page text-[var(--color-text)] mb-3">{COPY.notFoundTitle}</h1>
        <p className="text-[var(--color-text-2)] mb-8">{COPY.notFoundBody}</p>
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <ButtonLink href="/bakes">All the bakes</ButtonLink>
          <Link href="/" className="link text-[var(--color-text-2)] hover:text-[var(--color-cheek)]">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
