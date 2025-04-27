"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>
  signup: (username: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  searchUsers: (query: string) => Promise<User[]>
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  updateAvatar: (avatarUrl: string) => Promise<boolean>
  requestPasswordReset: (username: string) => Promise<boolean>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Storage keys
const AUTH_TOKEN_KEY = "mooseDocs.authToken"
const USER_STORAGE_KEY = "mooseDocs.user"
const USERS_STORAGE_KEY = "mooseDocs.users"
const PASSWORDS_STORAGE_KEY = "mooseDocs.passwords"

// Initial default users
const defaultUsers: User[] = [
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
]

// Default passwords (in a real app, these would be hashed and stored securely)
const defaultPasswords: Record<string, string> = {
  "1": "password123",
  "2": "password123",
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [passwords, setPasswords] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Initialize users and passwords from localStorage or defaults
  useEffect(() => {
    const initializeStorage = () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          setIsLoading(false)
          return
        }

        // Initialize users
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY)
        if (!storedUsers) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers))
          setUsers(defaultUsers)
        } else {
          setUsers(JSON.parse(storedUsers))
        }

        // Initialize passwords
        const storedPasswords = localStorage.getItem(PASSWORDS_STORAGE_KEY)
        if (!storedPasswords) {
          localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(defaultPasswords))
          setPasswords(defaultPasswords)
        } else {
          setPasswords(JSON.parse(storedPasswords))
        }

        // Check for existing session
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // Check for auth token
          const token = localStorage.getItem(AUTH_TOKEN_KEY)
          if (token) {
            // In a real app, we would validate the token with the server
            // For this demo, we'll just parse the stored user ID from the token
            const userId = token.split(":")[0]
            const foundUser = JSON.parse(storedUsers || "[]").find((u: User) => u.id === userId)

            if (foundUser) {
              setUser(foundUser)
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser))
            } else {
              // Invalid token, clear it
              localStorage.removeItem(AUTH_TOKEN_KEY)
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize user storage:", error)
        // Reset storage in case of corruption
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(USER_STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    initializeStorage()
  }, [])

  // Save users and passwords when they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }
  }, [users])

  useEffect(() => {
    if (Object.keys(passwords).length > 0) {
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords))
    }
  }, [passwords])

  const login = async (username: string, password: string, rememberMe = true): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find user by username
    const foundUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

    if (foundUser && passwords[foundUser.id] === password) {
      setUser(foundUser)

      // Always store the user object for persistence
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser))

      // Store auth token if rememberMe is true
      if (rememberMe) {
        // In a real app, this would be a JWT or other secure token
        // For this demo, we'll just use a simple format: userId:timestamp
        const token = `${foundUser.id}:${Date.now()}`
        localStorage.setItem(AUTH_TOKEN_KEY, token)
      }

      return true
    }

    return false
  }

  const signup = async (
    username: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if username already exists (case insensitive)
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return false
    }

    // Create new user with a unique ID
    const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const newUser: User = {
      id: newUserId,
      username,
      firstName,
      lastName,
      avatar: "/placeholder.svg?height=200&width=200",
    }

    // Update users and passwords
    const updatedUsers = [...users, newUser]
    const updatedPasswords = { ...passwords, [newUserId]: password }

    setUsers(updatedUsers)
    setPasswords(updatedPasswords)

    // Save to localStorage
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(updatedPasswords))

    // Log in the new user
    setUser(newUser)

    // Store user and auth token
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    const token = `${newUser.id}:${Date.now()}`
    localStorage.setItem(AUTH_TOKEN_KEY, token)

    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  const searchUsers = async (query: string): Promise<User[]> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!query) return []

    // Search users by username, first name, or last name
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        (u.firstName && u.firstName.toLowerCase().includes(query.toLowerCase())) ||
        (u.lastName && u.lastName.toLowerCase().includes(query.toLowerCase())),
    )
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!user) return false

    // Update user in users array
    const updatedUser = { ...user, ...updates }
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u))

    setUsers(updatedUsers)
    setUser(updatedUser)

    // Update stored user
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))

    return true
  }

  const updateAvatar = async (avatarUrl: string): Promise<boolean> => {
    return updateProfile({ avatar: avatarUrl })
  }

  const requestPasswordReset = async (username: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Find user by username
    const foundUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

    if (!foundUser) {
      return false
    }

    // In a real app, we would generate a reset token and send an email
    // For this demo, we'll just log the request
    console.log(`
      Password reset requested for user: ${username}
      User ID: ${foundUser.id}
      
      Email would be sent to: alemasx1@gmail.com
      
      Email content:
      Subject: Password Reset Request for ${username}
      
      Hello,
      
      A password reset has been requested for the Moose Docs account: ${username}.
      
      To reset the password, please click on the following link:
      https://moosedocs.com/reset-password?token=mock-token-${foundUser.id}-${Date.now()}
      
      If you did not request this password reset, please ignore this email.
      
      Best regards,
      Moose Docs Team
    `)

    return true
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        searchUsers,
        updateProfile,
        updateAvatar,
        requestPasswordReset,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
