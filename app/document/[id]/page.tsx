"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MooseIcon } from "@/components/moose-icon"
import { Editor } from "@/components/editor"
import { Share2, Save, ChevronLeft, Star } from "lucide-react"
import { ShareDialog, type SharedUser } from "@/components/share-dialog"
import { useUser } from "@/contexts/user-context"
import { useDocument } from "@/contexts/document-context"
import { useRouter } from "next/navigation"

export default function DocumentPage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated, isLoading: userLoading } = useUser()
  const { documents, currentDocument, setCurrentDocument, updateDocumentTitle, starDocument, updateDocumentContent } =
    useDocument()

  const router = useRouter()
  const [title, setTitle] = useState("Untitled Document")
  const [loading, setLoading] = useState(true)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push("/login?redirect=/document/" + params.id)
    }
  }, [userLoading, isAuthenticated, router, params.id])

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (params.id === "new") {
        setCurrentDocument({
          id: "new",
          title: "Untitled Document",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          owner: user?.id || "unknown",
          starred: false,
          content: "<h1>Welcome to Moose Docs!</h1><p>Start typing to edit this document...</p>",
        })
        setTitle("Untitled Document")
      } else {
        const doc = documents.find((d) => d.id === params.id)
        if (doc) {
          setCurrentDocument(doc)
          setTitle(doc.title)
        } else {
          // Document not found
          router.push("/dashboard")
        }
      }
      setLoading(false)
    }

    if (!userLoading && isAuthenticated) {
      loadDocument()
    }
  }, [params.id, documents, setCurrentDocument, user, userLoading, isAuthenticated, router])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    if (currentDocument) {
      setCurrentDocument({
        ...currentDocument,
        title: e.target.value,
      })
    }
  }

  const handleTitleBlur = async () => {
    if (currentDocument && title !== currentDocument.title) {
      await updateDocumentTitle(currentDocument.id, title)
    }
  }

  const handleSave = async () => {
    if (!currentDocument) return

    setIsSaving(true)

    try {
      // Save title if changed
      if (title !== currentDocument.title) {
        await updateDocumentTitle(currentDocument.id, title)
      }

      // Content is saved automatically by the editor component
      // This is just a visual confirmation for the user
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error saving document:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = (users: SharedUser[]) => {
    setSharedUsers(users)
    // In a real app, we would save this to a database
    console.log(`Document ${params.id} shared with:`, users)
  }

  const handleStar = async () => {
    if (currentDocument) {
      await starDocument(currentDocument.id, !currentDocument.starred)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-20 bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MooseIcon className="h-6 w-6" />
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                className="bg-transparent text-lg font-medium focus:outline-none focus:ring-0 border-0 p-0"
              />
            </div>
            {currentDocument && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStar}
                className={currentDocument.starred ? "text-yellow-400" : ""}
              >
                <Star className={currentDocument.starred ? "fill-yellow-400" : ""} size={16} />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
        <Editor />
      </main>

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        documentId={params.id}
        documentTitle={title}
        onShare={handleShare}
        initialSharedUsers={sharedUsers}
      />
    </div>
  )
}
