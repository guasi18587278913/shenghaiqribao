'use client';

import { createComment, getComments } from '@/actions/daily-report';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Comment, CommentTargetType } from '@/types/daily-report';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MessageSquare, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [targetType, targetId]);

  const loadComments = async () => {
    try {
      const data = await getComments(targetType, targetId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Get actual user ID from auth context
      const userId = 'user_demo';

      const result = await createComment(
        {
          targetType,
          targetId,
          content: newComment,
        },
        userId
      );

      if (result.success) {
        toast.success('评论发布成功');
        setNewComment('');
        await loadComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error('评论发布失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="space-y-4">
        <Textarea
          placeholder="分享你的想法..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              '发布中...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                发布评论
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageSquare className="mb-2 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">暂无评论，来发表第一条评论吧</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {comment.user?.name?.charAt(0) || 'U'}
          </div>
          <span className="font-medium">
            {comment.user?.name || '匿名用户'}
          </span>
          {comment.isFeatured && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              精华
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: zhCN,
          })}
        </span>
      </div>
      <p className="leading-relaxed">{comment.content}</p>
      {comment.likes > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          👍 {comment.likes} 人觉得有帮助
        </div>
      )}
    </div>
  );
}
