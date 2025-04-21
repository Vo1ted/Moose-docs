"use client"

import type { Comment } from "@/contexts/document-context"
import { MessageSquare } from "lucide-react"

interface CommentMarkerProps {
  comment: Comment
  onClick: (comment: Comment) => void
}

export function CommentMarker({ comment, onClick }: CommentMarkerProps) {
  return (
    <button
      className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${
        comment.resolved ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
      } hover:bg-opacity-80 transition-colors`}
      onClick={() => onClick(comment)}
      title={`Comment by ${comment.authorName}`}
    >
      <MessageSquare className="h-3 w-3" />
    </button>
  )
}
