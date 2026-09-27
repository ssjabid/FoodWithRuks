import { test } from "node:test";
import assert from "node:assert/strict";
import { OVEN_TABLE, ovenLine } from "../oven.ts";

test("every row of the UK table, non-fan", () => {
  for (const [c, f, gas] of OVEN_TABLE) {
    const line = ovenLine({ tempC: c, fan: false });
    assert.equal(line.primary, `${c}°C`);
    assert.equal(line.fahrenheit, f);
    assert.equal(line.gasMark, gas);
    assert.equal(line.secondary, `${c - 20}°C fan, ${f}°F, gas ${gas}`);
  }
});

test("every row of the UK table, fan (conventional = fan + 20)", () => {
  for (const [c, f, gas] of OVEN_TABLE) {
    const line = ovenLine({ tempC: c - 20, fan: true });
    assert.equal(line.primary, `${c - 20}°C fan`);
    assert.equal(line.conventionalC, c);
    assert.equal(line.secondary, `${c}°C, ${f}°F, gas ${gas}`);
  }
});

test("the three named cases from the brief", () => {
  const a = ovenLine({ tempC: 160, fan: true });
  assert.equal(a.primary, "160°C fan");
  assert.equal(a.secondary, "180°C, 350°F, gas 4");
  const b = ovenLine({ tempC: 180, fan: false });
  assert.equal(b.primary, "180°C");
  assert.equal(b.secondary, "160°C fan, 350°F, gas 4");
  const c = ovenLine({ tempC: 100, fan: true }); // meringues
  assert.equal(c.primary, "100°C fan");
  assert.equal(c.secondary, "120°C, 250°F, gas ½");
  const d = ovenLine({ tempC: 220, fan: true });
  assert.equal(d.secondary, "240°C, 475°F, gas 9");
});

test("snaps to the nearest row within 5 degrees, otherwise celsius only", () => {
  assert.equal(ovenLine({ tempC: 178, fan: false }).gasMark, "4");
  assert.equal(ovenLine({ tempC: 165, fan: false }).gasMark, "3"); // 160 and 170 both gas 3
  const outside = ovenLine({ tempC: 100, fan: false }); // 100 conventional is 10 away from 110
  assert.equal(outside.fahrenheit, null);
  assert.equal(outside.gasMark, null);
  assert.equal(outside.secondary, "80°C fan");
  const hot = ovenLine({ tempC: 260, fan: false });
  assert.equal(hot.secondary, "240°C fan");
});
