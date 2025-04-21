"use client"

import { useState } from "react"
import { useDocument, type Comment } from "@/contexts/document-context"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import { CommentThread } from "./comment-thread"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CommentSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCommentSelect: (comment: Comment) => void
}

export function CommentSidebar({ isOpen, onClose, onCommentSelect }: CommentSidebarProps) {
  const { currentDocument } = useDocument()
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all")

  const comments = currentDocument?.comments || []

  const filteredComments = comments.filter((comment) => {
    if (filter === "open") return !comment.resolved
    if (filter === "resolved") return comment.resolved
    return true
  })

  const openCount = comments.filter((comment) => !comment.resolved).length
  const resolvedCount = comments.filter((comment) => comment.resolved).length

  if (!isOpen) return null

  return (
    <div className="w-80 border-l h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1" onClick={() => setFilter("all")}>
              All ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="open" className="flex-1" onClick={() => setFilter("open")}>
              Open ({openCount})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex-1" onClick={() => setFilter("resolved")}>
              Resolved ({resolvedCount})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 p-0">
          <CommentList comments={filteredComments} onCommentSelect={onCommentSelect} />
        </TabsContent>
        <TabsContent value="open" className="flex-1 p-0">
          <CommentList comments={filteredComments} onCommentSelect={onCommentSelect} />
        </TabsContent>
        <TabsContent value="resolved" className="flex-1 p-0">
          <CommentList comments={filteredComments} onCommentSelect={onCommentSelect} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CommentList({
  comments,
  onCommentSelect,
}: { comments: Comment[]; onCommentSelect: (comment: Comment) => void }) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
        <p>No comments found</p>
        <p className="text-sm">Select text and click the comment button to add a comment</p>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer"
            onClick={() => onCommentSelect(comment)}
          >
            <CommentThread comment={comment} compact />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
