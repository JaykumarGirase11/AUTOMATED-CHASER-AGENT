'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { formatDateTime } from '@/lib/utils'

interface Comment {
  _id: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

interface CommentSectionProps {
  taskId: string
  initialComments: Comment[]
}

export default function CommentSection({ taskId, initialComments }: CommentSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setComments(data.comments)
        setNewComment('')
        toast({
          title: 'Comment added',
          description: 'Your comment has been posted.',
        })
        router.refresh()
      } else {
        toast({
          title: 'Failed to add comment',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !newComment.trim()} size="sm">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No comments yet</p>
          <p className="text-sm">Be the first to comment on this task</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(comment.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.userName}</span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
