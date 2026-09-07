import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Ruks — the home cook behind Agooh & Ruks. Food made with love, cooked simply, for your soul.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
