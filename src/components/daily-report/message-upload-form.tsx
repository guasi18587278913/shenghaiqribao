'use client';

import { uploadMessages } from '@/actions/daily-report';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  mergeConsecutiveMessages,
  parseWeChatExport,
  stage1Filter,
} from '@/lib/daily-report/message-parser';
import { CheckCircle2, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const GROUP_OPTIONS = [
  { value: 'group1', label: '学习群 A' },
  { value: 'group2', label: '学习群 B' },
  { value: 'group3', label: '学习群 C' },
  { value: 'group4', label: '学习群 D' },
];

export function MessageUploadForm() {
  const [groupName, setGroupName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    totalMessages: number;
    filteredMessages: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !groupName) {
      toast.error('请选择群组和文件');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Read file content
      const content = await file.text();
      const format = file.name.endsWith('.html') ? 'html' : 'txt';

      // Parse messages
      const parsedMessages = parseWeChatExport(content, groupName, format);
      console.log(`Parsed ${parsedMessages.length} messages`);

      // Stage 1 filtering
      const filtered = stage1Filter(parsedMessages);
      const merged = mergeConsecutiveMessages(filtered);
      console.log(`Filtered to ${merged.length} messages`);

      // Upload to database
      const result = await uploadMessages({
        groupName,
        messages: merged,
      });

      if (result.success) {
        setUploadResult({
          totalMessages: parsedMessages.length,
          filteredMessages: merged.length,
        });
        toast.success(`成功上传 ${result.count} 条消息`);
        setFile(null);
        setGroupName('');

        // Reset file input
        const fileInput = document.getElementById(
          'file-upload'
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('上传失败，请检查文件格式');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="group-select">选择群组</Label>
        <Select value={groupName} onValueChange={setGroupName}>
          <SelectTrigger id="group-select">
            <SelectValue placeholder="选择一个群组" />
          </SelectTrigger>
          <SelectContent>
            {GROUP_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-upload">上传聊天记录</Label>
        <div className="flex gap-2">
          <Input
            id="file-upload"
            type="file"
            accept=".txt,.html"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>
        {file && (
          <p className="text-sm text-muted-foreground">
            已选择: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {uploadResult && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">
                上传成功
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                原始消息: {uploadResult.totalMessages} 条 → 过滤后:{' '}
                {uploadResult.filteredMessages} 条
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || !groupName || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            上传中...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            上传消息
          </>
        )}
      </Button>
    </div>
  );
}
