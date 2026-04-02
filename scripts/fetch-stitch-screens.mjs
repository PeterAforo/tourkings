/**
 * Downloads HTML + screenshot for each Stitch screen (official SDK).
 * Run: node scripts/fetch-stitch-screens.mjs
 * Requires STITCH_API_KEY in .env — plain curl cannot access Stitch without auth.
 */
import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { stitch } from "@google/stitch-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

const PROJECT_ID = "472183968247023846";

const SCREENS = [
  { id: "36009b01f0a842cfbad5734d5313c4e9", slug: "01-login-page", title: "Login Page" },
  { id: "a19ed1991fa64a69a5a508e88d708753", slug: "02-sign-up-page", title: "Sign Up Page" },
  { id: "1d0eb15940524056b0214c3299d684ec", slug: "03-forgot-password", title: "Forgot Password" },
  { id: "59a691618f8748f496c341280af71137", slug: "04-site-management-cms", title: "Site Management CMS" },
  { id: "4c38d23b20be44cfbef79f0165f8c12e", slug: "05-cms-vault-manager", title: "CMS Vault Manager" },
  { id: "3ed6dfd195ef4103992ebe2c93427728", slug: "06-checkout-contribution-flow", title: "Checkout & Contribution Flow" },
  { id: "522df0e7a5e443f0becd1c88891d443e", slug: "07-vault-dashboard", title: "The Vault Dashboard" },
  { id: "1ab73a8129e24ac28ff971d66d113cc0", slug: "08-vault-transaction-history", title: "Vault Transaction History & Insights" },
  { id: "0358dcd625594e5ba9a4e49d0a12c786", slug: "09-heritage-path-my-journey", title: "Heritage Path: My Journey" },
  { id: "369023e1f1af4dde82708c1f5c2ae52e", slug: "10-user-profile-heritage-path", title: "User Profile & Heritage Path" },
];

async function downloadUrl(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url.slice(0, 80)}… → ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function main() {
  if (!process.env.STITCH_API_KEY?.trim()) {
    console.error(
      "Missing STITCH_API_KEY in .env — see https://stitch.withgoogle.com/docs\n" +
        "Stitch assets are not public; use this script (or the SDK) instead of raw curl."
    );
    process.exit(1);
  }

  const root = join(process.cwd(), "stitch-export", "TourKings-PRD-Roadmap");
  await mkdir(root, { recursive: true });

  const project = stitch.project(PROJECT_ID);
  const indexLines = [
    "# TourKings PRD & Roadmap — Stitch export",
    "",
    `Project ID: \`${PROJECT_ID}\``,
    "",
    "| # | Screen | Folder |",
    "|---|--------|--------|",
  ];

  for (let i = 0; i < SCREENS.length; i++) {
    const s = SCREENS[i];
    const dir = join(root, s.slug);
    await mkdir(dir, { recursive: true });
    process.stdout.write(`[${i + 1}/${SCREENS.length}] ${s.title}… `);
    try {
      const screen = await project.getScreen(s.id);
      const htmlUrl = await screen.getHtml();
      const imgUrl = await screen.getImage();
      if (!htmlUrl || !imgUrl) throw new Error("Empty download URL from Stitch");
      await downloadUrl(htmlUrl, join(dir, "screen.html"));
      await downloadUrl(imgUrl, join(dir, "screen.png"));
      await writeFile(
        join(dir, "meta.json"),
        JSON.stringify({ title: s.title, screenId: s.id, projectId: PROJECT_ID }, null, 2)
      );
      indexLines.push(`| ${i + 1} | ${s.title} | \`${s.slug}/\` |`);
      console.log("ok");
    } catch (e) {
      console.log("failed");
      console.error(e);
      indexLines.push(`| ${i + 1} | ${s.title} | ERROR |`);
    }
  }

  await writeFile(join(root, "INDEX.md"), indexLines.join("\n") + "\n");
  console.log(`\nDone. Files under: ${root}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
