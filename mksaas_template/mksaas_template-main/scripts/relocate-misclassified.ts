#!/usr/bin/env tsx
/**
 * Relocate misclassified knowledge docs by keyword classification
 *
 * Usage:
 *  - Dry run (default): tsx scripts/relocate-misclassified.ts --min=0.8
 *  - Apply:             tsx scripts/relocate-misclassified.ts --min=0.8 --write
 */
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import {
  STATIC_CATEGORIES,
  suggestCategoryByKeywords,
} from '../src/config/knowledge-categories';

const BASE = path.join(process.cwd(), 'content', 'knowledge');

function parseArgs() {
  const args = new Map<string, string | true>();
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.split('=');
      args.set(k, v ?? true);
    }
  }
  const min = Number(args.get('--min') ?? '0.8');
  const write = args.has('--write');
  return { min: Number.isFinite(min) ? min : 0.8, write };
}

function parseFM(text: string): { fm: Record<string, string>; body: string } {
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
function stringifyFM(fm: Record<string, string>) {
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}
async function readMeta(dir: string) {
  const p = path.join(dir, 'meta.json');
  try {
    const t = await fs.readFile(p, 'utf-8');
    return { path: p, meta: JSON.parse(t) as any };
  } catch {
    return { path: p, meta: { pages: [] } };
  }
}
async function writeMeta(p: string, meta: any) {
  await fs.writeFile(p, JSON.stringify(meta, null, 2), 'utf-8');
}

async function main() {
  const { min, write } = parseArgs();
  const dirs = await fs.readdir(BASE, { withFileTypes: true });
  const cats = dirs.filter((d) => d.isDirectory()).map((d) => d.name);

  const moves: {
    fromCat: string;
    toCat: string;
    file: string;
    confidence: number;
  }[] = [];

  for (const c of cats) {
    const catDir = path.join(BASE, c);
    const files = (await fs.readdir(catDir)).filter((f) => f.endsWith('.mdx'));
    for (const f of files) {
      const p = path.join(catDir, f);
      const raw = await fs.readFile(p, 'utf-8');
      const { fm, body } = parseFM(raw);
      const title = (fm.title || path.basename(f, '.mdx')).toString();
      const { category, confidence } = suggestCategoryByKeywords(
        `${title}\n${body.slice(0, 800)}`
      );
      if (category && category.slug !== c && confidence >= min) {
        moves.push({ fromCat: c, toCat: category.slug, file: f, confidence });
      }
    }
  }

  console.log(`Relocate (min=${min}) Mode: ${write ? 'WRITE' : 'DRY'}`);
  console.log(`Candidates: ${moves.length}`);
  for (const m of moves.sort((a, b) => b.confidence - a.confidence)) {
    console.log(
      ` - ${m.fromCat}/${m.file}  -> ${m.toCat}  (${m.confidence.toFixed(2)})`
    );
  }

  if (!write || moves.length === 0) return;

  for (const m of moves) {
    const srcDir = path.join(BASE, m.fromCat);
    const dstDir = path.join(BASE, m.toCat);
    await ensureDir(dstDir);

    const srcPath = path.join(srcDir, m.file);
    const baseName = m.file.replace(/\.zh?\.mdx$/, '');
    let dstName = m.file;
    let dstPath = path.join(dstDir, dstName);
    // resolve collision
    try {
      await fs.access(dstPath);
      // exists -> add suffix
      const suffix = '-moved';
      dstName = baseName + suffix + '.mdx';
      dstPath = path.join(dstDir, dstName);
    } catch {}

    // read/update FM category name
    const raw = await fs.readFile(srcPath, 'utf-8');
    const { fm, body } = parseFM(raw);
    const catInfo = STATIC_CATEGORIES.find((x) => x.slug === m.toCat);
    if (catInfo) fm.category = catInfo.name;
    const next = stringifyFM(fm) + body;

    // write to dst, remove src
    await fs.writeFile(dstPath, next, 'utf-8');
    await fs.unlink(srcPath);

    // update metas
    const srcMeta = await readMeta(srcDir);
    const dstMeta = await readMeta(dstDir);
    const srcPage = baseName;
    const dstPage = dstName.replace(/\.zh?\.mdx$/, '');
    srcMeta.meta.pages = (srcMeta.meta.pages || []).filter(
      (p: string) => p !== srcPage
    );
    if (!dstMeta.meta.pages) dstMeta.meta.pages = [];
    if (!dstMeta.meta.pages.includes(dstPage)) dstMeta.meta.pages.push(dstPage);
    // ensure title/description/icon for dst
    if (!dstMeta.meta.title && catInfo) {
      dstMeta.meta.title = catInfo.name;
      dstMeta.meta.description = catInfo.description;
      dstMeta.meta.icon = catInfo.icon;
    }
    await writeMeta(srcMeta.path, srcMeta.meta);
    await writeMeta(dstMeta.path, dstMeta.meta);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
