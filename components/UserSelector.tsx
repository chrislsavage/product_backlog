"use client"

import { useBacklog } from "@/lib/context/BacklogContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserX, User } from "lucide-react"

interface UserSelectorProps {
  selectedUserId?: string
  onUserChange: (userId: string | undefined) => void
  placeholder?: string
  size?: "sm" | "default" | "lg"
  showUnassigned?: boolean
}

export default function UserSelector({
  selectedUserId,
  onUserChange,
  placeholder = "Assign to...",
  size = "default",
  showUnassigned = true,
}: UserSelectorProps) {
  const { state } = useBacklog()

  const selectedUser = state.users.find((user) => user.id === selectedUserId)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "product-owner":
        return "bg-purple-100 text-purple-800"
      case "scrum-master":
        return "bg-blue-100 text-blue-800"
      case "developer":
        return "bg-green-100 text-green-800"
      case "designer":
        return "bg-pink-100 text-pink-800"
      case "qa":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "product-owner":
        return "👑"
      case "scrum-master":
        return "🎯"
      case "developer":
        return "💻"
      case "designer":
        return "🎨"
      case "qa":
        return "🔍"
      default:
        return "👤"
    }
  }

  return (
    <Select
      value={selectedUserId || "unassigned"}
      onValueChange={(value) => onUserChange(value === "unassigned" ? undefined : value)}
    >
      <SelectTrigger className={size === "sm" ? "h-8 text-sm" : size === "lg" ? "h-12" : ""}>
        <SelectValue>
          {selectedUser ? (
            <div className="flex items-center space-x-2">
              <Avatar className={size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6"}>
                <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className={size === "sm" ? "text-xs" : ""}>
                  {selectedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className={size === "sm" ? "text-sm" : ""}>{selectedUser.name}</span>
              {size !== "sm" && (
                <Badge className={getRoleColor(selectedUser.role)} variant="secondary">
                  <span className="mr-1">{getRoleIcon(selectedUser.role)}</span>
                  {selectedUser.role.replace("-", " ")}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <UserX className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
              <span>{placeholder}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {showUnassigned && (
          <SelectItem value="unassigned">
            <div className="flex items-center space-x-2">
              <UserX className="w-4 h-4 text-gray-400" />
              <span>Unassigned</span>
            </div>
          </SelectItem>
        )}
        {state.users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">{getRoleIcon(user.role)}</span>
                  <span className="text-xs text-gray-500 capitalize">{user.role.replace("-", " ")}</span>
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
        {state.users.length === 0 && (
          <SelectItem value="no-users" disabled>
            <div className="flex items-center space-x-2 text-gray-400">
              <User className="w-4 h-4" />
              <span>No team members available</span>
            </div>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
