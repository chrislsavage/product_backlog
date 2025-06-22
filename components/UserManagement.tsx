"use client"

import { useState } from "react"
import { useBacklog } from "@/lib/context/BacklogContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Users, Mail, UserCheck, Edit, Trash2 } from "lucide-react"
import type { User } from "@/lib/types"

export default function UserManagement() {
  const { state, createUser, updateUser, deleteUser } = useBacklog()
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "developer" as User["role"],
    avatar: "",
  })

  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return

    try {
      await createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        avatar: newUser.avatar || `/placeholder.svg?height=32&width=32`,
      })

      setNewUser({ name: "", email: "", role: "developer", avatar: "" })
      setIsAddingUser(false)
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !editingUser.name.trim() || !editingUser.email.trim()) return

    try {
      await updateUser(editingUser)
      setEditingUser(null)
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This will unassign them from all items.")) {
      try {
        await deleteUser(userId)
      } catch (error) {
        console.error("Failed to delete user:", error)
      }
    }
  }

  const getRoleColor = (role: User["role"]) => {
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

  const getRoleIcon = (role: User["role"]) => {
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

  // Get user assignment statistics
  const getUserStats = (userId: string) => {
    let assignedFeatures = 0
    let assignedEpics = 0
    let assignedUserStories = 0
    let assignedTasks = 0

    state.products.forEach((product) => {
      product.features.forEach((feature) => {
        if (feature.assignedUserId === userId) assignedFeatures++

        feature.epics.forEach((epic) => {
          if (epic.assignedUserId === userId) assignedEpics++

          epic.userStories.forEach((userStory) => {
            if (userStory.assignedUserId === userId) assignedUserStories++

            userStory.tasks.forEach((task) => {
              if (task.assignedUserId === userId) assignedTasks++
            })
          })
        })
      })
    })

    return { assignedFeatures, assignedEpics, assignedUserStories, assignedTasks }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center">
            <Users className="w-6 h-6 mr-2" />
            Team Members
          </h2>
          <p className="text-gray-600 mt-1">Manage your team and assign work items</p>
        </div>
        <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
              <DialogDescription>Add a new team member who can be assigned to work items.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: User["role"]) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product-owner">👑 Product Owner</SelectItem>
                    <SelectItem value="scrum-master">🎯 Scrum Master</SelectItem>
                    <SelectItem value="developer">💻 Developer</SelectItem>
                    <SelectItem value="designer">🎨 Designer</SelectItem>
                    <SelectItem value="qa">🔍 QA Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL (optional)</Label>
                <Input
                  id="avatar"
                  value={newUser.avatar}
                  onChange={(e) => setNewUser({ ...newUser, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Add Team Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.users.map((user) => {
          const stats = getUserStats(user.id)
          const totalAssigned =
            stats.assignedFeatures + stats.assignedEpics + stats.assignedUserStories + stats.assignedTasks

          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser({ ...user })}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team Member</DialogTitle>
                          <DialogDescription>Update team member information.</DialogDescription>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-email">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editingUser.email}
                                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-role">Role</Label>
                              <Select
                                value={editingUser.role}
                                onValueChange={(value: User["role"]) => setEditingUser({ ...editingUser, role: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="product-owner">👑 Product Owner</SelectItem>
                                  <SelectItem value="scrum-master">🎯 Scrum Master</SelectItem>
                                  <SelectItem value="developer">💻 Developer</SelectItem>
                                  <SelectItem value="designer">🎨 Designer</SelectItem>
                                  <SelectItem value="qa">🔍 QA Engineer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit-avatar">Avatar URL</Label>
                              <Input
                                id="edit-avatar"
                                value={editingUser.avatar || ""}
                                onChange={(e) => setEditingUser({ ...editingUser, avatar: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingUser(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateUser}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getRoleColor(user.role)} variant="secondary">
                      <span className="mr-1">{getRoleIcon(user.role)}</span>
                      {user.role.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <UserCheck className="w-4 h-4" />
                      <span>{totalAssigned} assigned</span>
                    </div>
                  </div>

                  {totalAssigned > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Current Assignments:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {stats.assignedFeatures > 0 && (
                          <div className="flex justify-between">
                            <span>Features:</span>
                            <span className="font-medium">{stats.assignedFeatures}</span>
                          </div>
                        )}
                        {stats.assignedEpics > 0 && (
                          <div className="flex justify-between">
                            <span>Epics:</span>
                            <span className="font-medium">{stats.assignedEpics}</span>
                          </div>
                        )}
                        {stats.assignedUserStories > 0 && (
                          <div className="flex justify-between">
                            <span>Stories:</span>
                            <span className="font-medium">{stats.assignedUserStories}</span>
                          </div>
                        )}
                        {stats.assignedTasks > 0 && (
                          <div className="flex justify-between">
                            <span>Tasks:</span>
                            <span className="font-medium">{stats.assignedTasks}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {state.users.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-4">Add team members to start assigning work items.</p>
            <Button onClick={() => setIsAddingUser(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Team Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
