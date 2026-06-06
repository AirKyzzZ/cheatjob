// Usage: npm run seed:blog [count]   (default 3). Writes validated posts to
// content/blog/ locally for review. No GitHub commit, no deploy. Needs
// OPENROUTER_API_KEY in web/.env.
import path from "node:path";
import { runBlogPipeline } from "../src/server/blog/pipeline";

const count = Number(process.argv[2] ?? "3");
const contentDir = path.join(process.cwd(), "content", "blog");
const date = new Date().toISOString().slice(0, 10);

async function main() {
  for (let i = 0; i < count; i++) {
    const result = await runBlogPipeline(date, { contentDir, dryRun: true });
    console.log(JSON.stringify(result));
    if (result.status === "skipped") break;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
