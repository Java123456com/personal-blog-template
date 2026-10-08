import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readContentEntries } from "./content.mjs";

const entries = readContentEntries().filter((entry) => entry.type === "article");
mkdirSync(join(process.cwd(), "public"), { recursive: true });
writeFileSync(join(process.cwd(), "public", "search-index.json"), JSON.stringify({ entries }), "utf8");
console.log(`Generated search index for ${entries.length} published articles.`);
