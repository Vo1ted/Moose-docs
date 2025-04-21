"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ActiveUsersProps {
  users: { id: string; username: string; color: string }[]
}

export function ActiveUsers({ users }: ActiveUsersProps) {
  if (!users.length) return null

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {users.slice(0, 5).map((user) => (
        <div key={user.id} className="relative">
          <Avatar className="h-8 w-8 border-2 border-background" style={{ borderColor: user.color }}>
            <AvatarImage src={`/placeholder.svg?text=${user.username[0]}`} alt={user.username} />
            <AvatarFallback style={{ backgroundColor: user.color }}>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-5 left-0 right-0 text-xs text-center opacity-0 group-hover:opacity-100 whitespace-nowrap">
            {user.username}
          </span>
        </div>
      ))}
      {users.length > 5 && (
        <Avatar className="h-8 w-8 border-2 border-background">
          <AvatarFallback>+{users.length - 5}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
