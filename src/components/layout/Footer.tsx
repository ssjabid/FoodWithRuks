import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { InstagramIcon } from "@/components/shared/InstagramIcon";
import { NAV_ITEMS, RECIPE_CATEGORIES } from "@/lib/constants";
import { SITE_NAME, SOCIAL_LINKS, TAGLINE_SECONDARY } from "@/lib/site";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] mt-16 sm:mt-20">
      <div className="max-w-wide mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Logo size="lg" withByline />
            <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
              {TAGLINE_SECONDARY}. Wholesome, easy-to-follow recipes and family life, shared with love.
            </p>
          </div>

          <div>
            <h4 className="eyebrow mb-4">Explore</h4>
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="eyebrow mb-4">Recipes</h4>
            <nav className="space-y-2">
              {RECIPE_CATEGORIES.map((cat) => (
                <FooterLink key={cat.value} href={`/recipes?category=${cat.value}`}>
                  {cat.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="eyebrow mb-4">Connect</h4>
            <a
              href={SOCIAL_LINKS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link inline-flex items-center gap-2 mb-6 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              <InstagramIcon className="w-4 h-4" />
              {SOCIAL_LINKS.instagram.handle}
            </a>

            <p className="eyebrow mb-3">Newsletter</p>
            <NewsletterForm source="footer" variant="compact" />
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-border)] text-sm text-[var(--color-text-tertiary)]">
          &copy; {currentYear} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link block w-fit text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
      {children}
    </Link>
  );
}
