#!/usr/bin/env tsx
/**
 * Audit knowledge base for misclassification and generic titles
 *
 * Usage:
 *   tsx scripts/audit-knowledge.ts
 */
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { suggestCategoryByKeywords, STATIC_CATEGORIES } from '../src/config/knowledge-categories';

const BASE = path.join(process.cwd(), 'content', 'knowledge');

function isGeneric(title: string): boolean {
  const t = title.trim();
  const re = /^(今日|本期)(要点|要点速记|小结|总结)|^相关(资源|链接)/;
  return re.test(t);
}
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

async function main() {
  const dirs = await fs.readdir(BASE, { withFileTypes: true });
  const cats = dirs.filter((d) => d.isDirectory()).map((d) => d.name);
  const suggestions: { file: string; from: string; to: string; confidence: number }[] = [];
  const genericTitles: string[] = [];

  for (const c of cats) {
    const catDir = path.join(BASE, c);
    const files = (await fs.readdir(catDir)).filter((f) => f.endsWith('.mdx'));
    for (const f of files) {
      const p = path.join(catDir, f);
      const raw = await fs.readFile(p, 'utf-8');
      const { fm, body } = parseFrontmatter(raw);
      const title = (fm.title || path.basename(f, '.mdx')).toString();
      if (isGeneric(title)) genericTitles.push(path.join(c, f));
      const { category, confidence } = suggestCategoryByKeywords(`${title}\n${body.slice(0, 800)}`);
      if (category && category.slug !== c && confidence >= 0.6) {
        suggestions.push({
          file: path.join(c, f),
          from: c,
          to: category.slug,
          confidence,
        });
      }
    }
  }

  console.log('==== Audit Report ====');
  console.log('Generic titles:');
  genericTitles.slice(0, 50).forEach((f) => console.log(' -', f));
  if (genericTitles.length > 50) console.log(` ... (${genericTitles.length - 50} more)`);
  console.log('');
  console.log('Likely misclassified (confidence>=0.6):');
  suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 50)
    .forEach((s) => console.log(` - ${s.file}  from:${s.from} -> to:${s.to} (${s.confidence.toFixed(2)})`));
  if (suggestions.length > 50) console.log(` ... (${suggestions.length - 50} more)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

