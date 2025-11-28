/**
 * Message Parser Module
 *
 * This module provides functionality for parsing and processing messages
 * from WeChat groups or other sources.
 *
 * TODO: Implement message parsing functionality
 */

import type { MessageType } from '@/types/daily-report';
import { nanoid } from 'nanoid';

export interface ParsedMessage {
  id: string;
  groupName: string;
  content: string;
  senderName: string;
  senderId?: string;
  timestamp: Date;
  type: MessageType;
}

const SYSTEM_KEYWORDS = [
  '加入了群聊',
  '邀请',
  '拍了拍',
  '撤回了一条消息',
  '红包',
  '通过扫描',
  '修改群名为',
];

const ATTACHMENT_TOKENS = ['[图片]', '[视频]', '[语音]', '[文件]', '[小程序]'];
const DATE_LINE_REGEX =
  /^(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\s+(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)[：:](.*)$/;
const HTML_TAG_REGEX = /<[^>]+>/g;

function normalizeLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function detectMessageType(content: string): MessageType {
  if (/https?:\/\//i.test(content)) {
    return 'link';
  }
  if (ATTACHMENT_TOKENS.some((token) => content.includes(token))) {
    if (content.includes('[图片]')) return 'image';
    if (content.includes('[文件]')) return 'file';
  }
  return 'text';
}

function isNoise(content: string) {
  const trimmed = content.replace(/\s+/g, '');
  if (!trimmed) return true;
  if (!/[\u4e00-\u9fa5A-Za-z0-9]/.test(trimmed)) return true;
  return SYSTEM_KEYWORDS.some((keyword) => content.includes(keyword));
}

export function parseWeChatExport(
  exportText: string,
  groupName: string,
  format: 'txt' | 'html' = 'txt'
): ParsedMessage[] {
  const text =
    format === 'html' ? exportText.replace(HTML_TAG_REGEX, '') : exportText;
  const lines = normalizeLines(text);
  const messages: ParsedMessage[] = [];
  let current: ParsedMessage | null = null;

  for (const line of lines) {
    const match = line.match(DATE_LINE_REGEX);
    if (match) {
      const [, dateStr, timeStr, sender, rest] = match;
      const timestamp = new Date(`${dateStr.replace(/\./g, '-')} ${timeStr}`);
      if (Number.isNaN(timestamp.getTime())) {
        continue;
      }

      if (current) {
        messages.push(current);
      }

      current = {
        id: nanoid(),
        groupName,
        senderName: sender.trim(),
        content: rest.trim(),
        timestamp,
        type: detectMessageType(rest.trim()),
      };
      continue;
    }

    if (current) {
      current.content += `\n${line}`;
    }
  }

  if (current) {
    messages.push(current);
  }

  return messages;
}

export function mergeConsecutiveMessages(
  messages: ParsedMessage[]
): ParsedMessage[] {
  if (messages.length === 0) return [];

  const sorted = [...messages].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const merged: ParsedMessage[] = [];
  let buffer = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const diff = current.timestamp.getTime() - buffer.timestamp.getTime();

    if (
      current.senderName === buffer.senderName &&
      diff <= 5 * 60 * 1000 &&
      current.type === buffer.type
    ) {
      buffer.content += `\n${current.content}`;
    } else {
      merged.push(buffer);
      buffer = { ...current };
    }
  }

  merged.push(buffer);
  return merged;
}

export function stage1Filter(messages: ParsedMessage[]): ParsedMessage[] {
  return messages.filter((message) => {
    if (isNoise(message.content)) return false;
    if (message.content.length < 2) return false;
    return true;
  });
}
