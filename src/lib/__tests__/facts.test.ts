import { test } from "node:test";
import assert from "node:assert/strict";
import { factsLine, formatExtraTime, formatMinutes, isoDuration, jsonLdYield, plural, timeText, totalMinutes, yieldText } from "../facts.ts";

test("formatMinutes speaks like a person", () => {
  assert.equal(formatMinutes(0), "");
  assert.equal(formatMinutes(1), "About 1 minute");
  assert.equal(formatMinutes(40), "About 40 minutes");
  assert.equal(formatMinutes(60), "About an hour");
  assert.equal(formatMinutes(80), "About 1 hour 20");
  assert.equal(formatMinutes(90), "About an hour and a half");
  assert.equal(formatMinutes(120), "About 2 hours");
  assert.equal(formatMinutes(150), "About 2 and a half hours");
  assert.equal(formatMinutes(62), "About an hour"); // 2 min remainder rounds away
});

test("extra time reads as a person would say it", () => {
  assert.equal(formatExtraTime(null), "");
  assert.equal(formatExtraTime({ minutes: 0, label: "chilling" }), "");
  assert.equal(formatExtraTime({ minutes: 30, label: "resting" }), "plus 30 minutes resting");
  assert.equal(formatExtraTime({ minutes: 60, label: "proving" }), "plus an hour proving");
  assert.equal(formatExtraTime({ minutes: 240, label: "chilling" }), "plus 4 hours chilling");
  assert.equal(formatExtraTime({ minutes: 90, label: "chilling" }), "plus an hour and a half chilling");
  assert.equal(formatExtraTime({ minutes: 480, label: "chilling" }), "plus overnight chilling");
  assert.equal(formatExtraTime({ minutes: 720, label: "setting" }), "plus overnight setting");
});

test("timeText joins active and extra time", () => {
  assert.equal(timeText({ prepTime: 20, cookTime: 40, extraTime: { minutes: 240, label: "chilling" } }), "About an hour, plus 4 hours chilling");
  assert.equal(timeText({ prepTime: 20, cookTime: 20 }), "About 40 minutes");
  assert.equal(timeText({ prepTime: 0, cookTime: 0, extraTime: null }), "");
});

test("yieldText handles serves and makes, one and many", () => {
  assert.equal(yieldText({ yieldKind: "serves", servings: 4 }), "Serves 4");
  assert.equal(yieldText({ yieldKind: "serves", servings: 1 }), "Serves 1");
  assert.equal(yieldText({ yieldKind: "makes", servings: 12, yieldNoun: { one: "cookie", other: "cookies" } }), "Makes 12 cookies");
  assert.equal(yieldText({ yieldKind: "makes", servings: 1, yieldNoun: { one: "cake", other: "cakes" } }), "Makes 1 cake");
  assert.equal(yieldText({ yieldKind: "makes", servings: 12 }), "Makes 12");
  assert.equal(yieldText({ yieldKind: "makes", servings: 12, yieldNoun: { one: "cookie", other: "cookies" } }, 0.5), "Makes 6 cookies");
  assert.equal(yieldText({ yieldKind: "makes", servings: 5, yieldNoun: { one: "slice", other: "slices" } }, 0.5), "Makes 2½ slices");
});

test("factsLine is a plain sentence with no middle dots", () => {
  const line = factsLine({ yieldKind: "makes", servings: 12, yieldNoun: { one: "cookie", other: "cookies" }, prepTime: 15, cookTime: 25 });
  assert.equal(line, "Makes 12 cookies. About 40 minutes.");
  assert.ok(!line.includes("·")); // tells-ok
  assert.equal(factsLine({ yieldKind: "serves", servings: 2, prepTime: 0, cookTime: 0 }), "Serves 2.");
  assert.equal(
    factsLine({ yieldKind: "serves", servings: 8, prepTime: 30, cookTime: 30, extraTime: { minutes: 600, label: "chilling" } }),
    "Serves 8. About an hour, plus overnight chilling."
  );
});

test("JSON-LD helpers", () => {
  assert.equal(jsonLdYield({ yieldKind: "serves", servings: 4 }), "4 servings");
  assert.equal(jsonLdYield({ yieldKind: "serves", servings: 1 }), "1 serving");
  assert.equal(jsonLdYield({ yieldKind: "makes", servings: 12, yieldNoun: { one: "cookie", other: "cookies" } }), "12 cookies");
  assert.equal(totalMinutes({ prepTime: 20, cookTime: 40, extraTime: { minutes: 240, label: "chilling" } }), 300);
  assert.equal(isoDuration(90), "PT1H30M");
  assert.equal(isoDuration(120), "PT2H");
  assert.equal(isoDuration(45), "PT45M");
  assert.equal(isoDuration(0), "PT0M");
  assert.equal(plural(1, "note", "notes"), "note");
  assert.equal(plural(2, "note", "notes"), "notes");
});
