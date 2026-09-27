import type { Metadata } from "next";
import { Inter, Kalam, Lora } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/shared/BackToTop";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { PageEnter, PageTransitionListener } from "@/components/shared/PageTransition";
import { FaviconNod } from "@/components/shared/FaviconNod";
import { getSiteSettingsSafe } from "@/lib/firebase/siteSettings";
import { getPublishedRecipes } from "@/lib/firebase/recipes";
import { getCategoryGroup } from "@/lib/constants";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, STORAGE_KEYS, SOCIAL_LINKS, AUTHOR_NAME, SITE_BYLINE } from "@/lib/site";
import "@/styles/globals.css";

export const revalidate = 3600;

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

/** Her handwriting layer until her own is traced. Short notes only. */
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-kalam",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_BYLINE,
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, published] = await Promise.all([
    getSiteSettingsSafe(),
    getPublishedRecipes({ limit: 100 }).catch((error) => {
      console.error("[layout] recipes fetch failed:", error);
      return [];
    }),
  ]);
  // Cooking only shows in the navigation once there is something behind it
  const showCooking = published.some((r) => r.category.some((c) => getCategoryGroup(c) === "cooking"));
  void settings;

  // Runs before first paint: applies the visitor's stored mode (or the device's) so nothing flashes.
  const themeScript = `(function(){try{var d=document.documentElement;
var m=localStorage.getItem('${STORAGE_KEYS.mode}')||localStorage.getItem('${STORAGE_KEYS.theme}');
var dark=m==='dark'||((!m||m==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);
if(dark){d.classList.add('dark');}else{d.classList.remove('dark');}}catch(e){}})();`;

  return (
    <html lang="en-GB" className={`${lora.variable} ${inter.variable} ${kalam.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className="font-body antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <PageTransitionListener />
          <FaviconNod />
          <div className="flex flex-col min-h-dvh">
            <Header showCooking={showCooking} />
            <main id="main" className="flex-1">
              <PageEnter>{children}</PageEnter>
            </main>
            <Footer showCooking={showCooking} />
          </div>
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
