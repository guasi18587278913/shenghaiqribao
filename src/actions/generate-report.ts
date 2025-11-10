'use server';

/**
 * Generate Report Server Actions
 *
 * 生成日报和知识库文件的 Server Actions
 */

import {
  generateKnowledgeMDX,
  generateKnowledgeFileName,
  generateReportMDX,
} from '@/lib/report-parser';
import { promises as fs } from 'fs';
import path from 'path';

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
    const reportPath = path.join(contentDir, 'reports', `${data.metadata.date}.mdx`);
    const reportContent = generateReportMDX(data.markdown, data.metadata);

    await fs.writeFile(reportPath, reportContent, 'utf-8');
    results.reportFile = reportPath;

    // 2. 更新 reports/meta.json
    await updateReportsMeta(data.metadata.date);

    // 3. 生成知识库 MDX（只生成勾选的话题）
    for (const topic of data.approvedTopics) {
      if (!topic.addToKnowledge || !topic.categorySlug) continue;

      try {
        const fileName = generateKnowledgeFileName(data.metadata.date, topic.title);
        const knowledgeDir = path.join(contentDir, 'knowledge', topic.categorySlug);

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
        console.error(`Failed to generate knowledge file for ${topic.title}:`, error);
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
    console.error(`Failed to update knowledge meta for ${categorySlug}:`, error);
    // 如果 meta.json 不存在，创建一个新的
    const meta = {
      pages: [fileName.replace(/\.zh\.mdx$/, '')],
    };
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
  }
}
