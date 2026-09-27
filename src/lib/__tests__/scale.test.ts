import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAmount, parseAmount, roundAmount, scaleAmount } from "../scale.ts";

test("parseAmount reads what people type", () => {
  assert.equal(parseAmount("2"), 2);
  assert.equal(parseAmount("1.5"), 1.5);
  assert.equal(parseAmount("1/2"), 0.5);
  assert.equal(parseAmount("1 1/2"), 1.5);
  assert.equal(parseAmount("½"), 0.5);
  assert.equal(parseAmount("1½"), 1.5);
  assert.equal(parseAmount("2-3"), null); // ranges are left alone
  assert.equal(parseAmount("a pinch"), null);
  assert.equal(parseAmount(""), null);
});

test("formatAmount uses real fraction glyphs", () => {
  assert.equal(formatAmount(0.25), "¼");
  assert.equal(formatAmount(0.5), "½");
  assert.equal(formatAmount(0.75), "¾");
  assert.equal(formatAmount(1 / 3), "⅓");
  assert.equal(formatAmount(2 / 3), "⅔");
  assert.equal(formatAmount(1.5), "1½");
  assert.equal(formatAmount(2), "2");
  assert.equal(formatAmount(0.3), "0.3");
});

test("rounding rules", () => {
  assert.equal(roundAmount(112.5, "whole"), 113);
  assert.equal(roundAmount(37.4, "whole"), 37);
  assert.equal(roundAmount(0.6, "quarter"), 0.5);
  assert.equal(roundAmount(1.3, "half"), 1.5);
  assert.equal(roundAmount(1.26, "decimal"), 1.3);
});

test("scaleAmount by unit and name", () => {
  assert.deepEqual(scaleAmount("225", 0.5, "g", "flour"), { text: "113" });
  assert.deepEqual(scaleAmount("225", 2, "g", "flour"), { text: "450" });
  assert.deepEqual(scaleAmount("115", 3, "g", "butter"), { text: "345" });
  assert.deepEqual(scaleAmount("1", 0.5, "tbsp", "vanilla"), { text: "½" });
  assert.deepEqual(scaleAmount("1", 1.5, "tsp", "salt"), { text: "1½" });
  assert.deepEqual(scaleAmount("3", 0.5, "", "eggs"), { text: "1½", note: "(beaten, use half)" });
  assert.deepEqual(scaleAmount("2", 2, "", "large eggs"), { text: "4" });
  assert.deepEqual(scaleAmount("2-3", 2, "", "apples"), { text: "2-3" }); // untouched
  assert.deepEqual(scaleAmount("200", 1, "g", "sugar"), { text: "200" });
  assert.deepEqual(scaleAmount("1", 0.5, "g", "salt"), { text: "1" }); // never rounds to nothing
});
