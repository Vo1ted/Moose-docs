"use client"

import { useState } from "react"
import { useDocument, type Comment, type FileAttachment } from "@/contexts/document-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, MoreVertical, Pencil, Trash2, X, MessageSquarePlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/user-context"
import { FileAttachmentUploader, FileAttachmentViewer } from "./file-attachment"

interface CommentThreadProps {
  comment: Comment
  compact?: boolean
  onClose?: () => void
}

export function CommentThread({ comment, compact = false, onClose }: CommentThreadProps) {
  const { user } = useUser()
  const {
    updateComment,
    resolveComment,
    deleteComment,
    addCommentReply,
    deleteCommentReply,
    addCommentAttachment,
    removeCommentAttachment,
  } = useDocument()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [replyContent, setReplyContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [replyAttachments, setReplyAttachments] = useState<FileAttachment[]>([])

  const isAuthor = user?.id === comment.authorId

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return
    setIsSaving(true)
    try {
      await updateComment(comment.documentId, comment.id, editedContent)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update comment:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResolve = async () => {
    try {
      await resolveComment(comment.documentId, comment.id, !comment.resolved)
    } catch (error) {
      console.error("Failed to resolve comment:", error)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(comment.documentId, comment.id)
        if (onClose) onClose()
      } catch (error) {
        console.error("Failed to delete comment:", error)
      }
    }
  }

  const handleAddReply = async () => {
    if (!replyContent.trim()) return
    setIsSaving(true)
    try {
      await addCommentReply(comment.documentId, comment.id, replyContent, replyAttachments)
      setReplyContent("")
      setReplyAttachments([])
      setIsReplying(false)
    } catch (error) {
      console.error("Failed to add reply:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    if (confirm("Are you sure you want to delete this reply?")) {
      try {
        await deleteCommentReply(comment.documentId, comment.id, replyId)
      } catch (error) {
        console.error("Failed to delete reply:", error)
      }
    }
  }

  const handleAttachFile = async (attachment: FileAttachment) => {
    if (isReplying) {
      setReplyAttachments([...replyAttachments, attachment])
    } else {
      try {
        await addCommentAttachment(comment.documentId, comment.id, attachment)
      } catch (error) {
        console.error("Failed to add attachment:", error)
      }
    }
  }

  const handleRemoveAttachment = async (attachmentId: string, replyId?: string) => {
    if (isReplying) {
      setReplyAttachments(replyAttachments.filter((att) => att.id !== attachmentId))
    } else {
      try {
        await removeCommentAttachment(comment.documentId, comment.id, attachmentId, replyId)
      } catch (error) {
        console.error("Failed to remove attachment:", error)
      }
    }
  }

  if (compact) {
    return (
      <div className={`space-y-2 ${comment.resolved ? "opacity-70" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} alt={comment.authorName} />
              <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{comment.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {comment.resolved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
        <p className="text-sm">{comment.content}</p>
        {comment.attachments.length > 0 && (
          <p className="text-xs text-muted-foreground">{comment.attachments.length} attachment(s)</p>
        )}
        {comment.replies.length > 0 && (
          <p className="text-xs text-muted-foreground">{comment.replies.length} replies</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} alt={comment.authorName} />
            <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{comment.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit} disabled={isSaving || !editedContent.trim()}>
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-1">{comment.content}</p>
                {comment.attachments.length > 0 && <FileAttachmentViewer attachments={comment.attachments} />}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleResolve}>
                {comment.resolved ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    <span>Unresolve</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Resolve</span>
                  </>
                )}
              </DropdownMenuItem>
              {isAuthor && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="pl-10 space-y-4 border-l ml-4">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={reply.authorAvatar || "/placeholder.svg"} alt={reply.authorName} />
                    <AvatarFallback>{reply.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{reply.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                    {reply.attachments.length > 0 && <FileAttachmentViewer attachments={reply.attachments} />}
                  </div>
                </div>
                {user?.id === reply.authorId && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteReply(reply.id)}>
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete reply</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add reply */}
      {!comment.resolved && (
        <div className="pl-10 ml-4">
          {isReplying ? (
            <div className="space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px]"
              />

              <FileAttachmentUploader
                attachments={replyAttachments}
                onAttach={handleAttachFile}
                onRemove={handleRemoveAttachment}
                disabled={isSaving}
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReplying(false)
                    setReplyAttachments([])
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddReply} disabled={isSaving || !replyContent.trim()}>
                  {isSaving ? "Sending..." : "Reply"}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setIsReplying(true)}>
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
