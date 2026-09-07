import { adminDb } from "./admin";
import type { Subscriber, SubscriberSource } from "@/types";

const COLLECTION = "subscribers";

export const SUBSCRIBER_SOURCES: readonly SubscriberSource[] = ["home", "footer", "newsletter-page"];

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Firestore doc ids cannot contain "/" — emails never should, but be safe. */
function emailToId(email: string): string {
  return normaliseEmail(email).replace(/\//g, "%2F");
}

function docToSubscriber(doc: FirebaseFirestore.DocumentSnapshot): Subscriber {
  const data = doc.data() ?? {};
  return {
    id: doc.id,
    email: data.email ?? doc.id,
    source: data.source ?? "home",
    status: data.status === "unsubscribed" ? "unsubscribed" : "subscribed",
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  };
}

/**
 * Adds a subscriber. The normalised email is the document id, which makes
 * duplicates impossible; a previously unsubscribed address is re-activated.
 */
export async function addSubscriber(input: { email: string; source: SubscriberSource }): Promise<{ created: boolean }> {
  const email = normaliseEmail(input.email);
  const ref = adminDb.collection(COLLECTION).doc(emailToId(email));
  const existing = await ref.get();

  if (existing.exists) {
    if (existing.data()?.status === "unsubscribed") {
      await ref.set({ status: "subscribed", resubscribedAt: new Date(), source: input.source }, { merge: true });
    }
    return { created: false };
  }

  await ref.set({
    email,
    source: input.source,
    status: "subscribed",
    createdAt: new Date(),
  });
  return { created: true };
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snapshot.docs.map(docToSubscriber);
}

export async function deleteSubscriber(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

export async function countSubscribers(): Promise<number> {
  const snap = await adminDb.collection(COLLECTION).where("status", "==", "subscribed").count().get();
  return snap.data().count;
}
