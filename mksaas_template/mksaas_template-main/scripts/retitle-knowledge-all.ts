#!/usr/bin/env tsx
/**
 * Retitle all knowledge categories to concise titles (default <=10 chars)
 *
 * Usage:
 *  - Dry run: tsx scripts/retitle-knowledge-all.ts
 *  - Apply:   tsx scripts/retitle-knowledge-all.ts --write
 */
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { enrichTopics } from '../src/actions/enrich-topics';
import { normalizeTitle } from '../src/lib/report-parser';

const BASE = path.join(process.cwd(), 'content', 'knowledge');
const DRY = !process.argv.includes('--write');
const MAX_LEN = 10;

function parseFrontmatter(text: string): { fm: Record<string, string>; body: string } {
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
function isGeneric(title: string): boolean {
  const t = title.trim();
  const re = /^(今日|本期)(要点|要点速记|小结|总结)|^相关(资源|链接)/;
  return re.test(t);
}
function fallbackFromBody(body: string): string {
  const lines = body.split('\n').map((l) => l.trim());
  const candidates = lines.filter(
    (l) =>
      l &&
      !l.startsWith('>') &&
      !l.startsWith('---') &&
      !l.startsWith('#') &&
      !/本文摘自|\[更多|\[查看原日报/.test(l),
  );
  if (candidates.length === 0) return '';
  let pick = candidates.find((l) => l.startsWith('- ') || l.startsWith('• ')) || candidates[0];
  let s = pick.replace(/^[•\-]\s*/, '').replace(/[*`_~]/g, '').replace(/\s+/g, ' ').trim();
  s = normalizeTitle(s);
  if (s.length > MAX_LEN) s = s.slice(0, MAX_LEN);
  return s;
}

async function processFile(p: string) {
  const raw = await fs.readFile(p, 'utf-8');
  const { fm, body } = parseFrontmatter(raw);
  const oldTitle = (fm.title || '').trim();
  if (!oldTitle) return null;
  if (!isGeneric(oldTitle)) return null;
  // AI + fallback
  let suggested = '';
  try {
    const res = await enrichTopics([{ title: oldTitle, content: body }]);
    suggested = (res[0]?.suggestedTitle || '').trim();
  } catch {}
  if (!suggested || /本文摘自|日报|今日要点|小结|总结/.test(suggested)) {
    suggested = fallbackFromBody(body) || normalizeTitle(oldTitle);
  }
  if (!suggested) return null;
  if (suggested.length > MAX_LEN) suggested = suggested.slice(0, MAX_LEN);
  if (suggested === oldTitle) return null;
  fm.title = suggested;
  const next = stringifyFrontmatter(fm) + body;
  if (!DRY) await fs.writeFile(p, next, 'utf-8');
  return { file: p, oldTitle, newTitle: suggested };
}

async function main() {
  const dirs = await fs.readdir(BASE, { withFileTypes: true });
  const categories = dirs.filter((d) => d.isDirectory()).map((d) => d.name);
  const changes: { file: string; oldTitle: string; newTitle: string }[] = [];

  for (const c of categories) {
    const catDir = path.join(BASE, c);
    const files = (await fs.readdir(catDir)).filter((f) => f.endsWith('.mdx'));
    for (const f of files) {
      const res = await processFile(path.join(catDir, f));
      if (res) changes.push({ ...res, file: path.join(c, path.basename(res.file)) });
    }
  }
  console.log(`Retitle ALL: ${DRY ? 'DRY' : 'WRITE'}`);
  console.log(`Files updated: ${changes.length}`);
  for (const c of changes) {
    console.log(` - ${c.file}: "${c.oldTitle}" -> "${c.newTitle}"`);
  }
  if (DRY) console.log('Run with --write to apply.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

