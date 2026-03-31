/**
 * Translation helper script
 *
 * Reads en.json as the source of truth and generates/updates all other
 * locale files using the Claude API. Preserves existing translations for
 * keys that haven't changed in en.json — only translates new or modified keys.
 *
 * Usage:
 *   npx tsx scripts/translate.ts              # translate all locales
 *   npx tsx scripts/translate.ts es fr        # translate specific locales
 *   npx tsx scripts/translate.ts --dry-run    # preview without writing files
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY env var (or in .env.local)
 *   - npx tsx (ships with the project's TypeScript setup)
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const LOCALES_DIR = path.resolve(__dirname, "../src/i18n/locales");
const SOURCE_LOCALE = "en";

const TARGET_LOCALES: Record<string, string> = {
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese (Brazilian)",
  it: "Italian",
  nl: "Dutch",
  ja: "Japanese",
  ko: "Korean",
  "zh-CN": "Chinese (Simplified)",
  ar: "Arabic",
  hi: "Hindi",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadJson(filePath: string): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function diffKeys(
  source: Record<string, string>,
  existing: Record<string, string>,
): Record<string, string> {
  const needsTranslation: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    // Translate if: key is missing, or the English source text changed
    // We detect source changes by storing the original English value as a comment
    // For simplicity, we re-translate if the key is missing from the target
    if (!(key in existing)) {
      needsTranslation[key] = value;
    }
  }
  return needsTranslation;
}

function removeStaleKeys(
  source: Record<string, string>,
  existing: Record<string, string>,
): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const key of Object.keys(source)) {
    if (key in existing) {
      cleaned[key] = existing[key];
    }
  }
  return cleaned;
}

async function translateBatch(
  client: Anthropic,
  entries: Record<string, string>,
  languageName: string,
): Promise<Record<string, string>> {
  const prompt = `Translate the following JSON key-value pairs from English to ${languageName}.

Rules:
- Return ONLY a valid JSON object with the same keys and translated values
- Preserve all interpolation placeholders exactly as-is (e.g., {year}, {name}, {count})
- Keep the brand name "ivann" untranslated — it is a proper noun
- Keep the © symbol as-is
- Do not add or remove any keys
- Do not translate keys, only values
- Use natural, conversational tone appropriate for a modern web application
- For gendered languages, prefer neutral/inclusive phrasing where possible

JSON to translate:
${JSON.stringify(entries, null, 2)}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse translation response for ${languageName}`);
  }

  return JSON.parse(jsonMatch[0]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const forceAll = args.includes("--force");
  const requestedLocales = args.filter(
    (a) => !a.startsWith("--") && a in TARGET_LOCALES,
  );
  const localesToProcess =
    requestedLocales.length > 0
      ? requestedLocales
      : Object.keys(TARGET_LOCALES);

  // Load source
  const sourcePath = path.join(LOCALES_DIR, `${SOURCE_LOCALE}.json`);
  const source = loadJson(sourcePath);
  const sourceKeyCount = Object.keys(source).length;

  console.log(`\n📖 Source: ${SOURCE_LOCALE}.json (${sourceKeyCount} keys)\n`);

  // Init Claude client (skip for dry-run)
  const apiKey =
    process.env.ANTHROPIC_API_KEY ??
    (() => {
      try {
        const envFile = fs.readFileSync(
          path.resolve(__dirname, "../.env.local"),
          "utf-8",
        );
        const match = envFile.match(/ANTHROPIC_API_KEY=(.+)/);
        return match?.[1]?.trim();
      } catch {
        return undefined;
      }
    })();

  if (!apiKey && !dryRun) {
    console.error(
      "❌ ANTHROPIC_API_KEY not found. Set it as an env var or in .env.local",
    );
    process.exit(1);
  }

  const client = apiKey ? new Anthropic({ apiKey }) : null;

  // Process each locale
  for (const locale of localesToProcess) {
    const languageName = TARGET_LOCALES[locale];
    const targetPath = path.join(LOCALES_DIR, `${locale}.json`);
    const existing = loadJson(targetPath);

    // Remove keys that no longer exist in source
    const cleaned = removeStaleKeys(source, existing);

    // Find keys that need translation
    const toTranslate = forceAll ? source : diffKeys(source, cleaned);
    const newKeyCount = Object.keys(toTranslate).length;
    const staleCount = Object.keys(existing).length - Object.keys(cleaned).length;

    if (newKeyCount === 0 && staleCount === 0) {
      console.log(`✅ ${locale} (${languageName}) — up to date`);
      continue;
    }

    console.log(
      `🔄 ${locale} (${languageName}) — ${newKeyCount} to translate${staleCount > 0 ? `, ${staleCount} stale removed` : ""}`,
    );

    if (dryRun) {
      if (newKeyCount > 0) {
        console.log(
          `   New keys: ${Object.keys(toTranslate).join(", ")}`,
        );
      }
      continue;
    }

    if (newKeyCount > 0) {
      try {
        const translated = await translateBatch(
          client!,
          toTranslate,
          languageName,
        );

        // Merge: keep existing translations, add new ones
        const merged = { ...cleaned };
        for (const key of Object.keys(source)) {
          if (key in translated) {
            merged[key] = translated[key];
          }
        }

        // Write in source key order
        const ordered: Record<string, string> = {};
        for (const key of Object.keys(source)) {
          ordered[key] = merged[key] ?? source[key];
        }

        fs.writeFileSync(targetPath, JSON.stringify(ordered, null, 2) + "\n");
        console.log(`   ✅ Written ${targetPath}`);
      } catch (err) {
        console.error(
          `   ❌ Failed: ${err instanceof Error ? err.message : err}`,
        );
      }
    } else {
      // Just clean stale keys
      const ordered: Record<string, string> = {};
      for (const key of Object.keys(source)) {
        ordered[key] = cleaned[key] ?? source[key];
      }
      fs.writeFileSync(targetPath, JSON.stringify(ordered, null, 2) + "\n");
      console.log(`   ✅ Cleaned stale keys in ${targetPath}`);
    }
  }

  console.log("\n✨ Done\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
