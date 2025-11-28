'use server';

/**
 * Generate Report Server Actions
 *
 * 生成日报和知识库文件的 Server Actions
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
  generateKnowledgeFileName,
  generateKnowledgeMDX,
  generateReportMDX,
} from '@/lib/report-parser';
import { normalizeTitle } from '@/lib/report-parser';

/**
 * 当未显式指定合并目标时，服务端也会做一次“相似合并”兜底，
 * 以保证“合并优先于新建”的默认策略。
 */
const AUTO_MERGE_THRESHOLD = 0.55; // 相似度阈值（0-1），达到则优先合并

/**
 * 预处理日报 Markdown：
 * - 将 '---' 分节的首行转为 '## ' 标题
 * - 将“段落+列表”的段落标题转为 '## '（仅生成时使用，不改源）
 * - 自动强调关键提示词：结论/注意/建议/步骤（行首）
 * - 支持 ==高亮== 语法，转换为 <mark>
 */
function preprocessMarkdownForReport(input: string): string {
  let md = input;

  // 1) 支持 ==高亮== 转 <mark>高亮</mark>
  md = md.replace(/==([^=\n]+)==/g, (_m, p1) => `<mark>${p1}</mark>`);

  // 2) 自动强调关键提示词（行首）
  //  - 列表项开头：- 结论：内容  → - **结论：** 内容
  //  - 段落开头：结论：内容      → **结论：** 内容
  const tipLabels = ['结论', '注意', '建议', '步骤'];
  const tipRegex = new RegExp(
    // 行首可选列表符号
    String.raw`(^|\n)([ \t]*[-*+]\s*)?(${tipLabels.join('|')})[:：]\s*`,
    'g'
  );
  md = md.replace(tipRegex, (_m, pfx, listPrefix = '', label) => {
    const prefix = pfx || '\n';
    return `${prefix}${listPrefix || ''}<mark>**${label}：**</mark> `;
  });

  // 3) '---' 分节的第一行当作节标题 → '## 标题'
  //    结构： ---\n标题行\n若干行...  ---\n下一节
  md = md.replace(
    /\n-{3,}\s*\n([^\n]{2,80})\n/g,
    (m, title) => `\n\n## ${title.trim()}\n`
  );

  // 4) 段落 + 列表 的段落视为节标题
  //    将 “段落行\n- 条目...” 的段落行转为 '## 段落行'
  md = md.replace(
    /(^|\n)([^\n]{2,80})\n([ \t]*[-*+]\s+)/g,
    (_m, p1, heading, listPrefix) => {
      // 已经是标题则不处理
      if (/^\s*#{1,6}\s/.test(heading)) return `${p1}${heading}\n${listPrefix}`;
      return `${p1}## ${heading.trim()}\n${listPrefix}`;
    }
  );

  return md;
}

interface ReportMetadata {
  date: string;
  title: string;
  description: string;
  tags: string[];
}

interface ApprovedTopicData {
  title: string;
  content: string;
  addToKnowledge: boolean;
  categorySlug: string;
  categoryName: string;
  mergeTargetUrl?: string;
}

/**
 * 生成日报和知识库文件
 */
export async function generateReportFiles(data: {
  metadata: ReportMetadata;
  markdown: string;
  approvedTopics: ApprovedTopicData[];
}) {
  const results = {
    reportFile: '',
    knowledgeFiles: [] as string[],
    errors: [] as string[],
  };

  try {
    const contentDir = path.join(process.cwd(), 'content');

    // 1. 生成日报 MDX
    const reportPath = path.join(
      contentDir,
      'reports',
      `${data.metadata.date}.mdx`
    );
    const reportContent = generateReportMDX(
      preprocessMarkdownForReport(data.markdown),
      data.metadata
    );

    await fs.writeFile(reportPath, reportContent, 'utf-8');
    results.reportFile = reportPath;

    // 2. 更新 reports/meta.json
    await updateReportsMeta(data.metadata.date);

    // 3. 生成或合并知识库 MDX（只处理勾选的话题）
    for (const topic of data.approvedTopics) {
      if (!topic.addToKnowledge || !topic.categorySlug) continue;

      try {
        // 若选择了合并目标，则尝试把内容合并进现有文档
        if (topic.mergeTargetUrl) {
          const merged = await mergeIntoExistingKnowledge(
            topic.mergeTargetUrl,
            {
              title: topic.title,
              content: topic.content,
              date: data.metadata.date,
            }
          );
          if (merged.success && merged.filePath) {
            results.knowledgeFiles.push(merged.filePath);
            continue;
          } else {
            // 合并失败则回退为创建新文档
            console.warn(
              `Merge failed for ${topic.title}, fallback to new file:`,
              merged.error
            );
          }
        }

        // 服务端兜底：即使没有前端指定合并目标，也尝试寻找相似文档优先合并
        if (!topic.mergeTargetUrl) {
          const index = await readKnowledgeIndex();
          const candidates = await findRelatedCandidates(
            normalizeTitle(topic.title),
            topic.content,
            index
          );
          if (
            candidates.length > 0 &&
            candidates[0].score >= AUTO_MERGE_THRESHOLD
          ) {
            const merged = await mergeIntoExistingKnowledge(candidates[0].url, {
              title: topic.title,
              content: topic.content,
              date: data.metadata.date,
            });
            if (merged.success && merged.filePath) {
              results.knowledgeFiles.push(merged.filePath);
              continue;
            }
          }
        }

        // 默认：新建独立知识库文档
        const fileName = generateKnowledgeFileName(
          data.metadata.date,
          topic.title
        );
        const knowledgeDir = path.join(
          contentDir,
          'knowledge',
          topic.categorySlug
        );

        // 确保目录存在
        await fs.mkdir(knowledgeDir, { recursive: true });

        const filePath = path.join(knowledgeDir, fileName);
        const content = generateKnowledgeMDX(
          topic,
          data.metadata,
          topic.categoryName
        );

        await fs.writeFile(filePath, content, 'utf-8');
        results.knowledgeFiles.push(filePath);

        // 更新分类的 meta.json
        await updateKnowledgeMeta(topic.categorySlug, fileName);
      } catch (error) {
        console.error(
          `Failed to generate knowledge file for ${topic.title}:`,
          error
        );
        results.errors.push(`话题 "${topic.title}" 生成失败`);
      }
    }

    return { success: true, results };
  } catch (error: any) {
    console.error('Failed to generate report:', error);
    return {
      success: false,
      error: error.message || '生成失败',
      results,
    };
  }
}

/**
 * 构建知识库索引（标题、URL、文件路径）
 */
async function readKnowledgeIndex(): Promise<
  { title: string; url: string; file: string }[]
> {
  const baseDir = path.join(process.cwd(), 'content/knowledge');
  const results: { title: string; url: string; file: string }[] = [];

  async function walk(dir: string, category?: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        if (e.name === 'meta.json') continue;
        await walk(path.join(dir, e.name), category ?? e.name);
      } else if (
        e.isFile() &&
        (e.name.endsWith('.mdx') || e.name.endsWith('.zh.mdx'))
      ) {
        const filePath = path.join(dir, e.name);
        try {
          const raw = await fs.readFile(filePath, 'utf-8');
          const match = raw.match(/^---\n([\s\S]*?)\n---/);
          let title = '';
          if (match) {
            const fm = match[1];
            const t = fm.match(/^\s*title:\s*(.+)\s*$/m);
            title = t ? t[1].trim() : '';
          }
          const fileSlug = e.name.replace(/\.zh?\.mdx$/, '');
          const cat = category ?? path.basename(path.dirname(filePath));
          const url = `/knowledge/${encodeURIComponent(cat)}/${encodeURIComponent(fileSlug)}`;
          if (title) {
            results.push({ title, url, file: filePath });
          }
        } catch {
          // ignore
        }
      }
    }
  }

  try {
    await walk(baseDir);
  } catch {
    // ignore
  }

  return results;
}

function tokenize(s: string): Set<string> {
  // Keep letters, numbers and CJK; replace others with space
  const cleaned = s.toLowerCase().replace(/[^\p{L}\p{N}\u4e00-\u9fff]+/gu, ' ');
  return new Set(cleaned.split(/\s+/).filter((w) => w && w.length >= 2));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

async function findRelatedCandidates(
  title: string,
  content: string,
  index: { title: string; url: string; file: string }[]
) {
  const tokens = tokenize(`${title} ${content.slice(0, 400)}`);
  const scored = index
    .map((it) => ({
      title: it.title,
      url: it.url,
      score: jaccard(tokens, tokenize(it.title)),
    }))
    .filter((x) => x.score > 0.18)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return scored;
}

/**
 * 将话题内容合并进已有知识库文档
 */
async function mergeIntoExistingKnowledge(
  targetUrl: string,
  payload: { title: string; content: string; date: string }
) {
  try {
    const resolved = knowledgeUrlToFilePath(targetUrl);
    if (!resolved) {
      return { success: false, error: '无法解析合并目标路径' };
    }
    const { filePath } = resolved;
    // 兼容 .mdx / .zh.mdx
    const exists = await safeExists(filePath);
    if (!exists) {
      return { success: false, error: '目标文件不存在' };
    }

    const original = await fs.readFile(filePath, 'utf-8');

    // 去重：若文件已包含同日期同标题，跳过
    const safeTitle = normalizeTitle(payload.title);
    const marker = `### ${safeTitle}`;
    const dateHeader = `## 来自 ${payload.date} 日报`;
    if (original.includes(marker) && original.includes(dateHeader)) {
      return { success: true, filePath }; // 已合并过
    }

    const section = `\n\n${dateHeader}\n\n### ${safeTitle}\n> 摘自 [${payload.date} 日报](/reports/${payload.date})\n\n${payload.content}\n`;

    const merged = original.trimEnd() + section + '\n';
    await fs.writeFile(filePath, merged, 'utf-8');
    return { success: true, filePath };
  } catch (e: any) {
    return { success: false, error: e?.message || '合并失败' };
  }
}

function knowledgeUrlToFilePath(
  url: string
): { category: string; slug: string; filePath: string } | null {
  try {
    const u = new URL(url, 'http://localhost');
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('knowledge');
    if (idx === -1 || parts.length < idx + 3) return null;
    const category = decodeURIComponent(parts[idx + 1]);
    const slug = decodeURIComponent(parts[idx + 2]);
    const baseDir = path.join(process.cwd(), 'content/knowledge', category);
    const cand1 = path.join(baseDir, `${slug}.mdx`);
    const cand2 = path.join(baseDir, `${slug}.zh.mdx`);
    const filePath = pathExistsSync(cand1)
      ? cand1
      : pathExistsSync(cand2)
        ? cand2
        : cand2;
    return { category, slug, filePath };
  } catch {
    return null;
  }
}

function pathExistsSync(p: string) {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: cross-env
    const stat: any = require('fs').statSync(p);
    return stat && stat.isFile();
  } catch {
    return false;
  }
}

async function safeExists(p: string) {
  try {
    const st = await fs.stat(p);
    return st.isFile();
  } catch {
    return false;
  }
}

/**
 * 更新 reports/meta.json
 */
async function updateReportsMeta(date: string) {
  const metaPath = path.join(process.cwd(), 'content/reports/meta.json');

  try {
    const content = await fs.readFile(metaPath, 'utf-8');
    const meta = JSON.parse(content);

    // 添加新日期到 pages 数组（如果不存在）
    if (!meta.pages.includes(date)) {
      // 按日期降序插入
      meta.pages = [date, ...meta.pages.filter((p: string) => p !== 'index')];
      if (meta.pages[meta.pages.length - 1] !== 'index') {
        meta.pages.push('index');
      }
    }

    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to update reports meta:', error);
    throw error;
  }
}

/**
 * 更新知识库分类的 meta.json
 */
async function updateKnowledgeMeta(categorySlug: string, fileName: string) {
  const metaPath = path.join(
    process.cwd(),
    'content/knowledge',
    categorySlug,
    'meta.json'
  );

  try {
    const content = await fs.readFile(metaPath, 'utf-8');
    const meta = JSON.parse(content);

    // 提取文件名（不含扩展名）
    const fileNameWithoutExt = fileName.replace(/\.zh\.mdx$/, '');

    // 添加到 pages 数组开头（如果不存在）
    if (!meta.pages.includes(fileNameWithoutExt)) {
      meta.pages = [fileNameWithoutExt, ...meta.pages];
    }

    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  } catch (error) {
    console.error(
      `Failed to update knowledge meta for ${categorySlug}:`,
      error
    );
    // 如果 meta.json 不存在，创建一个新的
    const meta = {
      pages: [fileName.replace(/\.zh\.mdx$/, '')],
    };
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  }
}
