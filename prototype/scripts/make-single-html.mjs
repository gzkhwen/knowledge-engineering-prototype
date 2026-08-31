import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, basename } from "node:path";

const root = resolve(process.cwd(), "dist");
const indexPath = resolve(root, "index.html");
let html = await readFile(indexPath, "utf8");

const assetPattern = /(?:src|href)="(\.\/assets\/[^\"]+)"/g;
const assets = [...html.matchAll(assetPattern)];

for (const match of assets) {
  const reference = match[1];
  const assetPath = resolve(root, reference.replace(/^\.\//, ""));
  const content = await readFile(assetPath);
  const fileName = basename(assetPath);

  if (fileName.endsWith(".css")) {
    const style = content.toString("utf8").replaceAll("</style", "<\\/style");
    html = html.replace(
      `<link rel="stylesheet" crossorigin href="${reference}">`,
      `<style data-source="${fileName}">${style}</style>`,
    );
  } else if (fileName.endsWith(".js")) {
    // Escape "</script" and "<!--" inside the bundle: the HTML parser would
    // otherwise terminate the inline script element at the first occurrence.
    const script = content.toString("utf8").replaceAll("</script", "<\\/script").replaceAll("<!--", "<\\!--");
    html = html.replace(
      `<script type="module" crossorigin src="${reference}"></script>`,
      // The bundle is self-contained; classic scripts also work when opened via file://.
      `<script>${script}</script>`,
    );
  }
}

// The generated file is intentionally separate so normal dist/ deployments remain unchanged.
const outputPath = resolve(root, "knowledge-engineer-prototype-single.html");
await writeFile(outputPath, html, "utf8");
console.log(`Single-file prototype written to ${outputPath}`);
