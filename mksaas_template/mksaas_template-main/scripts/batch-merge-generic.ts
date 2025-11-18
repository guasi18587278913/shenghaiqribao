#!/usr/bin/env tsx
/**
 * Batch-merge generic, daily-style knowledge entries into anchor docs per category.
 *
 * Heuristic:
 * - Targets files with date prefix or generic titles:
 *   "今日要点", "今日关键", "今日关键收获", "今日要点速记", "相关资源", "相关链接", "本期群聊"
 * - For each category, merges into a chosen anchor doc if exists.
 *
 * Usage:
 *  - Dry run: tsx scripts/batch-merge-generic.ts
 *  - Apply:   tsx scripts/batch-merge-generic.ts --write
 */
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { normalizeTitle } from '../src/lib/report-parser';

const BASE = path.join(process.cwd(), 'content', 'knowledge');
const WRITE = process.argv.includes('--write');

// Category anchors (basename without extension)
const ANCHORS: Record<string, string> = {
  'dev-tools': 'ai开发工具使用攻略',
  payment: '订阅策略总览',
  project: '项目开发部署常见问题.zh',
  network: '网络与代理',
  account: '账号与设备',
  learning: '学习认知与避坑',
  community: '社群与学习',
  cost: '成本规划',
};

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
function looksGenericTitle(title: string) {
  const t = title.trim();
  const patterns = [
    /^今日(要点|关键|要点速记|关键收获|小结|总结)/,
    /^相关(资源|链接)/,
    /^本期群聊/,
  ];
  return patterns.some((re) => re.test(t));
}
function hasDatePrefix(name: string) {
  return /^\d{4}-\d{2}-\d{2}-/.test(name);
}
async function findAnchorPath(category: string): Promise<string | null> {
  const anchorBase = ANCHORS[category];
  if (!anchorBase) return null;
  const catDir = path.join(BASE, category);
  const cand1 = path.join(catDir, `${anchorBase}.mdx`);
  const cand2 = path.join(catDir, `${anchorBase}.zh.mdx`);
  try {
    const s1 = await fs.stat(cand1);
    if (s1.isFile()) return cand1;
  } catch {}
  try {
    const s2 = await fs.stat(cand2);
    if (s2.isFile()) return cand2;
  } catch {}
  return null;
}
async function updateMetaRemove(category: string, page: string) {
  const metaPath = path.join(BASE, category, 'meta.json');
  try {
    const metaText = await fs.readFile(metaPath, 'utf-8');
    const meta = JSON.parse(metaText);
    meta.pages = (meta.pages || []).filter((p: string) => p !== page);
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  } catch {}
}

async function main() {
  const cats = (await fs.readdir(BASE, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const plan: { category: string; file: string; mergeTo: string }[] = [];

  for (const c of cats) {
    const catDir = path.join(BASE, c);
    const files = (await fs.readdir(catDir)).filter((f) => f.endsWith('.mdx'));
    const anchor = await findAnchorPath(c);
    if (!anchor) continue;

    for (const f of files) {
      const p = path.join(catDir, f);
      const raw = await fs.readFile(p, 'utf-8');
      const { fm } = parseFM(raw);
      const base = f.replace(/\.zh?\.mdx$/, '');
      const t = (fm.title || base).toString();
      if (!(looksGenericTitle(t) || hasDatePrefix(base))) continue;
      // 不合并索引/专题类文件
      if (base === 'index' || base === ANCHORS[c]) continue;
      plan.push({ category: c, file: p, mergeTo: anchor });
    }
  }

  console.log(`Batch-merge generic: ${WRITE ? 'WRITE' : 'DRY'} planned merges=${plan.length}`);
  for (const it of plan.slice(0, 50)) {
    console.log(` - ${path.relative(BASE, it.file)} -> ${path.relative(BASE, it.mergeTo)}`);
  }
  if (!WRITE) {
    if (plan.length > 50) console.log(` ... (${plan.length - 50} more)`);
    return;
  }

  for (const it of plan) {
    const raw = await fs.readFile(it.file, 'utf-8');
    const { fm, body } = parseFM(raw);
    const safeTitle = normalizeTitle((fm.title || '').toString());
    const date =
      (fm.sourceDate || fm.date || '').toString().replace(/"/g, '') ||
      (path.basename(it.file).match(/^(\d{4}-\d{2}-\d{2})-/)?.[1] ?? '未知日期');
    // 10 字内小节标题
    let short = safeTitle;
    if (short.length > 10) short = short.slice(0, 10);
    const section = `\n\n## 来自 ${date} 日报\n\n### ${short}\n> 摘自 [${date} 日报](/reports/${date})\n\n${body.trim()}\n`;
    const anchorRaw = await fs.readFile(it.mergeTo, 'utf-8');
    const merged = anchorRaw.trimEnd() + section + '\n';
    await fs.writeFile(it.mergeTo, merged, 'utf-8');
    // 删除源文件与 meta
    const page = path.basename(it.file).replace(/\.zh?\.mdx$/, '');
    await fs.unlink(it.file);
    await updateMetaRemove(it.category, page);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

