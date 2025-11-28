#!/usr/bin/env tsx
/**
 * Retitle Knowledge Category
 *
 * For a given category slug, iterate all MDX files and replace generic titles
 * like "今日要点速记/小结/关键收获/相关资源链接" with AI-suggested concise titles
 * (using OpenRouter if available) or a heuristic fallback extracted from content.
 *
 * Usage:
 *  - Dry run:  tsx scripts/retitle-knowledge-category.ts --slug dev-tools
 *  - Apply:    tsx scripts/retitle-knowledge-category.ts --slug dev-tools --write
 */

import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { enrichTopics } from '../src/actions/enrich-topics';
import { normalizeTitle } from '../src/lib/report-parser';

const args = new Map<string, string | true>();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const [k, v] = a.split('=');
    args.set(k, v ?? true);
  }
}
const slug = (args.get('--slug') as string) || '';
const DRY_RUN = !args.has('--write');
const MAX_LEN = (() => {
  const v = args.get('--max');
  const n = typeof v === 'string' ? Number.parseInt(v, 10) : Number.NaN;
  return Number.isFinite(n) && n > 0 ? n : 10;
})();

if (!slug) {
  console.error('Missing --slug <category-slug>');
  process.exit(1);
}

const BASE = path.join(process.cwd(), 'content', 'knowledge', slug);

function isGenericTitle(title: string): boolean {
  const t = title.trim();
  const patterns = [
    /^今日(要点|要点速记|小结|总结|关键|关键收获)/,
    /^相关(资源|链接)/,
    /^今日/,
    /^本期/,
  ];
  return patterns.some((re) => re.test(t));
}

function parseFrontmatter(text: string): {
  fm: Record<string, string>;
  body: string;
} {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const fmLines = m[1].split('\n');
  const fm: Record<string, string> = {};
  for (const line of fmLines) {
    const kv = line.match(/^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return { fm, body: m[2] ?? '' };
}

function stringifyFrontmatter(fm: Record<string, string>) {
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

function fallbackFromBody(body: string): string {
  // Take first meaningful line as title candidate
  const lines = body.split('\n').map((l) => l.trim());
  const candidates = lines.filter(
    (l) =>
      l &&
      !l.startsWith('>') &&
      !l.startsWith('---') &&
      !l.startsWith('#') &&
      !/本文摘自|\[更多|\[查看原日报/.test(l)
  );
  if (candidates.length === 0) return '';
  // Prefer bullet content
  const pick =
    candidates.find((l) => l.startsWith('- ') || l.startsWith('• ')) ||
    candidates[0];
  let s = pick
    .replace(/^[•\-]\s*/, '')
    .replace(/[*`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  s = normalizeTitle(s);
  if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN);
  return s;
}

async function main() {
  const exists = await fs
    .stat(BASE)
    .then((s) => s.isDirectory())
    .catch(() => false);
  if (!exists) {
    console.error('Category not found:', BASE);
    process.exit(1);
  }
  const files = (await fs.readdir(BASE)).filter((f) => f.endsWith('.mdx'));
  const changes: { file: string; oldTitle: string; newTitle: string }[] = [];

  for (const f of files) {
    const p = path.join(BASE, f);
    const raw = await fs.readFile(p, 'utf-8');
    const { fm, body } = parseFrontmatter(raw);
    const oldTitle = (fm.title || '').trim();
    if (!oldTitle) continue;
    if (!isGenericTitle(oldTitle)) continue;

    // Ask AI for a concise title; fallback to normalized content-extracted
    let suggested = '';
    try {
      const res = await enrichTopics([{ title: oldTitle, content: body }]);
      suggested = (res[0]?.suggestedTitle || '').trim();
    } catch {
      // ignore
    }
    // If AI suggestion contains generic words, prefer fallback
    if (!suggested || /本文摘自|日报|今日要点|小结|总结/.test(suggested)) {
      const fb = fallbackFromBody(body);
      suggested = fb || normalizeTitle(oldTitle);
    }
    if (!suggested || suggested === oldTitle) continue;

    fm.title = suggested;
    const next = stringifyFrontmatter(fm) + body;
    if (!DRY_RUN) await fs.writeFile(p, next, 'utf-8');
    changes.push({ file: path.join(slug, f), oldTitle, newTitle: suggested });
  }

  console.log(`Retitle ${slug}: ${DRY_RUN ? 'DRY' : 'WRITE'}`);
  console.log(`Files updated: ${changes.length}`);
  for (const c of changes) {
    console.log(` - ${c.file}: "${c.oldTitle}" -> "${c.newTitle}"`);
  }
  if (DRY_RUN) console.log('Run with --write to apply.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
