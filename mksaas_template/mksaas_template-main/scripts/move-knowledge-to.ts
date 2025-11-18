#!/usr/bin/env tsx
/**
 * Move/Merge a knowledge doc into another existing doc
 *
 * Usage:
 *  tsx scripts/move-knowledge-to.ts --from=dev-tools/2025-11-14-gpt-充值与使用体验.zh.mdx --to=/knowledge/payment/chatgpt订阅实操
 */
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { normalizeTitle } from '../src/lib/report-parser';

function parseArgs() {
  const args: Record<string, string> = {};
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.split('=');
    if (k.startsWith('--') && v) args[k.slice(2)] = v;
  }
  return args;
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

function knowledgeUrlToFilePath(url: string) {
  const u = new URL(url, 'http://localhost');
  const parts = u.pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('knowledge');
  if (idx === -1 || parts.length < idx + 3) return null;
  const category = decodeURIComponent(parts[idx + 1]);
  const slug = decodeURIComponent(parts[idx + 2]);
  const baseDir = path.join(process.cwd(), 'content/knowledge', category);
  const cand1 = path.join(baseDir, `${slug}.mdx`);
  const cand2 = path.join(baseDir, `${slug}.zh.mdx`);
  const filePath = fileExistsSync(cand1) ? cand1 : fileExistsSync(cand2) ? cand2 : cand2;
  return { category, slug, filePath, baseDir };
}

function fileExistsSync(p: string) {
  try {
    const st = require('fs').statSync(p);
    return st && st.isFile();
  } catch {
    return false;
  }
}

async function main() {
  const { from, to } = parseArgs();
  if (!from || !to) {
    console.error('Usage: --from=<category/filename> --to=/knowledge/<category>/<slug>');
    process.exit(1);
  }
  const sourcePath = path.join(process.cwd(), 'content/knowledge', from);
  const dest = knowledgeUrlToFilePath(to);
  if (!dest) {
    console.error('Invalid --to path:', to);
    process.exit(1);
  }
  const exists = await fs
    .stat(sourcePath)
    .then((s) => s.isFile())
    .catch(() => false);
  if (!exists) {
    console.error('Source not found:', sourcePath);
    process.exit(1);
  }

  const raw = await fs.readFile(sourcePath, 'utf-8');
  const { fm, body } = parseFrontmatter(raw);
  const oldTitle = (fm.title || '').replace(/^"+|"+$/g, '');

  // pick date
  const date =
    (fm.sourceDate || fm.date || '').replace(/"/g, '') ||
    // fallback parse from filename prefix
    (path.basename(sourcePath).match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ?? '未知日期');

  // force concise title <= 10
  let t = normalizeTitle(oldTitle);
  if (t.length > 10) t = t.slice(0, 10);

  // build section
  const section = `\n\n## 来自 ${date} 日报\n\n### ${t}\n> 摘自 [${date} 日报](/reports/${date})\n\n${body.trim()}\n`;

  // append
  const destRaw = await fs.readFile(dest.filePath, 'utf-8');
  const merged = destRaw.trimEnd() + section + '\n';
  await fs.writeFile(dest.filePath, merged, 'utf-8');

  // remove source file and update meta.json in its category
  await fs.unlink(sourcePath);
  const srcCategory = from.split('/')[0];
  const metaPath = path.join(process.cwd(), 'content/knowledge', srcCategory, 'meta.json');
  try {
    const metaText = await fs.readFile(metaPath, 'utf-8');
    const meta = JSON.parse(metaText);
    const page = path.basename(sourcePath).replace(/\.zh?\.mdx$/, '');
    meta.pages = (meta.pages || []).filter((p: string) => p !== page);
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  } catch {
    // ignore
  }

  console.log('Merged to:', dest.filePath);
  console.log('Removed source:', sourcePath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

