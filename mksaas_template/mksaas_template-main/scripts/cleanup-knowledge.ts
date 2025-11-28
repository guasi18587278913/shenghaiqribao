#!/usr/bin/env tsx
/**
 * Knowledge Base Cleanup Script
 *
 * - Normalize titles (remove numbering, generic phrases)
 * - Optionally rename files to normalized slug (preserve date prefix)
 * - Update category meta.json pages accordingly
 * - Fill missing meta.json fields (title/description/icon) using STATIC_CATEGORIES
 *
 * Usage:
 *  - Dry run (default):  tsx scripts/cleanup-knowledge.ts
 *  - Apply changes:      tsx scripts/cleanup-knowledge.ts --write
 */

import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { STATIC_CATEGORIES, slugify } from '../src/config/knowledge-categories';
import { normalizeTitle } from '../src/lib/report-parser';

const KNOWLEDGE_DIR = path.join(process.cwd(), 'content', 'knowledge');

type MetaJson = {
  title?: string;
  description?: string;
  icon?: string;
  root?: boolean;
  pages: string[];
};

const args = new Set(process.argv.slice(2));
const DRY_RUN = !args.has('--write');

function log(...m: any[]) {
  console.log('[cleanup]', ...m);
}

function pickCategoryInfo(slug: string) {
  const cat = STATIC_CATEGORIES.find((c) => c.slug === slug);
  return cat
    ? { title: cat.name, description: cat.description, icon: cat.icon }
    : undefined;
}

async function readText(p: string) {
  try {
    return await fs.readFile(p, 'utf-8');
  } catch {
    return null;
  }
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
    if (kv) {
      fm[kv[1]] = kv[2];
    }
  }
  return { fm, body: m[2] ?? '' };
}

function stringifyFrontmatter(fm: Record<string, string>) {
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n`;
}

function extractDatePrefix(filename: string): string | null {
  // Expect: 2025-11-15-xxxx.zh.mdx
  const m = filename.match(/^(\d{4}-\d{2}-\d{2})-/);
  return m ? m[1] : null;
}

function ensureExt(file: string) {
  // keep original ext if it exists
  if (file.endsWith('.zh.mdx')) return '.zh.mdx';
  if (file.endsWith('.mdx')) return '.mdx';
  return '.mdx';
}

async function processCategory(categorySlug: string) {
  const catDir = path.join(KNOWLEDGE_DIR, categorySlug);
  const entries = await fs.readdir(catDir, { withFileTypes: true });
  const files = entries
    .filter(
      (e) =>
        e.isFile() && (e.name.endsWith('.mdx') || e.name.endsWith('.zh.mdx'))
    )
    .map((e) => e.name);

  const metaPath = path.join(catDir, 'meta.json');
  const metaRaw = await readText(metaPath);
  const meta: MetaJson = metaRaw
    ? (JSON.parse(metaRaw) as MetaJson)
    : { pages: [] };
  const originalPages = new Set(meta.pages);
  const catInfo = pickCategoryInfo(categorySlug);

  // Fill missing fields
  if (catInfo) {
    if (!meta.title) meta.title = catInfo.title;
    if (!meta.description) meta.description = catInfo.description;
    if (!meta.icon) meta.icon = catInfo.icon;
  }

  const changes: {
    file: string;
    oldTitle?: string;
    newTitle?: string;
    oldName?: string;
    newName?: string;
  }[] = [];

  // Normalize each file
  for (const name of files) {
    const filePath = path.join(catDir, name);
    const raw = await fs.readFile(filePath, 'utf-8');
    const { fm, body } = parseFrontmatter(raw);
    const oldTitle = fm.title ?? '';
    const normalized = normalizeTitle(oldTitle);

    // Update title if changed
    let newContent = raw;
    let titleChanged = false;
    if (normalized && normalized !== oldTitle) {
      fm.title = normalized;
      newContent = stringifyFrontmatter(fm) + body;
      titleChanged = true;
    }

    // Rename if base name (slug) mismatches normalized title slug
    const datePrefix = extractDatePrefix(name);
    const ext = ensureExt(name);
    const baseSlug = slugify(
      normalized || oldTitle || name.replace(/\.zh?\.mdx$/, '')
    );
    const targetName =
      datePrefix != null
        ? `${datePrefix}-${baseSlug}${ext}`
        : `${baseSlug}${ext}`;

    let renamed = false;
    if (targetName !== name) {
      // Avoid collision
      const targetPath = path.join(catDir, targetName);
      if (!DRY_RUN) {
        try {
          await fs.rename(filePath, targetPath);
        } catch (e) {
          // fallback: if collision, skip rename but still update title if needed
        }
      }
      renamed = true;
    }

    if (!DRY_RUN && titleChanged && !renamed) {
      await fs.writeFile(filePath, newContent, 'utf-8');
    }
    if (!DRY_RUN && titleChanged && renamed) {
      // write to new path
      const newPath = path.join(catDir, targetName);
      await fs.writeFile(newPath, newContent, 'utf-8');
    }

    // Update meta pages (strip extension)
    const oldPage = name.replace(/\.zh?\.mdx$/, '');
    const newPage = targetName.replace(/\.zh?\.mdx$/, '');
    if (renamed && originalPages.has(oldPage)) {
      meta.pages = meta.pages.map((p) => (p === oldPage ? newPage : p));
    } else if (!originalPages.has(newPage)) {
      // if page missing in meta, add to the end
      meta.pages.push(newPage);
    }

    if (titleChanged || renamed) {
      changes.push({
        file: path.join(categorySlug, name),
        oldTitle: oldTitle,
        newTitle: normalized,
        oldName: name,
        newName: targetName,
      });
    }
  }

  // Write meta.json
  if (!DRY_RUN) {
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  }

  return { category: categorySlug, changes, metaWritten: !DRY_RUN };
}

async function main() {
  const exists = await fs
    .stat(KNOWLEDGE_DIR)
    .then((s) => s.isDirectory())
    .catch(() => false);
  if (!exists) {
    console.error('Knowledge directory not found:', KNOWLEDGE_DIR);
    process.exit(1);
  }

  const cats = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true });
  const categorySlugs = cats.filter((e) => e.isDirectory()).map((e) => e.name);

  log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'WRITE (apply changes)'}`);
  log(`Categories: ${categorySlugs.join(', ')}`);

  const report: any[] = [];
  for (const slug of categorySlugs) {
    const r = await processCategory(slug);
    report.push(r);
  }

  // Summary
  let fileTitleChanges = 0;
  let fileRenameChanges = 0;
  for (const r of report) {
    for (const ch of r.changes) {
      if (ch.oldTitle !== ch.newTitle) fileTitleChanges++;
      if (ch.oldName !== ch.newName) fileRenameChanges++;
    }
  }

  console.log('==== Cleanup Summary ====');
  console.log(`Categories processed: ${report.length}`);
  console.log(`Files with title normalized: ${fileTitleChanges}`);
  console.log(`Files renamed: ${fileRenameChanges}`);
  console.log('');
  for (const r of report) {
    if (r.changes.length === 0) continue;
    console.log(`- ${r.category}`);
    for (const ch of r.changes) {
      const titlePart =
        ch.oldTitle !== ch.newTitle
          ? `title: "${ch.oldTitle}" -> "${ch.newTitle}"`
          : '';
      const namePart =
        ch.oldName !== ch.newName
          ? `name: "${ch.oldName}" -> "${ch.newName}"`
          : '';
      console.log(
        `  · ${ch.file} ${[titlePart, namePart].filter(Boolean).join(' | ')}`
      );
    }
  }

  if (DRY_RUN) {
    console.log('\nRun with --write to apply changes.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
