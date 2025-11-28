#!/usr/bin/env tsx
/**
 * Move one knowledge doc from a category to another.
 *
 * Usage:
 *  tsx scripts/move-doc.ts --from=payment --to=dev-tools --name=免费资源与试用额度
 *
 * It finds file by basename (without extension), supports .mdx or .zh.mdx.
 * Updates both categories' meta.json accordingly.
 */
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { STATIC_CATEGORIES } from '../src/config/knowledge-categories';

function parseArgs() {
  const args = new Map<string, string>();
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=');
    if (k && v) args.set(k.replace(/^--/, ''), v);
  }
  const from = args.get('from');
  const to = args.get('to');
  const name = args.get('name'); // basename without extension
  if (!from || !to || !name) {
    console.error('Usage: --from=<category> --to=<category> --name=<basename>');
    process.exit(1);
  }
  return { from, to, name };
}

async function findFile(dir: string, base: string) {
  const cand1 = path.join(dir, `${base}.zh.mdx`);
  const cand2 = path.join(dir, `${base}.mdx`);
  try {
    const s = await fs.stat(cand1);
    if (s.isFile()) return { file: cand1, page: base };
  } catch {}
  try {
    const s = await fs.stat(cand2);
    if (s.isFile()) return { file: cand2, page: base };
  } catch {}
  // fallback: scan directory to find closest match
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx'));
  const found = files.find((f) => f.startsWith(base));
  if (found) {
    const page = found.replace(/\.zh?\.mdx$/, '');
    return { file: path.join(dir, found), page };
  }
  return null;
}

async function readMeta(catDir: string) {
  const p = path.join(catDir, 'meta.json');
  try {
    const text = await fs.readFile(p, 'utf-8');
    return { path: p, meta: JSON.parse(text) as any };
  } catch {
    return { path: p, meta: { pages: [] } };
  }
}

async function main() {
  const { from, to, name } = parseArgs();
  const base = path.join(process.cwd(), 'content/knowledge');
  const fromDir = path.join(base, from);
  const toDir = path.join(base, to);

  const src = await findFile(fromDir, name);
  if (!src) {
    console.error('Source file not found by name:', name, 'in', from);
    process.exit(1);
  }
  await fs.mkdir(toDir, { recursive: true });

  const destName = path.basename(src.file);
  const destPath = path.join(toDir, destName);
  await fs.copyFile(src.file, destPath);
  await fs.unlink(src.file);

  const fromMeta = await readMeta(fromDir);
  const toMeta = await readMeta(toDir);
  fromMeta.meta.pages = (fromMeta.meta.pages || []).filter(
    (p: string) => p !== src.page
  );
  const destPage = destName.replace(/\.zh?\.mdx$/, '');
  if (!toMeta.meta.pages) toMeta.meta.pages = [];
  if (!toMeta.meta.pages.includes(destPage)) {
    toMeta.meta.pages.push(destPage);
  }
  const catInfo = STATIC_CATEGORIES.find((c) => c.slug === to);
  if (catInfo) {
    if (!toMeta.meta.title) {
      toMeta.meta.title = catInfo.name;
      toMeta.meta.description = catInfo.description;
      toMeta.meta.icon = catInfo.icon;
    }
  }
  await fs.writeFile(
    fromMeta.path,
    JSON.stringify(fromMeta.meta, null, 2),
    'utf-8'
  );
  await fs.writeFile(
    toMeta.path,
    JSON.stringify(toMeta.meta, null, 2),
    'utf-8'
  );

  console.log(`Moved ${from}/${src.page} -> ${to}/${destPage}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
