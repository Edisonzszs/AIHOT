// Backfills daily and weekly issues in a key range by composing each one from its own window,
// e.g. after a bulk import of historical material. Existing issues are regenerated (revision+1),
// windows with nothing selected are skipped with a log line.
//   node scripts/backfill-reports.ts <first-daily> <last-daily> [--weeks 2026-W40,2026-W41]
import { closeDb } from "@aihot/backend/db";
import { composeDaily, composeWeekly } from "@aihot/backend/reports/compose";
import { isoWeekRange } from "@aihot/contracts/time";

const [first, last] = process.argv.slice(2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(first ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(last ?? "") || first > last) {
  console.error("usage: node scripts/backfill-reports.ts <first-daily> <last-daily> [--weeks 2026-W40,2026-W41]");
  process.exit(1);
}

for (let key = first; ; key = new Date(Date.parse(`${key}T00:00:00Z`) + 86400000).toISOString().slice(0, 10)) {
  try {
    const r = await composeDaily(key, "manual");
    console.log(JSON.stringify({ report: `daily:${key}`, entries: r.entries }));
  } catch (error) {
    console.log(JSON.stringify({ report: `daily:${key}`, skipped: String(error).slice(0, 160) }));
  }
  if (key >= last) break;
}

const weeksArg = process.argv.find((a) => a.startsWith("--weeks")) ?? "";
for (const label of weeksArg.split("=")[1]?.split(",") ?? []) {
  const range = isoWeekRange(label);
  if (!range) continue;
  try {
    const r = await composeWeekly(label, "manual");
    console.log(JSON.stringify({ report: `weekly:${label}`, range: `${range.start}..${range.end}`, entries: r.entries }));
  } catch (error) {
    console.log(JSON.stringify({ report: `weekly:${label}`, skipped: String(error).slice(0, 160) }));
  }
}

await closeDb();
