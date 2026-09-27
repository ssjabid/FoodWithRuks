/**
 * The oven line. She types one temperature and whether it is fan; the site shows
 * her setting first, then the conversions: "160°C fan" / "180°C, 350°F, gas 4".
 * Conventional = fan + 20°C. °F and gas mark come from the UK conventional-oven
 * table, snapping to the nearest row; outside the table only °C is shown.
 * Dependency-free so node:test can import it directly.
 */

export interface OvenSetting {
  tempC: number;
  fan: boolean;
}

export interface OvenLine {
  /** Her setting: "220°C fan" or "200°C" */
  primary: string;
  /** The rest: "240°C, 475°F, gas 9" */
  secondary: string;
  conventionalC: number;
  fanC: number;
  fahrenheit: number | null;
  gasMark: string | null;
}

/** UK conventional-oven table: °C -> [°F, gas] */
export const OVEN_TABLE: ReadonlyArray<readonly [number, number, string]> = [
  [110, 225, "¼"],
  [120, 250, "½"],
  [140, 275, "1"],
  [150, 300, "2"],
  [160, 325, "3"],
  [170, 325, "3"],
  [180, 350, "4"],
  [190, 375, "5"],
  [200, 400, "6"],
  [220, 425, "7"],
  [230, 450, "8"],
  [240, 475, "9"],
];

const FAN_OFFSET = 20;
const SNAP_TOLERANCE = 5; // within 5°C of a row counts as that row

export function conventionalFrom(setting: OvenSetting): number {
  return setting.fan ? setting.tempC + FAN_OFFSET : setting.tempC;
}

export function fanFrom(setting: OvenSetting): number {
  return setting.fan ? setting.tempC : setting.tempC - FAN_OFFSET;
}

function nearestRow(conventionalC: number): (readonly [number, number, string]) | null {
  let best: (readonly [number, number, string]) | null = null;
  let bestDiff = Infinity;
  for (const row of OVEN_TABLE) {
    const diff = Math.abs(row[0] - conventionalC);
    if (diff < bestDiff) {
      best = row;
      bestDiff = diff;
    }
  }
  return best && bestDiff <= SNAP_TOLERANCE ? best : null;
}

export function ovenLine(setting: OvenSetting): OvenLine {
  const conventionalC = conventionalFrom(setting);
  const fanC = fanFrom(setting);
  const row = nearestRow(conventionalC);
  const fahrenheit = row ? row[1] : null;
  const gasMark = row ? row[2] : null;

  const primary = setting.fan ? `${setting.tempC}°C fan` : `${setting.tempC}°C`;
  const rest: string[] = [];
  if (setting.fan) rest.push(`${conventionalC}°C`);
  else rest.push(`${fanC}°C fan`);
  if (fahrenheit !== null) rest.push(`${fahrenheit}°F`);
  if (gasMark !== null) rest.push(`gas ${gasMark}`);

  return { primary, secondary: rest.join(", "), conventionalC, fanC, fahrenheit, gasMark };
}
