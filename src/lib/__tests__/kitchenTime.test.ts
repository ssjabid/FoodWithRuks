import { test } from "node:test";
import assert from "node:assert/strict";
import { kitchenSlot, londonHour } from "../kitchenTime.ts";

// September: London is BST (UTC+1)
const at = (utcHour: number) => new Date(Date.UTC(2026, 8, 26, utcHour, 30));

test("londonHour applies the London offset", () => {
  assert.equal(londonHour(at(11)), 12);
  assert.equal(londonHour(at(23)), 0);
});

test("slots", () => {
  assert.equal(kitchenSlot(at(4)), "morning"); // 05:30 London
  assert.equal(kitchenSlot(at(10)), "morning");
  assert.equal(kitchenSlot(at(11)), "afternoon"); // 12:30
  assert.equal(kitchenSlot(at(15)), "afternoon");
  assert.equal(kitchenSlot(at(16)), "evening"); // 17:30
  assert.equal(kitchenSlot(at(20)), "evening");
  assert.equal(kitchenSlot(at(21)), "late"); // 22:30
  assert.equal(kitchenSlot(at(2)), "late");
});
