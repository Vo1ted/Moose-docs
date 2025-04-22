"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"

// Import types from existing contexts
import type { User } from "@/contexts/user-context"
import type { DocumentMeta, Comment, CommentReply, FileAttachment } from "@/contexts/document-context"

// Static data that will be loaded from JSON
interface StaticData {
  users: User[]
  documents: DocumentMeta[]
  currentUsers: { id: string; username: string; color: string }[]
}

// Context type
interface StaticDataContextType {
  data: StaticData
  isLoading: boolean
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  currentDocument: DocumentMeta | null
  setCurrentDocument: (doc: DocumentMeta | null) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean

  // Document operations
  createDocument: (title: string) => Promise<DocumentMeta>
  updateDocumentTitle: (id: string, title: string) => Promise<boolean>
  updateDocumentContent: (id: string, content: string) => Promise<boolean>
  starDocument: (id: string, starred: boolean) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>

  // Comment operations
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
}

// Initial static data
const initialData: StaticData = {
  users: [
    {
      id: "1",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      avatar: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "2",
      username: "janedoe",
      firstName: "Jane",
      lastName: "Doe",
      avatar: "/placeholder.svg?height=200&width=200",
    },
  ],
  documents: [
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
  ],
  currentUsers: [
    { id: "1", username: "johndoe", color: "#FF6633" },
    { id: "sim1", username: "alex_writer", color: "#00B3E6" },
    { id: "sim2", username: "sam_editor", color: "#3366E6" },
  ],
}

// Create context
const StaticDataContext = createContext<StaticDataContextType | undefined>(undefined)

// Mock passwords (in a real app, these would be hashed and stored securely)
const mockPasswords: Record<string, string> = {
  "1": "password123",
  "2": "password123",
}

// Provider component
export function StaticDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StaticData>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentDocument, setCurrentDocument] = useState<DocumentMeta | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        // Try to load data from localStorage
        const storedData = localStorage.getItem("mooseDocs.data")
        if (storedData) {
          setData(JSON.parse(storedData))
        }

        // Try to load current user from localStorage
        const storedUser = localStorage.getItem("mooseDocs.user")
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to load data from localStorage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("mooseDocs.data", JSON.stringify(data))
    }
  }, [data, isLoading])

  // Save current user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("mooseDocs.user", JSON.stringify(currentUser))
    } else {
      localStorage.removeItem("mooseDocs.user")
    }
  }, [currentUser])

  // Authentication functions
  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find user by username
    const foundUser = data.users.find((u) => u.username === username)

    if (foundUser && mockPasswords[foundUser.id] === password) {
      setCurrentUser(foundUser)
      return true
    }

    return false
  }

  const logout = () => {
    setCurrentUser(null)
    setCurrentDocument(null)
  }

  // Document operations
  const createDocument = async (title: string): Promise<DocumentMeta> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newDoc: DocumentMeta = {
      id: uuidv4(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: currentUser?.id || "unknown",
      starred: false,
      content: `<h1>${title}</h1><p>Start typing to edit this document...</p>`,
      comments: [],
    }

    setData((prev) => ({
      ...prev,
      documents: [newDoc, ...prev.documents],
    }))

    return newDoc
  }

  const updateDocumentTitle = async (id: string, title: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id ? { ...doc, title, updatedAt: new Date().toISOString() } : doc,
      ),
    }))

    if (currentDocument?.id === id) {
      setCurrentDocument((prev) => (prev ? { ...prev, title, updatedAt: new Date().toISOString() } : null))
    }

    return true
  }

  const updateDocumentContent = async (id: string, content: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id ? { ...doc, content, updatedAt: new Date().toISOString() } : doc,
      ),
    }))

    if (currentDocument?.id === id) {
      setCurrentDocument((prev) => (prev ? { ...prev, content, updatedAt: new Date().toISOString() } : null))
    }

    return true
  }

  const starDocument = async (id: string, starred: boolean): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => (doc.id === id ? { ...doc, starred } : doc)),
    }))

    if (currentDocument?.id === id) {
      setCurrentDocument((prev) => (prev ? { ...prev, starred } : null))
    }

    return true
  }

  const deleteDocument = async (id: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    setData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    }))

    if (currentDocument?.id === id) {
      setCurrentDocument(null)
    }

    return true
  }

  // Comment operations
  const addComment = async (
    documentId: string,
    content: string,
    position: { startOffset: number; endOffset: number; text: string },
    attachments: FileAttachment[] = [],
  ): Promise<Comment> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!currentUser) {
      throw new Error("User must be logged in to add a comment")
    }

    const newComment: Comment = {
      id: uuidv4(),
      documentId,
      authorId: currentUser.id,
      authorName:
        currentUser.firstName && currentUser.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolved: false,
      position,
      attachments,
      replies: [],
    }

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
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
    }))

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

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
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
    }))

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

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
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
    }))

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

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
        if (doc.id === documentId && doc.comments) {
          return {
            ...doc,
            comments: doc.comments.filter((comment) => comment.id !== commentId),
            updatedAt: new Date().toISOString(),
          }
        }
        return doc
      }),
    }))

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

    if (!currentUser) {
      throw new Error("User must be logged in to add a reply")
    }

    const newReply: CommentReply = {
      id: uuidv4(),
      commentId,
      authorId: currentUser.id,
      authorName:
        currentUser.firstName && currentUser.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      attachments,
    }

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
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
    }))

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

    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) => {
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
    }))

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

  return (
    <StaticDataContext.Provider
      value={{
        data,
        isLoading,
        currentUser,
        setCurrentUser,
        currentDocument,
        setCurrentDocument,
        login,
        logout,
        isAuthenticated: !!currentUser,
        createDocument,
        updateDocumentTitle,
        updateDocumentContent,
        starDocument,
        deleteDocument,
        addComment,
        updateComment,
        resolveComment,
        deleteComment,
        addCommentReply,
        deleteCommentReply,
      }}
    >
      {children}
    </StaticDataContext.Provider>
  )
}

// Hook to use the context
export function useStaticData() {
  const context = useContext(StaticDataContext)
  if (context === undefined) {
    throw new Error("useStaticData must be used within a StaticDataProvider")
  }
  return context
}
