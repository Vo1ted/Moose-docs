"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MooseIcon } from "@/components/moose-icon"
import { useUser } from "@/contexts/user-context"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useUser()
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      const result = await requestPasswordReset(username)
      if (result) {
        setSuccess(true)
        // In a real app, we would redirect to a confirmation page
        // For this demo, we'll just show a success message
      } else {
        setError("Username not found")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col justify-center items-center p-4 md:p-8">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <MooseIcon className="h-10 w-10" />
          <span className="text-2xl font-bold">Moose Docs</span>
        </Link>
        <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-gray-500 dark:text-gray-400">Enter your username and we'll send a password reset link</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Password reset email has been sent to alemasx1@gmail.com. Please check the email for instructions to
                  reset your password.
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Return to Login
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link className="underline" href="/login">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
