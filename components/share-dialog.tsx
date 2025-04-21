"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser, type User } from "@/contexts/user-context"
import { Check, Loader2, Search, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export type Permission = "view" | "edit" | "comment"

export interface SharedUser {
  user: User
  permission: Permission
}

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentTitle: string
  onShare: (users: SharedUser[]) => void
  initialSharedUsers?: SharedUser[]
}

export function ShareDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  onShare,
  initialSharedUsers = [],
}: ShareDialogProps) {
  const { searchUsers } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(initialSharedUsers)
  const [selectedPermission, setSelectedPermission] = useState<Permission>("view")

  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await searchUsers(searchTerm)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const addUser = (user: User) => {
    if (sharedUsers.some((shared) => shared.user.id === user.id)) {
      return
    }

    setSharedUsers([...sharedUsers, { user, permission: selectedPermission }])
    setSearchTerm("")
    setSearchResults([])
  }

  const removeUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter((shared) => shared.user.id !== userId))
  }

  const updatePermission = (userId: string, permission: Permission) => {
    setSharedUsers(sharedUsers.map((shared) => (shared.user.id === userId ? { ...shared, permission } : shared)))
  }

  const handleSave = () => {
    onShare(sharedUsers)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{documentTitle}"</DialogTitle>
          <DialogDescription>Enter a username to share this document with other users.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="username" className="sr-only">
                Username
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="username"
                  placeholder="Enter username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
                <Button type="button" size="icon" variant="outline" onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Label className="text-sm">Permission:</Label>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value as Permission)}
            >
              <option value="view">View</option>
              <option value="comment">Comment</option>
              <option value="edit">Edit</option>
            </select>
          </div>

          {searchResults.length > 0 && (
            <div className="border rounded-md">
              <ScrollArea className="h-[120px]">
                <div className="p-2 space-y-1">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => addUser(user)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>{user.firstName?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {sharedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Shared with:</Label>
              <div className="border rounded-md">
                <ScrollArea className="h-[180px]">
                  <div className="p-2 space-y-1">
                    {sharedUsers.map((shared) => (
                      <div
                        key={shared.user.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={shared.user.avatar || "/placeholder.svg"} alt={shared.user.username} />
                            <AvatarFallback>
                              {shared.user.firstName?.[0] || shared.user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {shared.user.firstName && shared.user.lastName
                                ? `${shared.user.firstName} ${shared.user.lastName}`
                                : shared.user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">@{shared.user.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={shared.permission}
                            onChange={(e) => updatePermission(shared.user.id, e.target.value as Permission)}
                          >
                            <option value="view">View</option>
                            <option value="comment">Comment</option>
                            <option value="edit">Edit</option>
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeUser(shared.user.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={sharedUsers.length === 0}>
            <Check className="mr-2 h-4 w-4" /> Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
