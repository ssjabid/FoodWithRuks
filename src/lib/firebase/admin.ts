import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const apps = getApps();

if (apps.length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Accept a key pasted with escaped \n, real newlines, CRLF, or a mix of them.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/\r/g, "").replace(/\n+/g, "\n"),
    }),
  });
}

const adminDb = getFirestore();
try {
  // Drop undefined fields instead of throwing (forms send optional fields as undefined)
  adminDb.settings({ ignoreUndefinedProperties: true });
} catch {
  /* settings() can only be called once per instance (dev HMR) */
}
const adminAuth = getAuth();

export { adminDb, adminAuth };
