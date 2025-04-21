"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "./user-context"
import { v4 as uuidv4 } from "uuid"

// File attachment type
export interface FileAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

// Mock document data
export interface DocumentMeta {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  owner: string
  starred: boolean
  content?: string
  comments?: Comment[]
}

export interface Comment {
  id: string
  documentId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
  updatedAt: string
  resolved: boolean
  position: {
    startOffset: number
    endOffset: number
    text: string
  }
  attachments: FileAttachment[]
  replies: CommentReply[]
}

export interface CommentReply {
  id: string
  commentId: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: string
  attachments: FileAttachment[]
}

interface DocumentContextType {
  documents: DocumentMeta[]
  currentDocument: DocumentMeta | null
  setCurrentDocument: (doc: DocumentMeta | null) => void
  createDocument: (title: string) => Promise<DocumentMeta>
  updateDocumentTitle: (id: string, title: string) => Promise<boolean>
  updateDocumentContent: (id: string, content: string) => Promise<boolean>
  starDocument: (id: string, starred: boolean) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>
  currentUsers: { id: string; username: string; color: string }[]
  // Comment functions
  addComment: (
    documentId: string,
    content: string,
    position: { startOffset: number; endOffset: number; text: string },
    attachments?: FileAttachment[],
  ) => Promise<Comment>
  updateComment: (documentId: string, commentId: string, content: string) => Promise<boolean>
  resolveComment: (documentId: string, commentId: string, resolved: boolean) => Promise<boolean>
  deleteComment: (documentId: string, commentId: string) => Promise<boolean>
  addCommentReply: (
    documentId: string,
    commentId: string,
    content: string,
    attachments?: FileAttachment[],
  ) => Promise<CommentReply>
  deleteCommentReply: (documentId: string, commentId: string, replyId: string) => Promise<boolean>
  addCommentAttachment: (
    documentId: string,
    commentId: string,
    attachment: FileAttachment,
    replyId?: string,
  ) => Promise<boolean>
  removeCommentAttachment: (
    documentId: string,
    commentId: string,
    attachmentId: string,
    replyId?: string,
  ) => Promise<boolean>
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

// Mock documents
const mockDocuments: DocumentMeta[] = [
  {
    id: "1",
    title: "Project Proposal",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-04-17T14:20:00Z",
    owner: "1",
    starred: true,
    content: "<h1>Project Proposal</h1><p>This is a sample project proposal document.</p>",
    comments: [
      {
        id: "comment1",
        documentId: "1",
        authorId: "2",
        authorName: "Jane Doe",
        authorAvatar: "/placeholder.svg?height=200&width=200",
        content: "I think we should expand on the budget section.",
        createdAt: "2023-04-16T10:30:00Z",
        updatedAt: "2023-04-16T10:30:00Z",
        resolved: false,
        position: {
          startOffset: 45,
          endOffset: 73,
          text: "sample project proposal document",
        },
        attachments: [],
        replies: [
          {
            id: "reply1",
            commentId: "comment1",
            authorId: "1",
            authorName: "John Doe",
            authorAvatar: "/placeholder.svg?height=200&width=200",
            content: "Good point, I'll work on that.",
            createdAt: "2023-04-16T11:15:00Z",
            attachments: [],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Meeting Notes",
    createdAt: "2023-04-10T09:15:00Z",
    updatedAt: "2023-04-16T11:45:00Z",
    owner: "1",
    starred: false,
    content: "<h1>Meeting Notes</h1><p>Notes from our last team meeting.</p>",
    comments: [],
  },
  {
    id: "3",
    title: "Marketing Plan",
    createdAt: "2023-04-05T16:20:00Z",
    updatedAt: "2023-04-14T13:10:00Z",
    owner: "1",
    starred: true,
    content: "<h1>Marketing Plan</h1><p>Our marketing strategy for the next quarter.</p>",
    comments: [],
  },
  {
    id: "4",
    title: "Budget Report",
    createdAt: "2023-03-28T11:00:00Z",
    updatedAt: "2023-04-12T09:30:00Z",
    owner: "1",
    starred: false,
    content: "<h1>Budget Report</h1><p>Financial overview for the current fiscal year.</p>",
    comments: [],
  },
  {
    id: "5",
    title: "Product Roadmap",
    createdAt: "2023-03-20T14:45:00Z",
    updatedAt: "2023-04-10T16:15:00Z",
    owner: "1",
    starred: false,
    content: "<h1>Product Roadmap</h1><p>Our product development plan for the next 12 months.</p>",
    comments: [],
  },
]

// Generate a random color for user cursor
const getRandomColor = () => {
  const colors = [
    "#FF6633",
    "#FFB399",
    "#FF33FF",
    "#FFFF99",
    "#00B3E6",
    "#E6B333",
    "#3366E6",
    "#999966",
    "#99FF99",
    "#B34D4D",
    "#80B300",
    "#809900",
    "#E6B3B3",
    "#6680B3",
    "#66991A",
    "#FF99E6",
    "#CCFF1A",
    "#FF1A66",
    "#E6331A",
    "#33FFCC",
    "#66994D",
    "#B366CC",
    "#4D8000",
    "#B33300",
    "#CC80CC",
    "#66664D",
    "#991AFF",
    "#E666FF",
    "#4DB3FF",
    "#1AB399",
    "#E666B3",
    "#33991A",
    "#CC9999",
    "#B3B31A",
    "#00E680",
    "#4D8066",
    "#809980",
    "#E6FF80",
    "#1AFF33",
    "#999933",
    "#FF3380",
    "#CCCC00",
    "#66E64D",
    "#4D80CC",
    "#9900B3",
    "#E64D66",
    "#4DB380",
    "#FF4D4D",
    "#99E6E6",
    "#6666FF",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function DocumentProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [documents, setDocuments] = useState<DocumentMeta[]>(mockDocuments)
  const [currentDocument, setCurrentDocument] = useState<DocumentMeta | null>(null)
  const [currentUsers, setCurrentUsers] = useState<{ id: string; username: string; color: string }[]>([])

  // Simulate other users joining when a document is opened
  useEffect(() => {
    if (currentDocument && user) {
      const userColor = getRandomColor()

      // Add current user
      const currentUser = {
        id: user.id,
        username: user.username,
        color: userColor,
      }

      // Simulate other users (only for existing documents, not new ones)
      const simulatedUsers =
        currentDocument.id !== "new"
          ? [
              { id: "sim1", username: "alex_writer", color: getRandomColor() },
              { id: "sim2", username: "sam_editor", color: getRandomColor() },
            ]
          : []

      setCurrentUsers([currentUser, ...simulatedUsers])

      return () => {
        setCurrentUsers([])
      }
    }
  }, [currentDocument, user])

  const createDocument = async (title: string): Promise<DocumentMeta> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newDoc: DocumentMeta = {
      id: uuidv4(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: user?.id || "unknown",
      starred: false,
      content: `<h1>${title}</h1><p>Start typing to edit this document...</p>`,
      comments: [],
    }

    setDocuments((prev) => [newDoc, ...prev])
    return newDoc
  }

  const updateDocumentTitle = async (id: string, title: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title, updatedAt: new Date().toISOString() } : doc)),
    )

    if (currentDocument?.id === id) {
      setCurrentDocument((prev) => (prev ? { ...prev, title, updatedAt: new Date().toISOString() } : null))
    }

    return true
  }

  const updateDocumentContent = async (id: string, content: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, content, updatedAt: new Date().toISOString() } : doc)),
    )

    if (currentDocument?.id === id) {
      setCurrentDocument((prev) => (prev ? { ...prev, content, updatedAt: new Date().toISOString() } : null))
    }

    return true
  }

  const starDocument = async (id: string, starred: boolean): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, starred } : doc)))

    if (currentDocument?.id === id) {
      setCurrentDocument((prev) => (prev ? { ...prev, starred } : null))
    }

    return true
  }

  const deleteDocument = async (id: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setDocuments((prev) => prev.filter((doc) => doc.id !== id))

    if (currentDocument?.id === id) {
      setCurrentDocument(null)
    }

    return true
  }

  // Comment functions
  const addComment = async (
    documentId: string,
    content: string,
    position: { startOffset: number; endOffset: number; text: string },
    attachments: FileAttachment[] = [],
  ): Promise<Comment> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!user) {
      throw new Error("User must be logged in to add a comment")
    }

    const newComment: Comment = {
      id: uuidv4(),
      documentId,
      authorId: user.id,
      authorName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
      authorAvatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolved: false,
      position,
      attachments,
      replies: [],
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          const comments = doc.comments || []
          return {
            ...doc,
            comments: [...comments, newComment],
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev) return null
        const comments = prev.comments || []
        return {
          ...prev,
          comments: [...comments, newComment],
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return newComment
  }

  const updateComment = async (documentId: string, commentId: string, content: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.map((comment) =>
              comment.id === commentId ? { ...comment, content, updatedAt: new Date().toISOString() } : comment,
            ),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev || !prev.comments) return prev
        return {
          ...prev,
          comments: prev.comments.map((comment) =>
            comment.id === commentId ? { ...comment, content, updatedAt: new Date().toISOString() } : comment,
          ),
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return true
  }

  const resolveComment = async (documentId: string, commentId: string, resolved: boolean): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.map((comment) =>
              comment.id === commentId ? { ...comment, resolved, updatedAt: new Date().toISOString() } : comment,
            ),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev || !prev.comments) return prev
        return {
          ...prev,
          comments: prev.comments.map((comment) =>
            comment.id === commentId ? { ...comment, resolved, updatedAt: new Date().toISOString() } : comment,
          ),
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return true
  }

  const deleteComment = async (documentId: string, commentId: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.filter((comment) => comment.id !== commentId),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev || !prev.comments) return prev
        return {
          ...prev,
          comments: prev.comments.filter((comment) => comment.id !== commentId),
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return true
  }

  const addCommentReply = async (
    documentId: string,
    commentId: string,
    content: string,
    attachments: FileAttachment[] = [],
  ): Promise<CommentReply> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!user) {
      throw new Error("User must be logged in to add a reply")
    }

    const newReply: CommentReply = {
      id: uuidv4(),
      commentId,
      authorId: user.id,
      authorName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username,
      authorAvatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
      attachments,
    }

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, newReply],
                  updatedAt: new Date().toISOString(),
                }
              }
              return comment
            }),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev || !prev.comments) return prev
        return {
          ...prev,
          comments: prev.comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...comment.replies, newReply],
                updatedAt: new Date().toISOString(),
              }
            }
            return comment
          }),
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return newReply
  }

  const deleteCommentReply = async (documentId: string, commentId: string, replyId: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter((reply) => reply.id !== replyId),
                  updatedAt: new Date().toISOString(),
                }
              }
              return comment
            }),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev || !prev.comments) return prev
        return {
          ...prev,
          comments: prev.comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: comment.replies.filter((reply) => reply.id !== replyId),
                updatedAt: new Date().toISOString(),
              }
            }
            return comment
          }),
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return true
  }

  // File attachment functions
  const addCommentAttachment = async (
    documentId: string,
    commentId: string,
    attachment: FileAttachment,
    replyId?: string,
  ): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.map((comment) => {
              if (comment.id === commentId) {
                if (replyId) {
                  // Add attachment to a reply
                  return {
                    ...comment,
                    replies: comment.replies.map((reply) => {
                      if (reply.id === replyId) {
                        return {
                          ...reply,
                          attachments: [...reply.attachments, attachment],
                        }
                      }
                      return reply
                    }),
                    updatedAt: new Date().toISOString(),
                  }
                } else {
                  // Add attachment to the comment
                  return {
                    ...comment,
                    attachments: [...comment.attachments, attachment],
                    updatedAt: new Date().toISOString(),
                  }
                }
              }
              return comment
            }),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev || !prev.comments) return prev
        return {
          ...prev,
          comments: prev.comments.map((comment) => {
            if (comment.id === commentId) {
              if (replyId) {
                // Add attachment to a reply
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id === replyId) {
                      return {
                        ...reply,
                        attachments: [...reply.attachments, attachment],
                      }
                    }
                    return reply
                  }),
                  updatedAt: new Date().toISOString(),
                }
              } else {
                // Add attachment to the comment
                return {
                  ...comment,
                  attachments: [...comment.attachments, attachment],
                  updatedAt: new Date().toISOString(),
                }
              }
            }
            return comment
          }),
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return true
  }

  const removeCommentAttachment = async (
    documentId: string,
    commentId: string,
    attachmentId: string,
    replyId?: string,
  ): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.map((comment) => {
              if (comment.id === commentId) {
                if (replyId) {
                  // Remove attachment from a reply
                  return {
                    ...comment,
                    replies: comment.replies.map((reply) => {
                      if (reply.id === replyId) {
                        return {
                          ...reply,
                          attachments: reply.attachments.filter((att) => att.id !== attachmentId),
                        }
                      }
                      return reply
                    }),
                    updatedAt: new Date().toISOString(),
                  }
                } else {
                  // Remove attachment from the comment
                  return {
                    ...comment,
                    attachments: comment.attachments.filter((att) => att.id !== attachmentId),
                    updatedAt: new Date().toISOString(),
                  }
                }
              }
              return comment
            }),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    )

    if (currentDocument?.id === documentId) {
      setCurrentDocument((prev) => {
        if (!prev || !prev.comments) return prev
        return {
          ...prev,
          comments: prev.comments.map((comment) => {
            if (comment.id === commentId) {
              if (replyId) {
                // Remove attachment from a reply
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id === replyId) {
                      return {
                        ...reply,
                        attachments: reply.attachments.filter((att) => att.id !== attachmentId),
                      }
                    }
                    return reply
                  }),
                  updatedAt: new Date().toISOString(),
                }
              } else {
                // Remove attachment from the comment
                return {
                  ...comment,
                  attachments: comment.attachments.filter((att) => att.id !== attachmentId),
                  updatedAt: new Date().toISOString(),
                }
              }
            }
            return comment
          }),
          updatedAt: new Date().toISOString(),
        }
      })
    }

    return true
  }

  return (
    <DocumentContext.Provider
      value={{
        documents,
        currentDocument,
        setCurrentDocument,
        createDocument,
        updateDocumentTitle,
        updateDocumentContent,
        starDocument,
        deleteDocument,
        currentUsers,
        // Comment functions
        addComment,
        updateComment,
        resolveComment,
        deleteComment,
        addCommentReply,
        deleteCommentReply,
        addCommentAttachment,
        removeCommentAttachment,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocument() {
  const context = useContext(DocumentContext)
  if (context === undefined) {
    throw new Error("useDocument must be used within a DocumentProvider")
  }
  return context
}
