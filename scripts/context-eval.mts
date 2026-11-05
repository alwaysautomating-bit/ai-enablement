// Run the synthetic Context Capture evaluation on a throwaway database.
//   npm run context:eval                         # extractor from configuration
//   npm run context:eval -- --extractor openai   # anthropic | openai | recorded
// Writes a JSON report to output/context-eval/.

import { config } from "dotenv";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

config({ quiet: true });

const { selectExtractionModel } = await import("../src/lib/context/extraction/select");
const { createScratchDatabase } = await import("../src/lib/context/eval/test-db");
const { evaluate, formatReport } = await import("../src/lib/context/eval/evaluate");

const { values } = parseArgs({
  options: {
    extractor: { type: "string" },
    gold: { type: "string" },
  },
});

const { sameFixturePath } = await import("../src/lib/context/pork");
const model = selectExtractionModel(values.extractor);
const goldPath = values.gold ?? sameFixturePath("gold.json");
const { db } = createScratchDatabase();
const started = Date.now();
const report = await evaluate({ db, model, goldPath });
await db.$disconnect();

console.log(formatReport(report));
console.log(`\nFinished in ${((Date.now() - started) / 1000).toFixed(1)}s.`);

const directory = join("output", "context-eval");
mkdirSync(directory, { recursive: true });
const file = join(directory, `${new Date().toISOString().replace(/[:.]/g, "-")}-${model.id.replace(/[^a-z0-9.-]+/gi, "_")}.json`);
writeFileSync(file, JSON.stringify(report, null, 2));
console.log(`Report: ${file}`);
process.exitCode = report.passed ? 0 : 1;
