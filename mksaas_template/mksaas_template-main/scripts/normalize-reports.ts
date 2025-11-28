#!/usr/bin/env tsx
/**
 * Normalize historical reports:
 * - Convert '--- + heading' style to '## heading'
 * - Convert 'paragraph + list' headings to '## heading'
 * - Convert ==highlight== to <mark>highlight</mark>
 * - Auto emphasize line-start tips: 结论/注意/建议/步骤 → **结论：**
 *
 * Dry run: tsx scripts/normalize-reports.ts
 * Apply  : tsx scripts/normalize-reports.ts --write
 */
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';

const WRITE = process.argv.includes('--write');
const REPORTS_DIR = path.join(process.cwd(), 'content', 'reports');

function preprocess(input: string): string {
  let md = input;
  // ==highlight==
  md = md.replace(/==([^=\n]+)==/g, (_m, p1) => `<mark>${p1}</mark>`);
  // Tips
  const tipLabels = ['结论', '注意', '建议', '步骤'];
  const tipRegex = new RegExp(
    String.raw`(^|\n)([ \t]*[-*+]\s*)?(${tipLabels.join('|')})[:：]\s*`,
    'g'
  );
  md = md.replace(tipRegex, (_m, pfx, listPrefix = '', label) => {
    const prefix = pfx || '\n';
    return `${prefix}${listPrefix || ''}<mark>**${label}：**</mark> `;
  });
  // '--- + heading' → '## heading'
  md = md.replace(
    /\n-{3,}\s*\n([^\n]{2,80})\n/g,
    (_m, title) => `\n\n## ${String(title).trim()}\n`
  );
  // 'paragraph + list' → '## paragraph'
  md = md.replace(
    /(^|\n)([^\n]{2,80})\n([ \t]*[-*+]\s+)/g,
    (_m, p1, heading, listPrefix) => {
      if (/^\s*#{1,6}\s/.test(heading)) return `${p1}${heading}\n${listPrefix}`;
      return `${p1}## ${String(heading).trim()}\n${listPrefix}`;
    }
  );
  return md;
}

async function main() {
  const files = (await fs.readdir(REPORTS_DIR)).filter((f) =>
    f.endsWith('.mdx')
  );
  const changes: { file: string; before: number; after: number }[] = [];

  for (const f of files) {
    const p = path.join(REPORTS_DIR, f);
    const raw = await fs.readFile(p, 'utf-8');
    const next = preprocess(raw);
    if (next !== raw) {
      changes.push({ file: f, before: raw.length, after: next.length });
      if (WRITE) await fs.writeFile(p, next, 'utf-8');
    }
  }

  console.log(
    `Normalize reports: ${WRITE ? 'WRITE' : 'DRY'} changed=${changes.length}/${files.length}`
  );
  for (const c of changes.slice(0, 20)) {
    console.log(` - ${c.file} (${c.before} -> ${c.after})`);
  }
  if (changes.length > 20) console.log(` ... (${changes.length - 20} more)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
