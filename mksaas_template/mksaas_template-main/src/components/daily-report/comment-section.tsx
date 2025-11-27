'use client';

import { createComment, getComments } from '@/actions/daily-report';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { authClient } from '@/lib/auth-client';
import type { Comment, CommentTargetType } from '@/types/daily-report';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LogIn, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CommentSectionProps {
  targetType: CommentTargetType;
  targetId: string;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { data: session } = authClient.useSession();
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
    if (!session) {
      toast.error('请先登录');
      return;
    }

    if (!newComment.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createComment(
        {
          targetType,
          targetId,
          content: newComment,
        },
        session.user.id
      );

      if (result.success) {
        toast.success('评论发布成功');
        setNewComment('');
        await loadComments();
      } else {
        toast.error('评论发布失败');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error('评论发布失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        加载评论中...
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-12 border-t pt-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">评论 ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <div className="space-y-4">
        {session ? (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {session.user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="分享你的想法..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !newComment.trim()}
                    size="sm"
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
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="mb-4 text-muted-foreground">登录后参与讨论</p>
            <Button asChild variant="outline">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                去登录
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          暂无评论，来发表第一条评论吧
        </div>
      ) : (
        <div className="space-y-6">
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
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
        {comment.user?.name?.charAt(0) || 'U'}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.user?.name || '匿名用户'}
            </span>
            {comment.isFeatured && (
              <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800">
                精华
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">
          {comment.content}
        </p>
        {comment.likes > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span>👍 {comment.likes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
