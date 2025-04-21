"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MooseIcon } from "@/components/moose-icon"
import { useUser } from "@/contexts/user-context"
import { Loader2, Camera, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

// Sample avatar options
const avatarOptions = [
  "/placeholder.svg?height=200&width=200&text=Avatar1",
  "/placeholder.svg?height=200&width=200&text=Avatar2",
  "/placeholder.svg?height=200&width=200&text=Avatar3",
  "/placeholder.svg?height=200&width=200&text=Avatar4",
  "/placeholder.svg?height=200&width=200&text=Avatar5",
  "/placeholder.svg?height=200&width=200&text=Avatar6",
]

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: userLoading, updateProfile, updateAvatar } = useUser()
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [customAvatarUrl, setCustomAvatarUrl] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile")
    }
  }, [userLoading, isAuthenticated, router])

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setSelectedAvatar(user.avatar || null)
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsUpdating(true)

    try {
      const result = await updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      })

      if (result) {
        setSuccess(true)
      } else {
        setError("Failed to update profile")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAvatarSelect = async (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl)
    setIsUpdating(true)

    try {
      await updateAvatar(avatarUrl)
      setSuccess(true)
    } catch (err) {
      setError("Failed to update avatar")
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCustomAvatarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customAvatarUrl) return

    setIsUpdating(true)

    try {
      await updateAvatar(customAvatarUrl)
      setSelectedAvatar(customAvatarUrl)
      setSuccess(true)
      setCustomAvatarUrl("")
    } catch (err) {
      setError("Failed to update avatar")
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MooseIcon className="h-6 w-6" />
              <span className="text-xl font-bold">Profile Settings</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Your profile has been updated successfully.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Profile Picture</h2>
              <p className="text-muted-foreground">Choose an avatar or enter a custom URL</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-2 border-primary">
                <AvatarImage src={selectedAvatar || ""} alt={user?.username || "User"} />
                <AvatarFallback className="text-4xl">
                  {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 w-full">
                {avatarOptions.map((avatar, index) => (
                  <button
                    key={index}
                    className={`relative rounded-md overflow-hidden border-2 ${
                      selectedAvatar === avatar ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatar || "/placeholder.svg"} alt={`Avatar option ${index + 1}`} />
                      <AvatarFallback>{index + 1}</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>

              <div className="w-full">
                <form onSubmit={handleCustomAvatarSubmit} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="custom-avatar" className="sr-only">
                      Custom Avatar URL
                    </Label>
                    <Input
                      id="custom-avatar"
                      placeholder="Enter custom avatar URL"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={!customAvatarUrl || isUpdating}>
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    <span className="ml-2">Set</span>
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">Update your personal details</p>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user?.username || ""} disabled />
                <p className="text-sm text-muted-foreground">Username cannot be changed</p>
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
