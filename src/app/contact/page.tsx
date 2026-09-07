import type { Metadata } from "next";
import { ContactClient } from "./ContactClient";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Questions, recipe requests or just a hello — get in touch with ${SITE_NAME}.`,
};

export default function ContactPage() {
  return <ContactClient />;
}
