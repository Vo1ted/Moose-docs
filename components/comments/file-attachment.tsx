"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, FileIcon, ImageIcon, FileText, Loader2 } from "lucide-react"
import { put } from "@vercel/blob"

export interface FileAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

interface FileAttachmentProps {
  attachments: FileAttachment[]
  onAttach: (attachment: FileAttachment) => void
  onRemove: (attachmentId: string) => void
  disabled?: boolean
}

export function FileAttachmentUploader({ attachments, onAttach, onRemove, disabled = false }: FileAttachmentProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const file = files[0]

      // Upload to Vercel Blob
      const response = await put(file.name, file, {
        access: "public",
        handleUploadProgress: (progress) => {
          setUploadProgress(Math.round(progress * 100))
        },
      })

      // Create attachment object
      const attachment: FileAttachment = {
        id: response.url,
        name: file.name,
        url: response.url,
        type: file.type,
        size: file.size,
      }

      onAttach(attachment)
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset the input
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {/* File input */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="file-attachment"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("file-attachment")?.click()}
          disabled={disabled || isUploading}
          className="text-xs"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Uploading {uploadProgress}%
            </>
          ) : (
            <>
              <Paperclip className="h-3 w-3 mr-1" />
              Attach File
            </>
          )}
        </Button>
      </div>

      {/* Attached files */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 bg-muted rounded-md text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                {attachment.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />
                ) : attachment.type.includes("pdf") ? (
                  <FileText className="h-4 w-4 text-red-500 shrink-0" />
                ) : (
                  <FileIcon className="h-4 w-4 text-gray-500 shrink-0" />
                )}
                <span className="truncate">{attachment.name}</span>
                <span className="text-muted-foreground">({formatFileSize(attachment.size)})</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onRemove(attachment.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function FileAttachmentViewer({ attachments }: { attachments: FileAttachment[] }) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="space-y-2 mt-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 bg-muted rounded-md text-xs hover:bg-muted/80 transition-colors"
        >
          {attachment.type.startsWith("image/") ? (
            <div className="relative w-full max-h-40 overflow-hidden rounded-md">
              <img
                src={attachment.url || "/placeholder.svg"}
                alt={attachment.name}
                className="w-full h-auto object-contain"
              />
            </div>
          ) : (
            <>
              {attachment.type.includes("pdf") ? (
                <FileText className="h-4 w-4 text-red-500 shrink-0" />
              ) : (
                <FileIcon className="h-4 w-4 text-gray-500 shrink-0" />
              )}
              <span className="truncate">{attachment.name}</span>
              <span className="text-muted-foreground">({formatFileSize(attachment.size)})</span>
            </>
          )}
        </a>
      ))}
    </div>
  )
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
