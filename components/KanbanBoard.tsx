"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useBacklog } from "@/lib/context/BacklogContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, CheckSquare, Filter, X, Edit, Save, DeleteIcon as Cancel, Calendar } from "lucide-react"
import type { Task, SprintStatus } from "@/lib/types"
import UserSelector from "./UserSelector"

export default function KanbanBoard() {
  const { state, dispatch, updateTask, setCurrentSprint } = useBacklog()

  // Filter states
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [selectedUserStory, setSelectedUserStory] = useState<string>("all")
  const [selectedEpic, setSelectedEpic] = useState<string>("all")
  const [selectedFeature, setSelectedFeature] = useState<string>("all")
  const [selectedSprintFilter, setSelectedSprintFilter] = useState<string>("current")

  // Editing states
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<{
    title: string
    description: string
    priority: number
    estimatedHours: number | undefined
  }>({
    title: "",
    description: "",
    priority: 5,
    estimatedHours: undefined,
  })

  const columns: { id: SprintStatus; title: string; color: string }[] = [
    { id: "backlog", title: "Backlog", color: "bg-gray-100" },
    { id: "sprint-backlog", title: "Sprint Backlog", color: "bg-blue-100" },
    { id: "in-progress", title: "In Progress", color: "bg-yellow-100" },
    { id: "review", title: "Review", color: "bg-purple-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
  ]

  // Get all tasks with their hierarchy information
  const allTasks = useMemo(() => {
    const tasks: Array<
      Task & {
        userStory: { id: string; title: string; storyPoints?: number }
        epic: { id: string; title: string }
        feature: { id: string; name: string }
        product: { id: string; name: string }
      }
    > = []

    state.products.forEach((product) => {
      product.features.forEach((feature) => {
        feature.epics.forEach((epic) => {
          epic.userStories.forEach((userStory) => {
            userStory.tasks.forEach((task) => {
              tasks.push({
                ...task,
                userStory: {
                  id: userStory.id,
                  title: userStory.title,
                  storyPoints: userStory.storyPoints,
                },
                epic: {
                  id: epic.id,
                  title: epic.title,
                },
                feature: {
                  id: feature.id,
                  name: feature.name,
                },
                product: {
                  id: product.id,
                  name: product.name,
                },
              })
            })
          })
        })
      })
    })

    return tasks
  }, [state.products])

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const users = state.users
    const userStories = [...new Set(allTasks.map((t) => ({ id: t.userStory.id, title: t.userStory.title })))]
    const epics = [...new Set(allTasks.map((t) => ({ id: t.epic.id, title: t.epic.title })))]
    const features = [...new Set(allTasks.map((t) => ({ id: t.feature.id, name: t.feature.name })))]

    return { users, userStories, epics, features }
  }, [allTasks, state.users])

  // Filter tasks based on selected filters
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (selectedUser !== "all" && task.assignedUserId !== selectedUser) return false
      if (selectedUserStory !== "all" && task.userStory.id !== selectedUserStory) return false
      if (selectedEpic !== "all" && task.epic.id !== selectedEpic) return false
      if (selectedFeature !== "all" && task.feature.id !== selectedFeature) return false

      // Sprint filter
      if (selectedSprintFilter === "current" && task.sprintId !== state.currentSprint?.id) return false
      if (
        selectedSprintFilter !== "current" &&
        selectedSprintFilter !== "all" &&
        task.sprintId !== selectedSprintFilter
      )
        return false

      return true
    })
  }, [
    allTasks,
    selectedUser,
    selectedUserStory,
    selectedEpic,
    selectedFeature,
    selectedSprintFilter,
    state.currentSprint,
  ])

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800"
    if (priority >= 6) return "bg-orange-100 text-orange-800"
    if (priority >= 4) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getUserById = (userId?: string) => {
    return state.users.find((user) => user.id === userId)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ task, type: "task" }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, sprintStatus: SprintStatus) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))
    const { task } = data

    // Update the task with completion tracking
    const updatedTask = {
      ...task,
      sprintStatus,
      status: sprintStatus === "done" ? "done" : task.status,
      completedAt: sprintStatus === "done" ? new Date() : task.completedAt,
    }

    updateTask(updatedTask)
  }

  const handleEditStart = (task: Task) => {
    setEditingTask(task.id)
    setEditingData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      estimatedHours: task.estimatedHours,
    })
  }

  const handleEditSave = async (task: Task) => {
    try {
      const updatedTask = {
        ...task,
        title: editingData.title,
        description: editingData.description,
        priority: editingData.priority,
        estimatedHours: editingData.estimatedHours,
      }
      await updateTask(updatedTask)
      setEditingTask(null)
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleEditCancel = () => {
    setEditingTask(null)
    setEditingData({
      title: "",
      description: "",
      priority: 5,
      estimatedHours: undefined,
    })
  }

  const clearFilters = () => {
    setSelectedUser("all")
    setSelectedUserStory("all")
    setSelectedEpic("all")
    setSelectedFeature("all")
    setSelectedSprintFilter("current")
  }

  const hasActiveFilters =
    selectedUser !== "all" ||
    selectedUserStory !== "all" ||
    selectedEpic !== "all" ||
    selectedFeature !== "all" ||
    selectedSprintFilter !== "current"

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => dispatch({ type: "SET_VIEW", payload: "backlog" })}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Backlog
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sprint Planning Board</h1>
              <p className="text-gray-600 mt-2">Manage tasks across sprint stages</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="current-sprint">Current Sprint:</Label>
              <Select
                value={state.currentSprint?.id || "none"}
                onValueChange={(value) => {
                  if (value !== "none") {
                    setCurrentSprint(value)
                  }
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue>
                    {state.currentSprint ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{state.currentSprint.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Current Sprint</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {state.sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{sprint.name}</span>
                        {sprint.isCurrent && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="sprint-filter">Sprint</Label>
                <Select value={selectedSprintFilter} onValueChange={setSelectedSprintFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sprints" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sprints</SelectItem>
                    <SelectItem value="current">Current Sprint Only</SelectItem>
                    {state.sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="user-filter">Assigned User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {filterOptions.users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="feature-filter">Feature</Label>
                <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                  <SelectTrigger>
                    <SelectValue placeholder="All features" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Features</SelectItem>
                    {filterOptions.features.map((feature) => (
                      <SelectItem key={feature.id} value={feature.id}>
                        {feature.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="epic-filter">Epic</Label>
                <Select value={selectedEpic} onValueChange={setSelectedEpic}>
                  <SelectTrigger>
                    <SelectValue placeholder="All epics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Epics</SelectItem>
                    {filterOptions.epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="story-filter">User Story</Label>
                <Select value={selectedUserStory} onValueChange={setSelectedUserStory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All user stories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All User Stories</SelectItem>
                    {filterOptions.userStories.map((story) => (
                      <SelectItem key={story.id} value={story.id}>
                        {story.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Showing {filteredTasks.length} of {allTasks.length} tasks
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="grid grid-cols-5 gap-4 h-[calc(100vh-300px)]">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 flex flex-col`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <h3 className="font-semibold text-lg mb-4 text-center">{column.title}</h3>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {filteredTasks
                  .filter((task) => task.sprintStatus === column.id)
                  .map((task) => {
                    const assignedUser = getUserById(task.assignedUserId)
                    const isEditing = editingTask === task.id

                    return (
                      <Card
                        key={task.id}
                        className="cursor-move hover:shadow-md transition-shadow border-l-4 border-l-blue-500 group"
                        draggable={!isEditing}
                        onDragStart={(e) => !isEditing && handleDragStart(e, task)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {isEditing ? (
                                <Input
                                  value={editingData.title}
                                  onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                                  className="font-medium text-sm mb-2"
                                  placeholder="Task title"
                                />
                              ) : (
                                <CardTitle className="text-sm flex items-center">
                                  <CheckSquare className="w-4 h-4 mr-1" />
                                  {task.title}
                                </CardTitle>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditSave(task)}
                                    className="h-6 w-6 p-0 text-green-600"
                                  >
                                    <Save className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleEditCancel}
                                    className="h-6 w-6 p-0 text-gray-600"
                                  >
                                    <Cancel className="w-3 h-3" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditStart(task)}
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Description */}
                            {isEditing ? (
                              <Input
                                value={editingData.description}
                                onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                                placeholder="Task description"
                                className="text-xs"
                              />
                            ) : (
                              task.description && <p className="text-xs text-gray-600">{task.description}</p>
                            )}

                            {/* Hierarchy Path */}
                            <div className="text-xs text-gray-500 space-y-1">
                              <div className="truncate">📦 {task.product.name}</div>
                              <div className="truncate">⭐ {task.feature.name}</div>
                              <div className="truncate">⚡ {task.epic.title}</div>
                              <div className="truncate">📖 {task.userStory.title}</div>
                              {task.userStory.storyPoints && (
                                <div className="text-xs">
                                  <Badge variant="outline" className="text-xs">
                                    {task.userStory.storyPoints} pts
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Priority and Hours */}
                            <div className="flex items-center justify-between">
                              {isEditing ? (
                                <div className="flex items-center space-x-2">
                                  <Select
                                    value={editingData.priority.toString()}
                                    onValueChange={(value) =>
                                      setEditingData({ ...editingData, priority: Number.parseInt(value) })
                                    }
                                  >
                                    <SelectTrigger className="w-16 h-6 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                                        <SelectItem key={p} value={p.toString()}>
                                          P{p}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="number"
                                    value={editingData.estimatedHours || ""}
                                    onChange={(e) =>
                                      setEditingData({
                                        ...editingData,
                                        estimatedHours: e.target.value ? Number.parseInt(e.target.value) : undefined,
                                      })
                                    }
                                    placeholder="Hours"
                                    className="w-16 h-6 text-xs"
                                  />
                                </div>
                              ) : (
                                <>
                                  <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                    P{task.priority}
                                  </Badge>
                                  {task.estimatedHours && (
                                    <Badge variant="outline" className="text-xs">
                                      {task.estimatedHours}h
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Completion Date */}
                            {task.completedAt && (
                              <div className="text-xs text-green-600 flex items-center space-x-1">
                                <span>✓</span>
                                <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                              </div>
                            )}

                            {/* Assigned User */}
                            <div className="flex items-center justify-between">
                              {assignedUser && (
                                <div className="flex items-center space-x-1">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage src={assignedUser.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs">
                                      {assignedUser.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">{assignedUser.name}</span>
                                </div>
                              )}

                              {!isEditing && (
                                <div className="opacity-0 group-hover:opacity-100">
                                  <UserSelector
                                    selectedUserId={task.assignedUserId}
                                    onUserChange={(userId) => {
                                      const updatedTask = { ...task, assignedUserId: userId }
                                      updateTask(updatedTask)
                                    }}
                                    size="sm"
                                    placeholder="Assign"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
