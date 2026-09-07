import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/shared/BackToTop";
import {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  STORAGE_KEYS,
  TAGLINE_PRIMARY,
  SOCIAL_LINKS,
  AUTHOR_NAME,
} from "@/lib/site";
import "@/styles/globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${TAGLINE_PRIMARY}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TAGLINE_PRIMARY}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${TAGLINE_PRIMARY}`,
    description: SITE_DESCRIPTION,
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/recipes?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    founder: { "@type": "Person", name: AUTHOR_NAME },
    sameAs: [SOCIAL_LINKS.instagram.url],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('${STORAGE_KEYS.theme}');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-body antialiased">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 page-enter">{children}</main>
          <Footer />
        </div>
        <BackToTop />
      </body>
    </html>
  );
}
