/**
 * Message Parser - Parse WeChat chat exports
 * Supports both .txt and .html formats
 */

import type { MessageType, RawMessage } from '@/types/daily-report';

export interface ParsedMessage {
  senderName: string;
  senderId?: string;
  content: string;
  messageType: MessageType;
  timestamp: Date;
}

/**
 * Parse WeChat txt export format
 * Expected format:
 * 2025-10-31 10:30:45 张三
 * 这是消息内容
 */
export function parseTxtFormat(
  content: string,
  groupName: string
): ParsedMessage[] {
  const messages: ParsedMessage[] = [];
  const lines = content.split('\n');

  let currentMessage: Partial<ParsedMessage> | null = null;

  for (const line of lines) {
    // Match timestamp and sender: 2025-10-31 10:30:45 张三
    const headerMatch = line.match(
      /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(.+)$/
    );

    if (headerMatch) {
      // Save previous message if exists
      if (currentMessage && currentMessage.content) {
        messages.push(currentMessage as ParsedMessage);
      }

      // Start new message
      const [, timestampStr, senderName] = headerMatch;
      currentMessage = {
        senderName: senderName.trim(),
        content: '',
        messageType: 'text',
        timestamp: new Date(timestampStr),
      };
    } else if (currentMessage && line.trim()) {
      // Append to current message content
      currentMessage.content +=
        (currentMessage.content ? '\n' : '') + line.trim();

      // Detect message type
      if (line.includes('[图片]') || line.includes('[Image]')) {
        currentMessage.messageType = 'image';
      } else if (line.includes('http://') || line.includes('https://')) {
        currentMessage.messageType = 'link';
      } else if (line.includes('[文件]') || line.includes('[File]')) {
        currentMessage.messageType = 'file';
      }
    }
  }

  // Save last message
  if (currentMessage && currentMessage.content) {
    messages.push(currentMessage as ParsedMessage);
  }

  return messages;
}

/**
 * Parse WeChat html export format
 */
export function parseHtmlFormat(
  content: string,
  groupName: string
): ParsedMessage[] {
  // This is a simplified implementation
  // In production, you'd want to use a proper HTML parser like cheerio
  const messages: ParsedMessage[] = [];

  // Remove HTML tags for simple parsing
  const text = content.replace(/<[^>]*>/g, '\n');

  // Use txt parser as fallback
  return parseTxtFormat(text, groupName);
}

/**
 * Main parser function that detects format and parses accordingly
 */
export function parseWeChatExport(
  content: string,
  groupName: string,
  format: 'txt' | 'html' = 'txt'
): ParsedMessage[] {
  if (format === 'html') {
    return parseHtmlFormat(content, groupName);
  }
  return parseTxtFormat(content, groupName);
}

/**
 * Stage 1 Filter: Quick local filtering
 * Removes noise like emojis-only, red packets, system messages, etc.
 */
export function stage1Filter(messages: ParsedMessage[]): ParsedMessage[] {
  return messages.filter((msg) => {
    const content = msg.content.trim();

    // Filter out empty messages
    if (!content || content.length < 5) {
      return false;
    }

    // Filter out emoji-only messages (simplified check)
    const emojiPattern =
      /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u;
    if (emojiPattern.test(content)) {
      return false;
    }

    // Filter out common system messages
    const systemPatterns = [
      /红包/,
      /\[红包\]/,
      /\[系统消息\]/,
      /撤回了一条消息/,
      /joined the group/,
      /left the group/,
    ];

    if (systemPatterns.some((pattern) => pattern.test(content))) {
      return false;
    }

    return true;
  });
}

/**
 * Merge consecutive messages from same sender within 5 minutes
 */
export function mergeConsecutiveMessages(
  messages: ParsedMessage[]
): ParsedMessage[] {
  if (messages.length === 0) return [];

  const merged: ParsedMessage[] = [];
  let current = { ...messages[0] };

  for (let i = 1; i < messages.length; i++) {
    const msg = messages[i];
    const timeDiff = msg.timestamp.getTime() - current.timestamp.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    // Merge if same sender and within 5 minutes
    if (msg.senderName === current.senderName && timeDiff <= fiveMinutes) {
      current.content += '\n' + msg.content;
    } else {
      merged.push(current);
      current = { ...msg };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Generate unique ID for message
 */
export function generateMessageId(
  groupName: string,
  senderName: string,
  timestamp: Date
): string {
  const timeStr = timestamp.toISOString();
  const combined = `${groupName}-${senderName}-${timeStr}`;

  // Simple hash function (in production, use crypto.createHash)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `msg_${Math.abs(hash).toString(36)}`;
}
