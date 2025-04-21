"use client"

import { useState, useRef, useEffect } from "react"
import { useDocument, type Comment, type FileAttachment } from "@/contexts/document-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CommentThread } from "./comment-thread"
import { X } from "lucide-react"
import { FileAttachmentUploader } from "./file-attachment"

interface CommentPopupProps {
  comment?: Comment
  position: { x: number; y: number }
  selection?: {
    startOffset: number
    endOffset: number
    text: string
  }
  onClose: () => void
}

export function CommentPopup({ comment, position, selection, onClose }: CommentPopupProps) {
  const { addComment } = useDocument()
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const popupRef = useRef<HTMLDivElement>(null)

  // Adjust position to ensure popup stays within viewport
  useEffect(() => {
    if (!popupRef.current) return

    const rect = popupRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let { x, y } = position

    // Adjust horizontal position if needed
    if (x + rect.width > viewportWidth - 20) {
      x = viewportWidth - rect.width - 20
    }

    // Adjust vertical position if needed
    if (y + rect.height > viewportHeight - 20) {
      y = viewportHeight - rect.height - 20
    }

    popupRef.current.style.left = `${x}px`
    popupRef.current.style.top = `${y}px`
  }, [position])

  const handleAddComment = async () => {
    if (!content.trim() || !selection) return

    setIsSaving(true)
    try {
      await addComment(
        // We're assuming the current document ID is available
        // In a real app, you'd get this from the current document
        selection.text.length > 0 ? "1" : "new",
        content,
        selection,
        attachments,
      )
      onClose()
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAttachFile = (attachment: FileAttachment) => {
    setAttachments([...attachments, attachment])
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter((att) => att.id !== attachmentId))
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-50 w-80 bg-background border rounded-md shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">{comment ? "Comment" : "Add Comment"}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        {comment ? (
          <CommentThread comment={comment} onClose={onClose} />
        ) : (
          <div className="space-y-3">
            {selection && selection.text && (
              <div className="bg-muted p-2 rounded-md text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1">Selected text:</p>
                <p className="italic">"{selection.text}"</p>
              </div>
            )}
            <Textarea
              placeholder="Add your comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />

            <FileAttachmentUploader
              attachments={attachments}
              onAttach={handleAttachFile}
              onRemove={handleRemoveAttachment}
              disabled={isSaving}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAddComment} disabled={isSaving || !content.trim()}>
                {isSaving ? "Adding..." : "Comment"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
