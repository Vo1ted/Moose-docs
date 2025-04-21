"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MooseIcon } from "@/components/moose-icon"
import { PlusIcon, FileTextIcon, FolderIcon, StarIcon, LogOut, Settings, User } from "lucide-react"
import { BackgroundCustomizer, type BackgroundSettings } from "@/components/background-customizer"
import { CustomBackground } from "@/components/custom-background"
import { useUser } from "@/contexts/user-context"
import { useDocument } from "@/contexts/document-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const defaultBackgroundSettings: BackgroundSettings = {
  type: "color",
  color: "#f9fafb",
  gradient: {
    from: "#4f46e5",
    to: "#06b6d4",
    direction: "to bottom right",
  },
  image: {
    url: "/placeholder.svg?height=1080&width=1920",
    overlay: true,
    overlayColor: "#000000",
    overlayOpacity: 0.5,
  },
  particles: {
    colorMode: "single",
    color: "#4f46e5",
    colorSecondary: "#ef4444",
    colorCycleSpeed: 3,
    number: 50,
    speed: 3,
    connected: true,
    repulseDistance: 50,
  },
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: userLoading, logout } = useUser()
  const { documents } = useDocument()
  const router = useRouter()

  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>(defaultBackgroundSettings)
  const [activeTab, setActiveTab] = useState<"all" | "starred" | "shared">("all")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [userLoading, isAuthenticated, router])

  // Load saved background settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("mooseDocs.backgroundSettings")
    if (savedSettings) {
      try {
        setBackgroundSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Failed to parse saved background settings:", error)
      }
    }
  }, [])

  // Save background settings to localStorage when they change
  const handleBackgroundSettingsChange = (settings: BackgroundSettings) => {
    setBackgroundSettings(settings)
    localStorage.setItem("mooseDocs.backgroundSettings", JSON.stringify(settings))
  }

  // Filter documents based on active tab
  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === "starred") return doc.starred
    // In a real app, we would filter shared documents here
    return true
  })

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Custom Background */}
      <CustomBackground settings={backgroundSettings} />

      {/* Background Customizer */}
      <BackgroundCustomizer onSettingsChange={handleBackgroundSettingsChange} initialSettings={backgroundSettings} />

      <header className="border-b bg-background/80 backdrop-blur-sm relative z-10">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <MooseIcon className="h-8 w-8" />
            <span className="text-xl font-bold">Moose Docs</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback>{user.firstName?.[0] || user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                      </span>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1 relative z-10">
        <aside className="hidden w-64 border-r bg-background/80 backdrop-blur-sm md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <Button asChild className="justify-start gap-2">
              <Link href="/document/new">
                <PlusIcon className="h-4 w-4" />
                New Document
              </Link>
            </Button>
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveTab("all")}
            >
              <FileTextIcon className="h-4 w-4" />
              My Documents
            </Button>
            <Button
              variant={activeTab === "starred" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveTab("starred")}
            >
              <StarIcon className="h-4 w-4" />
              Starred
            </Button>
            <Button
              variant={activeTab === "shared" ? "default" : "ghost"}
              className="justify-start gap-2"
              onClick={() => setActiveTab("shared")}
            >
              <FolderIcon className="h-4 w-4" />
              Shared with me
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {activeTab === "all" && "My Documents"}
              {activeTab === "starred" && "Starred Documents"}
              {activeTab === "shared" && "Shared with me"}
            </h1>
            <Button asChild>
              <Link href="/document/new">
                <PlusIcon className="h-4 w-4 mr-2" />
                New Document
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <Link key={doc.id} href={`/document/${doc.id}`}>
                <Card className="h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-background/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{doc.title}</CardTitle>
                    {doc.starred && <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />}
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Document</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
            {filteredDocuments.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <FileTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === "all" && "Create your first document to get started"}
                  {activeTab === "starred" && "Star documents to find them quickly"}
                  {activeTab === "shared" && "No documents have been shared with you yet"}
                </p>
                {activeTab === "all" && (
                  <Button asChild>
                    <Link href="/document/new">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Document
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
