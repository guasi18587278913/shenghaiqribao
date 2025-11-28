#!/usr/bin/env tsx
/**
 * Quick repair for reports affected by aggressive normalization.
 * - Ensure closing '---' after frontmatter
 * - Replace accidental '## ## ' -> '## '
 * - Replace '## - ' -> '- ' , '## N. ' -> 'N. '
 */
import { promises as fs } from 'fs';
import path from 'path';

const DIR = path.join(process.cwd(), 'content', 'reports');
const WRITE = process.argv.includes('--write');

async function fixFile(p: string) {
  const raw = await fs.readFile(p, 'utf-8');
  const lines = raw.split(/\r?\n/);
  const i = 0;
  let changed = false;

  // 1) ensure frontmatter closing '---'
  if (lines[0].trim() === '---') {
    // find first blank line after fields
    let fmEnd = -1;
    for (let k = 1; k < Math.min(lines.length, 30); k++) {
      const s = lines[k];
      // if already closed, stop
      if (s.trim() === '---') {
        fmEnd = k;
        break;
      }
      // if reaches empty line, we assume fm ended but missing closing
      if (s.trim() === '' && fmEnd === -1) {
        fmEnd = k;
        // insert '---' at this position
        lines.splice(k, 0, '---');
        changed = true;
        break;
      }
    }
  }

  // 2) line-based fixes
  for (let k = 0; k < lines.length; k++) {
    let s = lines[k];
    const orig = s;
    s = s.replace(/^##\s+##\s+/, '## ');
    s = s.replace(/^##\s+-\s+/, '- ');
    s = s.replace(/^##\s+(\d+)\.\s+/, (_m, d) => `${d}. `);
    if (s !== orig) {
      lines[k] = s;
      changed = true;
    }
  }

  if (changed && WRITE) {
    await fs.writeFile(p, lines.join('\n'), 'utf-8');
  }
  return changed;
}

async function main() {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith('.mdx'));
  let cnt = 0;
  for (const f of files) {
    const p = path.join(DIR, f);
    const changed = await fixFile(p);
    if (changed) cnt++;
  }
  console.log(
    `Repair reports: ${WRITE ? 'WRITE' : 'DRY'} changed=${cnt}/${files.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
