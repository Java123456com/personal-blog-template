import { existsSync, unlinkSync, rmdirSync } from "node:fs";
import { resolve, join } from "node:path";

// Next.js requires a parameter to export an otherwise empty dynamic route.
// Its reserved 404 placeholder is a build detail and must not be published.
const placeholder = resolve("out/moments/tech/__empty");
if (existsSync(placeholder)) {
  for (const filename of ["index.html", "index.txt"]) {
    const file = join(placeholder, filename);
    if (existsSync(file)) unlinkSync(file);
  }
  rmdirSync(placeholder);
}
