"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { FontSelector } from "./font-selector"
import { useStaticData } from "@/contexts/static-data-provider"
import type { Comment } from "@/contexts/document-context"
import { ActiveUsers } from "./active-users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ImageIcon,
  Type,
  Palette,
  Highlighter,
  Search,
  Upload,
  Save,
  MessageSquare,
} from "lucide-react"
import { CommentSidebar } from "./comments/comment-sidebar"
import { CommentPopup } from "./comments/comment-popup"

// Font sizes for the dropdown
const fontSizes = [
  { value: "1", label: "Small" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Large" },
  { value: "4", label: "X-Large" },
  { value: "5", label: "XX-Large" },
  { value: "6", label: "XXX-Large" },
  { value: "7", label: "XXXX-Large" },
]

// Mock Google Images search results
const mockGoogleImages = [
  "/placeholder.svg?height=300&width=400&text=Image1",
  "/placeholder.svg?height=300&width=400&text=Image2",
  "/placeholder.svg?height=300&width=400&text=Image3",
  "/placeholder.svg?height=300&width=400&text=Image4",
  "/placeholder.svg?height=300&width=400&text=Image5",
  "/placeholder.svg?height=300&width=400&text=Image6",
  "/placeholder.svg?height=300&width=400&text=Image7",
  "/placeholder.svg?height=300&width=400&text=Image8",
]

export function Editor() {
  const { currentDocument, updateDocumentContent, updateDocumentTitle, data } = useStaticData()
  const currentUsers = data.currentUsers
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentFont, setCurrentFont] = useState("Roboto")
  const [isLoading, setIsLoading] = useState(true)
  const [lastSavedContent, setLastSavedContent] = useState("")
  const [lastSavedTitle, setLastSavedTitle] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Comment state
  const [commentSidebarOpen, setCommentSidebarOpen] = useState(false)
  const [commentPopupOpen, setCommentPopupOpen] = useState(false)
  const [commentPopupPosition, setCommentPopupPosition] = useState({ x: 0, y: 0 })
  const [selectedComment, setSelectedComment] = useState<Comment | undefined>(undefined)
  const [textSelection, setTextSelection] = useState<
    | {
        startOffset: number
        endOffset: number
        text: string
      }
    | undefined
  >(undefined)

  // Initialize editor with document content
  useEffect(() => {
    if (editorRef.current && currentDocument?.content) {
      editorRef.current.innerHTML = currentDocument.content
      setLastSavedContent(currentDocument.content)
      setLastSavedTitle(currentDocument.title)
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => {
      clearTimeout(timer)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [currentDocument])

  // Auto-save content when it changes
  const handleContentChange = () => {
    if (!editorRef.current || !currentDocument) return

    const content = editorRef.current.innerHTML

    // Don't save if content hasn't changed
    if (content === lastSavedContent) return

    // Debounce saving to avoid too many updates
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateDocumentContent(currentDocument.id, content)
      setLastSavedContent(content)
    }, 1000)
  }

  const handleFontChange = (font: string) => {
    setCurrentFont(font)
    if (editorRef.current) {
      document.execCommand("fontName", false, font)
    }
  }

  const handleFontSizeChange = (size: string) => {
    document.execCommand("fontSize", false, size)
  }

  const handleTextColor = (color: string) => {
    document.execCommand("foreColor", false, color)
  }

  const handleHighlightColor = (color: string) => {
    document.execCommand("hiliteColor", false, color)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target?.result && editorRef.current) {
        // Insert image at cursor position
        const img = document.createElement("img")
        img.src = event.target.result as string
        img.style.maxWidth = "100%"
        img.style.height = "auto"
        img.alt = file.name

        // Focus the editor and insert the image
        editorRef.current.focus()
        document.execCommand("insertHTML", false, img.outerHTML)
        handleContentChange()
      }
    }

    reader.readAsDataURL(file)
    // Reset the file input
    e.target.value = ""
  }

  const handleGoogleImageSearch = () => {
    if (!searchQuery) return

    setIsSearching(true)

    // Simulate API call delay
    setTimeout(() => {
      setSearchResults(mockGoogleImages)
      setIsSearching(false)
    }, 800)
  }

  const insertGoogleImage = (imageUrl: string) => {
    if (editorRef.current) {
      // Insert image at cursor position
      const img = document.createElement("img")
      img.src = imageUrl
      img.style.maxWidth = "100%"
      img.style.height = "auto"
      img.alt = "Google Image"

      // Focus the editor and insert the image
      editorRef.current.focus()
      document.execCommand("insertHTML", false, img.outerHTML)
      handleContentChange()
    }
  }

  const handleSave = async () => {
    if (!currentDocument) return

    setIsSaving(true)

    try {
      // Save the content
      if (editorRef.current) {
        const content = editorRef.current.innerHTML
        if (content !== lastSavedContent) {
          await updateDocumentContent(currentDocument.id, content)
          setLastSavedContent(content)
        }
      }

      // Save the title if it has changed
      if (currentDocument.title !== lastSavedTitle) {
        await updateDocumentTitle(currentDocument.id, currentDocument.title)
        setLastSavedTitle(currentDocument.title)
      }
    } catch (error) {
      console.error("Error saving document:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle text selection for comments
  const handleEditorMouseUp = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !editorRef.current) return

    const range = selection.getRangeAt(0)
    const text = range.toString().trim()

    if (text) {
      // Calculate the position for the comment popup
      const rect = range.getBoundingClientRect()
      setCommentPopupPosition({
        x: rect.right + 10,
        y: rect.top,
      })

      // Get the offsets relative to the editor
      const editorContent = editorRef.current.innerHTML
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = editorContent

      // This is a simplified approach - in a real app, you'd need more robust offset calculation
      setTextSelection({
        startOffset: editorContent.indexOf(text),
        endOffset: editorContent.indexOf(text) + text.length,
        text,
      })

      // Show the comment button
      setCommentPopupOpen(true)
    }
  }

  const handleAddComment = () => {
    if (!textSelection) return

    // Show the comment popup
    setSelectedComment(undefined)
    setCommentPopupOpen(true)
  }

  const handleCommentSelect = (comment: Comment) => {
    setSelectedComment(comment)

    // Position the popup near the commented text
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      const index = content.indexOf(comment.position.text)

      if (index !== -1) {
        // Create a range to find the position
        const range = document.createRange()
        const textNodes = getTextNodes(editorRef.current)

        let charCount = 0
        let startNode = null
        let startOffset = 0

        // Find the text node containing the start of the comment
        for (const node of textNodes) {
          const nodeLength = node.textContent?.length || 0
          if (charCount + nodeLength > index) {
            startNode = node
            startOffset = index - charCount
            break
          }
          charCount += nodeLength
        }

        if (startNode) {
          range.setStart(startNode, startOffset)
          range.setEnd(startNode, startOffset + comment.position.text.length)

          const rect = range.getBoundingClientRect()
          setCommentPopupPosition({
            x: rect.right + 10,
            y: rect.top,
          })

          // Highlight the commented text
          window.getSelection()?.removeAllRanges()
          window.getSelection()?.addRange(range)
        }
      }
    }

    setCommentPopupOpen(true)
  }

  // Helper function to get all text nodes in an element
  const getTextNodes = (node: Node): Text[] => {
    const textNodes: Text[] = []

    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text)
    } else {
      const children = node.childNodes
      for (let i = 0; i < children.length; i++) {
        textNodes.push(...getTextNodes(children[i]))
      }
    }

    return textNodes
  }

  // Render comment markers in the editor
  const renderCommentMarkers = () => {
    if (!editorRef.current || !currentDocument?.comments) return

    // Clear existing markers
    const existingMarkers = editorRef.current.querySelectorAll(".comment-marker-container")
    existingMarkers.forEach((marker) => marker.remove())

    // Add new markers
    currentDocument.comments.forEach((comment) => {
      const content = editorRef.current!.innerHTML
      const index = content.indexOf(comment.position.text)

      if (index !== -1) {
        // Create a marker element
        const marker = document.createElement("span")
        marker.className = "comment-marker-container"
        marker.style.position = "relative"
        marker.style.display = "inline"

        // Create the marker icon
        const markerIcon = document.createElement("span")
        markerIcon.className = "comment-marker"
        markerIcon.style.position = "absolute"
        markerIcon.style.top = "-16px"
        markerIcon.style.right = "0"
        markerIcon.style.zIndex = "10"
        markerIcon.innerHTML = `<span class="inline-flex items-center justify-center h-5 w-5 rounded-full ${
          comment.resolved ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
        }"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>`

        markerIcon.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          handleCommentSelect(comment)
        })

        marker.appendChild(markerIcon)

        // Highlight the commented text
        const highlightedText = document.createElement("span")
        highlightedText.className = "comment-text"
        highlightedText.style.backgroundColor = comment.resolved ? "rgba(34, 197, 94, 0.1)" : "rgba(250, 204, 21, 0.1)"
        highlightedText.style.borderBottom = comment.resolved
          ? "1px solid rgba(34, 197, 94, 0.3)"
          : "1px solid rgba(250, 204, 21, 0.3)"
        highlightedText.textContent = comment.position.text

        marker.appendChild(highlightedText)

        // Insert the marker at the right position
        const textNodes = getTextNodes(editorRef.current)
        let charCount = 0
        let inserted = false

        for (const node of textNodes) {
          const nodeLength = node.textContent?.length || 0
          if (charCount <= index && index < charCount + nodeLength) {
            const range = document.createRange()
            range.setStart(node, index - charCount)
            range.setEnd(node, index - charCount + comment.position.text.length)
            range.deleteContents()
            range.insertNode(marker)
            inserted = true
            break
          }
          charCount += nodeLength
        }

        // If we couldn't insert at the exact position, try a simpler approach
        if (!inserted) {
          const tempDiv = document.createElement("div")
          tempDiv.innerHTML = content
          const before = content.substring(0, index)
          const after = content.substring(index + comment.position.text.length)
          editorRef.current.innerHTML = before + marker.outerHTML + after
        }
      }
    })
  }

  // Render comment markers when the document or comments change
  useEffect(() => {
    if (!isLoading && editorRef.current && currentDocument?.comments) {
      // Use a timeout to ensure the editor content is fully rendered
      const timer = setTimeout(() => {
        renderCommentMarkers()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isLoading, currentDocument?.comments])

  // Simulate collaborative editing by making random changes
  useEffect(() => {
    if (!currentDocument || currentDocument.id === "new" || currentUsers.length <= 1) return

    // Only simulate changes for existing documents with multiple users
    const simulateInterval = setInterval(() => {
      if (editorRef.current && Math.random() > 0.7) {
        // Find all paragraphs
        const paragraphs = editorRef.current.querySelectorAll("p")
        if (paragraphs.length > 0) {
          // Select a random paragraph
          const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)]

          // Add some text to it
          const randomUser = currentUsers.find((u) => u.id !== "sim1" && u.id !== "sim2")
          if (randomUser) {
            const randomText = ` [Edit by ${randomUser.username}] `
            randomParagraph.innerHTML += `<span style="color: ${randomUser.color}">${randomText}</span>`

            // Trigger content change handler
            handleContentChange()
          }
        }
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(simulateInterval)
  }, [currentDocument, currentUsers])

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-[calc(100vh-16rem)] bg-gray-100 animate-pulse rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 flex flex-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active users:</span>
          <ActiveUsers users={currentUsers} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={commentSidebarOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setCommentSidebarOpen(!commentSidebarOpen)}
            className="flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comments</span>
            {currentDocument?.comments && currentDocument.comments.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">{currentDocument.comments.length}</span>
            )}
          </Button>

          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="border rounded-md p-2 bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex flex-wrap gap-1 items-center">
        {/* Text formatting controls */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand("bold")}>
          <Bold className="h-4 w-4" />
          <span className="sr-only">Bold</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand("italic")}>
          <Italic className="h-4 w-4" />
          <span className="sr-only">Italic</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand("underline")}>
          <Underline className="h-4 w-4" />
          <span className="sr-only">Underline</span>
        </Button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Font selector */}
        <div className="flex items-center">
          <FontSelector onFontChange={handleFontChange} currentFont={currentFont} />
        </div>

        {/* Font size selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
              <Type className="h-3 w-3" />
              <span>Size</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <div className="p-2">
              {fontSizes.map((size) => (
                <Button
                  key={size.value}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => handleFontSizeChange(size.value)}
                >
                  <span className={`text-size-${size.value}`}>{size.label}</span>
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Text color selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
              <Palette className="h-3 w-3" />
              <span>Color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="grid grid-cols-8 gap-1">
              {[
                "#000000",
                "#434343",
                "#666666",
                "#999999",
                "#b7b7b7",
                "#cccccc",
                "#d9d9d9",
                "#efefef",
                "#f3f3f3",
                "#ffffff",
                "#980000",
                "#ff0000",
                "#ff9900",
                "#ffff00",
                "#00ff00",
                "#00ffff",
                "#4a86e8",
                "#0000ff",
                "#9900ff",
                "#ff00ff",
                "#e6b8af",
                "#f4cccc",
                "#fce5cd",
                "#fff2cc",
                "#d9ead3",
                "#d0e0e3",
                "#c9daf8",
                "#cfe2f3",
                "#d9d2e9",
                "#ead1dc",
              ].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ backgroundColor: color }}
                  onClick={() => handleTextColor(color)}
                  aria-label={`Text color: ${color}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Highlight color selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
              <Highlighter className="h-3 w-3" />
              <span>Highlight</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="grid grid-cols-8 gap-1">
              {[
                "#000000",
                "#434343",
                "#666666",
                "#999999",
                "#b7b7b7",
                "#cccccc",
                "#d9d9d9",
                "#efefef",
                "#f3f3f3",
                "#ffffff",
                "#980000",
                "#ff0000",
                "#ff9900",
                "#ffff00",
                "#00ff00",
                "#00ffff",
                "#4a86e8",
                "#0000ff",
                "#9900ff",
                "#ff00ff",
                "#e6b8af",
                "#f4cccc",
                "#fce5cd",
                "#fff2cc",
                "#d9ead3",
                "#d0e0e3",
                "#c9daf8",
                "#cfe2f3",
                "#d9d2e9",
                "#ead1dc",
              ].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ backgroundColor: color }}
                  onClick={() => handleHighlightColor(color)}
                  aria-label={`Highlight color: ${color}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Alignment controls */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
          <span className="sr-only">Align Left</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
          <span className="sr-only">Align Center</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => document.execCommand("justifyRight")}>
          <AlignRight className="h-4 w-4" />
          <span className="sr-only">Align Right</span>
        </Button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* List controls */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => document.execCommand("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
          <span className="sr-only">Bullet List</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => document.execCommand("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
          <span className="sr-only">Numbered List</span>
        </Button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

        {/* Image insertion */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              <span>Insert Image</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <Tabs defaultValue="upload">
              <TabsList className="w-full">
                <TabsTrigger value="upload" className="flex-1">
                  Upload
                </TabsTrigger>
                <TabsTrigger value="google" className="flex-1">
                  Google Images
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="p-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="image-upload" className="text-sm font-medium">
                      Upload from your device
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="google" className="p-4">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="google-search" className="text-sm font-medium">
                      Search Google Images
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="google-search"
                        placeholder="Search for images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleGoogleImageSearch()
                          }
                        }}
                      />
                      <Button onClick={handleGoogleImageSearch} disabled={isSearching}>
                        {isSearching ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {searchResults.map((imageUrl, index) => (
                        <button
                          key={index}
                          className="border rounded-md overflow-hidden hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                          onClick={() => insertGoogleImage(imageUrl)}
                        >
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={`Search result ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {/* Comment button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex items-center gap-1 ml-auto"
          onClick={handleAddComment}
          disabled={!textSelection}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Add Comment</span>
        </Button>
      </div>

      <div className="flex flex-1">
        {/* Main editor area */}
        <div className="flex-1">
          <div
            ref={editorRef}
            contentEditable
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-6 border rounded-md bg-white"
            style={{ fontFamily: currentFont }}
            onInput={handleContentChange}
            onBlur={handleContentChange}
            onMouseUp={handleEditorMouseUp}
            suppressContentEditableWarning
          />
        </div>

        {/* Comment sidebar */}
        {commentSidebarOpen && (
          <CommentSidebar
            isOpen={commentSidebarOpen}
            onClose={() => setCommentSidebarOpen(false)}
            onCommentSelect={handleCommentSelect}
          />
        )}
      </div>

      {/* Comment popup */}
      {commentPopupOpen && (
        <CommentPopup
          comment={selectedComment}
          position={commentPopupPosition}
          selection={textSelection}
          onClose={() => {
            setCommentPopupOpen(false)
            setSelectedComment(undefined)
            setTextSelection(undefined)
          }}
        />
      )}
    </div>
  )
}
