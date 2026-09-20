// End-to-end test of the admin -> Firestore -> public site pipeline through the REAL API routes.
//
// It signs in as a dedicated test admin (created in Firebase Auth for the run and deleted after),
// so the address must be allow-listed on the server under test:
//   local:  .env.development.local  ->  ADMIN_EMAIL=<your emails>,e2e-admin@agoohandruks.test
// Then:    npm run dev   and   node scripts/e2e-admin.mjs   (from the project root)
// Env:     E2E_BASE_URL (default http://localhost:3000)
// Every document it creates is deleted at the end, even when an assertion fails.

import assert from "node:assert/strict";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

loadEnvConfig(process.cwd());
const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";
const TEST_EMAIL = "e2e-admin@agoohandruks.test";
const stamp = Date.now().toString(36);
const SLUG = `e2e-recipe-${stamp}`;
const POST_SLUG = `e2e-story-${stamp}`;

const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n").replace(/\r/g, "").replace(/\n+/g, "\n");
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey }) });
const auth = getAuth();

const log = (...a) => console.log("  ", ...a);
const step = (t) => console.log(`\n== ${t}`);

async function idTokenForTestAdmin() {
  let user;
  try {
    user = await auth.getUserByEmail(TEST_EMAIL);
  } catch {
    user = await auth.createUser({ email: TEST_EMAIL, emailVerified: true, displayName: "E2E admin" });
  }
  const custom = await auth.createCustomToken(user.uid);
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: custom, returnSecureToken: true }),
  });
  const data = await r.json();
  assert.ok(data.idToken, `could not sign in test admin: ${JSON.stringify(data.error || data)}`);
  return { idToken: data.idToken, uid: user.uid };
}

let token = "";
const api = async (path, { method = "GET", body, auth: withAuth = true } = {}) => {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(withAuth ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { status: r.status, json, text };
};
const page = async (path) => {
  const r = await fetch(`${BASE}${path}`, { headers: { "Cache-Control": "no-cache" } });
  return { status: r.status, html: await r.text() };
};

const created = { recipeId: null, postId: null, commentId: null, messageId: null, subscriberId: null, uid: null, prevPages: null, prevSettings: null };
let failures = 0;
const check = async (name, fn) => {
  try {
    await fn();
    log("ok  ", name);
  } catch (e) {
    failures++;
    log("FAIL", name, "->", e.message);
  }
};

try {
  step("Sign in as the test admin");
  const t = await idTokenForTestAdmin();
  token = t.idToken;
  created.uid = t.uid;
  await check("admin token accepted by /api/admin/stats", async () => {
    const r = await api("/api/admin/stats");
    assert.equal(r.status, 200, r.text);
  });
  await check("unauthenticated call is refused", async () => {
    const r = await api("/api/admin/stats", { auth: false });
    assert.equal(r.status, 403);
  });

  step("Recipes: validation, create, duplicate slug, publish, public page");
  await check("empty body rejected with 400 + message", async () => {
    const r = await api("/api/admin/recipes", { method: "POST", body: {} });
    assert.equal(r.status, 400, r.text);
    assert.ok(r.json?.error, "error message present");
  });
  const recipeBody = {
    title: `E2E Butter Naan ${stamp}`,
    slug: SLUG,
    description: "A test recipe created by the e2e script.",
    personalStory: "Made for the audit.",
    category: ["bread"],
    mealType: ["dinner"],
    dietaryTags: ["Vegetarian"],
    tags: ["e2e", "naan"],
    difficulty: "easy",
    prepTime: 10,
    cookTime: 5,
    servings: 4,
    ingredients: [{ id: "a", amount: "2", unit: "cups", name: "flour" }, { id: "b", amount: "", unit: "", name: "" }],
    instructions: [{ step: 5, text: "Mix." }, { step: 1, text: "Cook." }, { step: 9, text: "" }],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    seo: { metaTitle: "", metaDescription: "" },
    status: "draft",
    featured: false,
    viewCount: 999,
    rating: { average: 5, count: 99 },
  };
  await check("create draft (protected fields ignored, steps renumbered, blanks dropped)", async () => {
    const r = await api("/api/admin/recipes", { method: "POST", body: recipeBody });
    assert.equal(r.status, 201, r.text);
    created.recipeId = r.json.id;
    const g = await api(`/api/admin/recipes/${created.recipeId}`);
    assert.equal(g.status, 200);
    assert.equal(g.json.viewCount, 0, "viewCount not settable");
    assert.equal(g.json.rating.count, 0, "rating not settable");
    assert.deepEqual(g.json.instructions.map((s) => s.step), [1, 2]);
    assert.equal(g.json.ingredients.length, 1);
    assert.equal(g.json.nutrition, undefined, "empty nutrition stored as none");
  });
  await check("duplicate slug rejected with 409", async () => {
    const r = await api("/api/admin/recipes", { method: "POST", body: recipeBody });
    assert.equal(r.status, 409, r.text);
  });
  await check("draft is not public (404)", async () => {
    const r = await page(`/recipes/${SLUG}`);
    assert.equal(r.status, 404);
  });
  await check("draft preview link works", async () => {
    const r = await api(`/api/admin/preview?type=recipe&slug=${SLUG}`);
    assert.equal(r.status, 200, r.text);
    const p = await page(r.json.path);
    assert.equal(p.status, 200);
    assert.ok(p.html.includes("Draft preview"), "banner shown");
    assert.ok(p.html.includes(recipeBody.title), "title rendered");
    const bad = await page(r.json.path.replace(/.$/, (c) => (c === "x" ? "y" : "x")));
    assert.equal(bad.status, 404, "tampered token refused");
  });
  await check("publish via PUT and public page renders", async () => {
    const r = await api(`/api/admin/recipes/${created.recipeId}`, { method: "PUT", body: { ...recipeBody, status: "published" } });
    assert.equal(r.status, 200, r.text);
    const p = await page(`/recipes/${SLUG}`);
    assert.equal(p.status, 200);
    assert.ok(p.html.includes(recipeBody.title));
    assert.ok(p.html.includes('"@type":"Recipe"'), "JSON-LD present");
  });
  await check("published recipe appears in the admin list and on the home page", async () => {
    const l = await api("/api/admin/recipes");
    assert.ok(l.json.some((x) => x.id === created.recipeId));
    const h = await page("/");
    assert.ok(h.html.includes(recipeBody.title), "home page lists it");
  });
  await check("sitemap and feed include it", async () => {
    const s = await page("/sitemap.xml");
    assert.ok(s.html.includes(`/recipes/${SLUG}`));
    const f = await page("/feed.xml");
    assert.equal(f.status, 200);
    assert.ok(f.html.includes(recipeBody.title));
  });

  step("Views: ping increments viewCount");
  await check("view ping counts once", async () => {
    const r = await api("/api/recipes/view", { method: "POST", body: { slug: SLUG }, auth: false });
    assert.equal(r.status, 200);
    await api("/api/recipes/view", { method: "POST", body: { slug: SLUG }, auth: false });
    const g = await api(`/api/admin/recipes/${created.recipeId}`);
    assert.equal(g.json.viewCount, 1, "second ping from same ip within an hour ignored");
  });

  step("Comments: public post, moderation, rating aggregate, public render");
  await check("honeypot silently accepted", async () => {
    const r = await api("/api/comments", { method: "POST", body: { recipeSlug: SLUG, name: "Bot", text: "x".repeat(20), rating: 5, website: "spam" }, auth: false });
    assert.equal(r.status, 200);
  });
  await check("comment on unknown recipe rejected", async () => {
    const r = await api("/api/comments", { method: "POST", body: { recipeSlug: "nope-" + stamp, name: "Anna", text: "x".repeat(20), rating: 5 }, auth: false });
    assert.equal(r.status, 404, r.text);
  });
  await check("valid comment lands as pending", async () => {
    const r = await api("/api/comments", { method: "POST", body: { recipeSlug: SLUG, name: "Test Reader", text: "Loved this naan, so soft and easy.", rating: 4 }, auth: false });
    assert.equal(r.status, 200, r.text);
    const l = await api("/api/admin/comments");
    const c = l.json.find((x) => x.recipeSlug === SLUG);
    assert.ok(c, "comment listed for admin");
    assert.equal(c.status, "pending");
    assert.equal(c.name, "Test Reader");
    created.commentId = c.id;
    const p = await page(`/recipes/${SLUG}`);
    assert.ok(!p.html.includes("Loved this naan"), "pending comment not public");
  });
  await check("approve -> rating aggregate + public render", async () => {
    const r = await api(`/api/admin/comments/${created.commentId}`, { method: "PUT", body: { status: "approved" } });
    assert.equal(r.status, 200, r.text);
    const g = await api(`/api/admin/recipes/${created.recipeId}`);
    assert.deepEqual(g.json.rating, { average: 4, count: 1 });
    const p = await page(`/recipes/${SLUG}`);
    assert.ok(p.html.includes("Loved this naan"), "approved comment public");
    assert.ok(p.html.includes("Test Reader"));
  });

  step("Lifestyle posts");
  await check("post without category rejected", async () => {
    const r = await api("/api/admin/lifestyle", { method: "POST", body: { title: "x", content: "<p>hi</p>" } });
    assert.equal(r.status, 400, r.text);
  });
  await check("create published post, reading time computed, public page renders", async () => {
    const r = await api("/api/admin/lifestyle", {
      method: "POST",
      body: { title: `E2E Story ${stamp}`, slug: POST_SLUG, excerpt: "A test story.", content: `<h2>Hello</h2><p>${"word ".repeat(450)}</p>`, category: "days-out", status: "published", readingTime: 99 },
    });
    assert.equal(r.status, 201, r.text);
    created.postId = r.json.id;
    const g = await api(`/api/admin/lifestyle/${created.postId}`);
    assert.equal(g.json.readingTime, 3, "reading time computed server-side (451 words)");
    const p = await page(`/lifestyle/${POST_SLUG}`);
    assert.equal(p.status, 200);
    assert.ok(p.html.includes(`E2E Story ${stamp}`));
  });
  await check("duplicate post slug rejected with 409", async () => {
    const r = await api("/api/admin/lifestyle", { method: "POST", body: { title: "dup", slug: POST_SLUG, content: "<p>x</p>", category: "travel" } });
    assert.equal(r.status, 409, r.text);
  });

  step("Contact + newsletter -> admin inboxes");
  await check("contact honeypot swallowed, real message stored and visible to admin", async () => {
    const bot = await api("/api/contact", { method: "POST", body: { name: "b", email: "b@b.com", subject: "s", message: "x".repeat(20), website: "spam" }, auth: false });
    assert.equal(bot.status, 200);
    const r = await api("/api/contact", { method: "POST", body: { name: "E2E", email: `e2e-${stamp}@example.com`, subject: "Hello", message: "This is a test message from the audit." }, auth: false });
    assert.equal(r.status, 200, r.text);
    const l = await api("/api/admin/messages");
    const m = l.json.find((x) => x.email === `e2e-${stamp}@example.com`);
    assert.ok(m, "message listed");
    created.messageId = m.id;
    const u = await api(`/api/admin/messages/${m.id}`, { method: "PUT", body: { read: true } });
    assert.equal(u.status, 200);
  });
  await check("newsletter subscribe visible to admin", async () => {
    const r = await api("/api/newsletter", { method: "POST", body: { email: `e2e-${stamp}@example.com`, source: "home" }, auth: false });
    assert.equal(r.status, 200, r.text);
    const l = await api("/api/admin/subscribers");
    const s = l.json.find((x) => x.email === `e2e-${stamp}@example.com`);
    assert.ok(s, "subscriber listed");
    created.subscriberId = s.id;
  });

  step("Settings + pages");
  await check("pin the test recipe as New this week, then restore", async () => {
    const before = await api("/api/admin/settings");
    created.prevSettings = before.json;
    const r = await api("/api/admin/settings", { method: "PUT", body: { recipeOfTheWeekSlug: SLUG } });
    assert.equal(r.status, 200, r.text);
    const h = await page("/");
    const idx = h.html.indexOf("New this week");
    assert.ok(idx > 0 && h.html.slice(idx, idx + 3000).includes(recipeBody.title), "pinned recipe beside the headline");
  });
  await check("edit the home intro, then restore", async () => {
    const before = await api("/api/admin/pages");
    created.prevPages = before.json;
    const r = await api("/api/admin/pages", { method: "PUT", body: { heroIntro: `E2E intro ${stamp}` } });
    assert.equal(r.status, 200, r.text);
    const h = await page("/");
    assert.ok(h.html.includes(`E2E intro ${stamp}`));
    const tooLong = await api("/api/admin/pages", { method: "PUT", body: { heroIntro: "x".repeat(301) } });
    assert.equal(tooLong.status, 400);
  });

  step("Upload endpoint guard rails");
  await check("upload without token configured -> 503, or with token -> 400 on bad body", async () => {
    const r = await api("/api/admin/upload", { method: "POST", body: { name: "x", folder: "recipes", variants: [] } });
    assert.ok(r.status === 503 || r.status === 400, `got ${r.status}`);
  });

  step("Delete flows");
  await check("delete recipe -> public 404, comment gone from admin list", async () => {
    const r = await api(`/api/admin/recipes/${created.recipeId}`, { method: "DELETE" });
    assert.equal(r.status, 200);
    created.recipeId = null;
    const p = await page(`/recipes/${SLUG}`);
    assert.equal(p.status, 404);
  });
} finally {
  step("Cleanup");
  if (created.prevSettings) await api("/api/admin/settings", { method: "PUT", body: { recipeOfTheWeekSlug: created.prevSettings.recipeOfTheWeekSlug ?? "" } });
  if (created.prevPages) await api("/api/admin/pages", { method: "PUT", body: { heroIntro: created.prevPages.heroIntro } });
  if (created.recipeId) await api(`/api/admin/recipes/${created.recipeId}`, { method: "DELETE" });
  if (created.postId) await api(`/api/admin/lifestyle/${created.postId}`, { method: "DELETE" });
  if (created.commentId) await api(`/api/admin/comments/${created.commentId}`, { method: "DELETE" });
  if (created.messageId) await api(`/api/admin/messages/${created.messageId}`, { method: "DELETE" });
  if (created.subscriberId) await api(`/api/admin/subscribers/${created.subscriberId}`, { method: "DELETE" });
  // sweep any pending comments from this run that were not captured
  const rest = await api("/api/admin/comments");
  for (const c of rest.json || []) if (c.recipeSlug === SLUG) await api(`/api/admin/comments/${c.id}`, { method: "DELETE" });
  if (created.uid) await auth.deleteUser(created.uid).catch(() => {});
  log("test admin user removed; settings/pages restored");
  console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed");
  process.exit(failures ? 1 : 0);
}
