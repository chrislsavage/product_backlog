"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useBacklog } from "@/lib/context/BacklogContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Package,
  Star,
  Zap,
  BookOpen,
  CheckSquare,
  Filter,
  FolderOpen,
  Folder,
  Kanban,
  Edit,
  GripVertical,
  Trash2,
  Calendar,
} from "lucide-react"
import type { Product, Feature, Epic, UserStory, Task } from "@/lib/types"
import UserSelector from "./UserSelector"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function HierarchyView() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: string } | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const [editingStoryPoints, setEditingStoryPoints] = useState<string | null>(null)
  const [tempStoryPoints, setTempStoryPoints] = useState<number | undefined>(undefined)

  const {
    state,
    dispatch,
    createProduct,
    createFeature,
    createEpic,
    createUserStory,
    createTask,
    updateProduct,
    updateFeature,
    updateEpic,
    updateUserStory,
    updateTask,
    assignTaskToSprint,
    assignUserStoryToSprint,
  } = useBacklog()

  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>()
    state.products.forEach((product) => {
      if (product.features.length > 0) {
        initialExpanded.add(product.id)
        product.features.forEach((feature) => {
          if (feature.epics.length > 0) {
            initialExpanded.add(feature.id)
            feature.epics.forEach((epic) => {
              if (epic.userStories.length > 0) {
                initialExpanded.add(epic.id)
                epic.userStories.forEach((userStory) => {
                  if (userStory.tasks.length > 0) {
                    initialExpanded.add(userStory.id)
                  }
                })
              }
            })
          }
        })
      }
    })
    return initialExpanded
  })

  const [addingItems, setAddingItems] = useState<Set<string>>(new Set())
  const [newItemTitles, setNewItemTitles] = useState<Record<string, string>>({})

  useEffect(() => {
    if (state.products.length > 0) {
      const newExpanded = new Set(expandedItems)
      state.products.forEach((product) => {
        if (product.features.length > 0) {
          newExpanded.add(product.id)
          product.features.forEach((feature) => {
            if (feature.epics.length > 0) {
              newExpanded.add(feature.id)
              feature.epics.forEach((epic) => {
                if (epic.userStories.length > 0) {
                  newExpanded.add(epic.id)
                }
              })
            }
          })
        }
      })
      setExpandedItems(newExpanded)
    }
  }, [state.products])

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const startAdding = (parentId: string, type: string) => {
    const key = `${parentId}-${type}`
    setAddingItems(new Set([...addingItems, key]))
    setNewItemTitles({ ...newItemTitles, [key]: "" })
  }

  const cancelAdding = (parentId: string, type: string) => {
    const key = `${parentId}-${type}`
    const newAddingItems = new Set(addingItems)
    newAddingItems.delete(key)
    setAddingItems(newAddingItems)

    const newTitles = { ...newItemTitles }
    delete newTitles[key]
    setNewItemTitles(newTitles)
  }

  const handleAddItem = async (parentId: string, type: string) => {
    const key = `${parentId}-${type}`
    const title = newItemTitles[key]?.trim()

    if (!title) return

    try {
      // Handle sibling task creation
      if (parentId.includes("-sibling")) {
        const taskId = parentId.replace("-sibling", "")
        // Find the task to get its user story ID
        let userStoryId = ""
        state.products.forEach((product) => {
          product.features.forEach((feature) => {
            feature.epics.forEach((epic) => {
              epic.userStories.forEach((userStory) => {
                const foundTask = userStory.tasks.find((t) => t.id === taskId)
                if (foundTask) {
                  userStoryId = userStory.id
                }
              })
            })
          })
        })

        if (userStoryId) {
          await createTask(userStoryId, {
            title: title,
            description: "",
            status: "todo",
            priority: 5,
            sprintStatus: "backlog",
          })
        }
      } else {
        switch (type) {
          case "product":
            await createProduct({
              name: title,
              description: "",
              version: "1.0.0",
            })
            break

          case "feature":
            await createFeature(parentId, {
              name: title,
              description: "",
              priority: 5,
            })
            break

          case "epic":
            await createEpic(parentId, {
              title: title,
              description: "",
              status: "planning",
              priority: 5,
            })
            break

          case "user-story":
            await createUserStory(parentId, {
              title: title,
              description: "",
              acceptanceCriteria: [],
              priority: 5,
              status: "backlog",
              sprintStatus: "backlog",
            })
            break

          case "task":
            await createTask(parentId, {
              title: title,
              description: "",
              status: "todo",
              priority: 5,
              sprintStatus: "backlog",
            })
            break
        }
      }

      cancelAdding(parentId, type)
    } catch (error) {
      console.error("Failed to create item:", error)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string, type: string) => {
    setDraggedItem({ id, type })
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", JSON.stringify({ id, type }))
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItem(targetId)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: string) => {
    e.preventDefault()
    setDragOverItem(null)

    if (!draggedItem || draggedItem.id === targetId) {
      setDraggedItem(null)
      return
    }

    // Only allow reordering within the same type and parent
    if (draggedItem.type !== targetType) {
      setDraggedItem(null)
      return
    }

    dispatch({
      type: "REORDER_ITEMS",
      payload: {
        draggedId: draggedItem.id,
        targetId: targetId,
        itemType: draggedItem.type,
      },
    })

    setDraggedItem(null)
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800"
    if (priority >= 6) return "bg-orange-100 text-orange-800"
    if (priority >= 4) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getUserById = (userId?: string) => {
    return state.users.find((user) => user.id === userId)
  }

  const getSprintById = (sprintId?: string) => {
    return state.sprints.find((sprint) => sprint.id === sprintId)
  }

  const getItemCount = (item: Product | Feature | Epic | UserStory) => {
    if ("features" in item) {
      return item.features.reduce(
        (total, feature) =>
          total +
          feature.epics.reduce(
            (epicTotal, epic) =>
              epicTotal +
              epic.userStories.reduce((storyTotal, story) => storyTotal + story.tasks.length, epic.userStories.length),
            feature.epics.length,
          ),
        item.features.length,
      )
    } else if ("epics" in item) {
      return item.epics.reduce(
        (total, epic) =>
          total +
          epic.userStories.reduce((storyTotal, story) => storyTotal + story.tasks.length, epic.userStories.length),
        item.epics.length,
      )
    } else if ("userStories" in item) {
      return item.userStories.reduce((total, story) => total + story.tasks.length, item.userStories.length)
    } else if ("tasks" in item) {
      return item.tasks.length
    }
    return 0
  }

  const renderAddItemRow = (parentId: string, type: string, level: number) => {
    const key = `${parentId}-${type}`
    const isAdding = addingItems.has(key)

    if (!isAdding) return null

    // Calculate proper indentation based on item type with larger fixed values
    let paddingLeft = "pl-8"
    if (type === "task") {
      paddingLeft = "pl-20"
    } else if (type === "user-story") {
      paddingLeft = "pl-16"
    } else if (type === "epic") {
      paddingLeft = "pl-12"
    } else if (type === "feature") {
      paddingLeft = "pl-8"
    } else if (type === "product") {
      paddingLeft = "pl-4"
    }

    return (
      <div className={`flex items-center py-2 ${paddingLeft} pr-4 border-l-2 border-blue-200`}>
        <div className="flex items-center space-x-2 flex-1">
          <Input
            value={newItemTitles[key] || ""}
            onChange={(e) => setNewItemTitles({ ...newItemTitles, [key]: e.target.value })}
            placeholder={`Enter ${type.replace("-", " ")} name...`}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddItem(parentId, type)
              } else if (e.key === "Escape") {
                cancelAdding(parentId, type)
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={() => handleAddItem(parentId, type)}>
            Add
          </Button>
          <Button size="sm" variant="outline" onClick={() => cancelAdding(parentId, type)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  const renderTask = (task: Task, level: number) => {
    const assignedUser = getUserById(task.assignedUserId)
    const assignedSprint = getSprintById(task.sprintId)
    const isDragOver = dragOverItem === task.id
    const isDragging = draggedItem?.id === task.id

    return (
      <div key={task.id}>
        <div
          className={`flex items-center py-3 pl-20 pr-4 hover:bg-gray-50 border-l-2 border-gray-100 group cursor-move ${
            isDragOver ? "bg-blue-50 border-blue-300" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id, "task")}
          onDragOver={(e) => handleDragOver(e, task.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, task.id, "task")}
        >
          <div className="flex items-center space-x-3 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span className="font-medium">{task.title}</span>
            <Badge className={getPriorityColor(task.priority)} variant="secondary">
              P{task.priority}
            </Badge>
            {task.completedAt && (
              <Badge variant="outline" className="text-xs text-green-600">
                ✓ {new Date(task.completedAt).toLocaleDateString()}
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(`${task.id}-sibling`, "task")}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteTask(task.id)
              }}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Owner */}
            <div className="w-32">
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
            {/* Count (estimated hours) */}
            <span className="text-sm text-gray-500 w-12 text-right">{task.estimatedHours || 0}h</span>
            {/* Sprint Assignment */}
            <div className="w-32">
              <Select
                value={task.sprintId || "none"}
                onValueChange={(value) => {
                  const sprintId = value === "none" ? null : value
                  assignTaskToSprint(task.id, sprintId)
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue>
                    {assignedSprint ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{assignedSprint.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Sprint</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sprint</SelectItem>
                  {state.sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
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

        {/* Add form appears directly below this task */}
        {renderAddItemRow(`${task.id}-sibling`, "task", level)}
      </div>
    )
  }

  const renderUserStory = (userStory: UserStory, level: number) => {
    const isExpanded = expandedItems.has(userStory.id)
    const assignedUser = getUserById(userStory.assignedUserId)
    const assignedSprint = getSprintById(userStory.sprintId)
    const taskCount = userStory.tasks.length
    const isDragOver = dragOverItem === userStory.id
    const isDragging = draggedItem?.id === userStory.id

    return (
      <div key={userStory.id}>
        <div
          className={`flex items-center py-3 pl-16 pr-4 hover:bg-gray-50 border-l-2 border-gray-100 group cursor-move ${
            isDragOver ? "bg-blue-50 border-blue-300" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, userStory.id, "user-story")}
          onDragOver={(e) => handleDragOver(e, userStory.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, userStory.id, "user-story")}
        >
          <div className="flex items-center space-x-3 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
            <button onClick={() => toggleExpanded(userStory.id)} className="p-1 hover:bg-gray-200 rounded">
              {taskCount > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            <BookOpen className="w-4 h-4 text-green-600" />
            <span className="font-medium">{userStory.title}</span>
            <Badge className={getPriorityColor(userStory.priority)} variant="secondary">
              P{userStory.priority}
            </Badge>
            {editingStoryPoints === userStory.id ? (
              <div className="flex items-center space-x-1">
                <Input
                  type="number"
                  min="1"
                  max="21"
                  value={tempStoryPoints || ""}
                  onChange={(e) => setTempStoryPoints(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                  className="w-16 h-6 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleStoryPointsSave(userStory)
                    } else if (e.key === "Escape") {
                      handleStoryPointsCancel()
                    }
                  }}
                  onBlur={() => handleStoryPointsSave(userStory)}
                  autoFocus
                />
                <span className="text-xs text-gray-500">pts</span>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation()
                  handleStoryPointsEdit(userStory.id, userStory.storyPoints)
                }}
              >
                {userStory.storyPoints || 0} pts
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(userStory.id, "task")}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteUserStory(userStory.id)
              }}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Owner */}
            <div className="w-32">
              <UserSelector
                selectedUserId={userStory.assignedUserId}
                onUserChange={(userId) => {
                  const updatedUserStory = { ...userStory, assignedUserId: userId }
                  updateUserStory(updatedUserStory)
                }}
                size="sm"
                placeholder="Assign"
              />
            </div>
            {/* Count */}
            <span className="text-sm text-gray-500 w-12 text-right">{taskCount}</span>
            {/* Sprint Assignment */}
            <div className="w-32">
              <Select
                value={userStory.sprintId || "none"}
                onValueChange={(value) => {
                  const sprintId = value === "none" ? null : value
                  assignUserStoryToSprint(userStory.id, sprintId)
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue>
                    {assignedSprint ? (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{assignedSprint.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Sprint</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Sprint</SelectItem>
                  {state.sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
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

        {renderAddItemRow(userStory.id, "task", level + 1)}

        {isExpanded && userStory.tasks.map((task) => renderTask(task, level + 1))}
      </div>
    )
  }

  const renderEpic = (epic: Epic, level: number) => {
    const isExpanded = expandedItems.has(epic.id)
    const assignedUser = getUserById(epic.assignedUserId)
    const itemCount = getItemCount(epic)
    const isDragOver = dragOverItem === epic.id
    const isDragging = draggedItem?.id === epic.id

    return (
      <div key={epic.id} className="group">
        <div
          className={`flex items-center py-3 pl-12 pr-4 hover:bg-gray-50 border-l-2 border-gray-200 cursor-move ${
            isDragOver ? "bg-blue-50 border-blue-300" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, epic.id, "epic")}
          onDragOver={(e) => handleDragOver(e, epic.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, epic.id, "epic")}
        >
          <div className="flex items-center space-x-3 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
            <button onClick={() => toggleExpanded(epic.id)} className="p-1 hover:bg-gray-200 rounded">
              {epic.userStories.length > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="font-medium">{epic.title}</span>
            <Badge className={getPriorityColor(epic.priority)} variant="secondary">
              P{epic.priority}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(epic.id, "user-story")}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteEpic(epic.id)
              }}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Owner */}
            <div className="w-32">
              <UserSelector
                selectedUserId={epic.assignedUserId}
                onUserChange={(userId) => {
                  const updatedEpic = { ...epic, assignedUserId: userId }
                  updateEpic(updatedEpic)
                }}
                size="sm"
                placeholder="Assign"
              />
            </div>
            {/* Count */}
            <span className="text-sm text-gray-500 w-12 text-right">{itemCount}</span>
            {/* Sprint Assignment - N/A for epics */}
            <div className="w-32">
              <span className="text-xs text-gray-400">N/A</span>
            </div>
          </div>
        </div>

        {renderAddItemRow(epic.id, "user-story", level + 1)}

        {isExpanded &&
          epic.userStories
            .sort((a, b) => b.priority - a.priority)
            .map((userStory) => renderUserStory(userStory, level + 1))}
      </div>
    )
  }

  const renderFeature = (feature: Feature, level: number) => {
    const isExpanded = expandedItems.has(feature.id)
    const assignedUser = getUserById(feature.assignedUserId)
    const itemCount = getItemCount(feature)
    const isDragOver = dragOverItem === feature.id
    const isDragging = draggedItem?.id === feature.id

    return (
      <div key={feature.id} className="group">
        <div
          className={`flex items-center py-3 pl-8 pr-4 hover:bg-gray-50 border-l-2 border-gray-300 cursor-move ${
            isDragOver ? "bg-blue-50 border-blue-300" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, feature.id, "feature")}
          onDragOver={(e) => handleDragOver(e, feature.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, feature.id, "feature")}
        >
          <div className="flex items-center space-x-3 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
            <button onClick={() => toggleExpanded(feature.id)} className="p-1 hover:bg-gray-200 rounded">
              {feature.epics.length > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            <Star className="w-4 h-4 text-purple-600" />
            <span className="font-medium">{feature.name}</span>
            <Badge className={getPriorityColor(feature.priority)} variant="secondary">
              P{feature.priority}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(feature.id, "epic")}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteFeature(feature.id)
              }}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Owner */}
            <div className="w-32">
              <UserSelector
                selectedUserId={feature.assignedUserId}
                onUserChange={(userId) => {
                  const updatedFeature = { ...feature, assignedUserId: userId }
                  updateFeature(updatedFeature)
                }}
                size="sm"
                placeholder="Assign"
              />
            </div>
            {/* Count */}
            <span className="text-sm text-gray-500 w-12 text-right">{itemCount}</span>
            {/* Sprint Assignment - N/A for features */}
            <div className="w-32">
              <span className="text-xs text-gray-400">N/A</span>
            </div>
          </div>
        </div>

        {renderAddItemRow(feature.id, "epic", level + 1)}

        {isExpanded && feature.epics.sort((a, b) => b.priority - a.priority).map((epic) => renderEpic(epic, level + 1))}
      </div>
    )
  }

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct)
      setEditingProduct(null)
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const handleStoryPointsEdit = (userStoryId: string, currentPoints?: number) => {
    setEditingStoryPoints(userStoryId)
    setTempStoryPoints(currentPoints)
  }

  const handleStoryPointsSave = async (userStory: UserStory) => {
    try {
      const updatedUserStory = { ...userStory, storyPoints: tempStoryPoints }
      await updateUserStory(updatedUserStory)
      setEditingStoryPoints(null)
      setTempStoryPoints(undefined)
    } catch (error) {
      console.error("Failed to update story points:", error)
    }
  }

  const handleStoryPointsCancel = () => {
    setEditingStoryPoints(null)
    setTempStoryPoints(undefined)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This will delete all features, epics, user stories, and tasks within it.",
      )
    ) {
      try {
        dispatch({ type: "DELETE_PRODUCT", payload: productId })
      } catch (error) {
        console.error("Failed to delete product:", error)
      }
    }
  }

  const handleDeleteFeature = async (featureId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this feature? This will delete all epics, user stories, and tasks within it.",
      )
    ) {
      try {
        dispatch({ type: "DELETE_FEATURE", payload: featureId })
      } catch (error) {
        console.error("Failed to delete feature:", error)
      }
    }
  }

  const handleDeleteEpic = async (epicId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this epic? This will delete all user stories and tasks within it.",
      )
    ) {
      try {
        dispatch({ type: "DELETE_EPIC", payload: epicId })
      } catch (error) {
        console.error("Failed to delete epic:", error)
      }
    }
  }

  const handleDeleteUserStory = async (userStoryId: string) => {
    if (window.confirm("Are you sure you want to delete this user story? This will delete all tasks within it.")) {
      try {
        dispatch({ type: "DELETE_USER_STORY", payload: userStoryId })
      } catch (error) {
        console.error("Failed to delete user story:", error)
      }
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        dispatch({ type: "DELETE_TASK", payload: taskId })
      } catch (error) {
        console.error("Failed to delete task:", error)
      }
    }
  }

  const renderProduct = (product: Product, level = 0) => {
    const isExpanded = expandedItems.has(product.id)
    const itemCount = getItemCount(product)
    const isDragOver = dragOverItem === product.id
    const isDragging = draggedItem?.id === product.id

    return (
      <div key={product.id} className="group">
        <div
          className={`flex items-center py-4 pl-2 pr-4 hover:bg-gray-50 border-l-4 border-blue-500 cursor-move ${
            isDragOver ? "bg-blue-50 border-blue-300" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, product.id, "product")}
          onDragOver={(e) => handleDragOver(e, product.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, product.id, "product")}
        >
          <div className="flex items-center space-x-3 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
            <button onClick={() => toggleExpanded(product.id)} className="p-1 hover:bg-gray-200 rounded">
              {product.features.length > 0 ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            {isExpanded ? (
              <FolderOpen className="w-5 h-5 text-blue-600" />
            ) : (
              <Folder className="w-5 h-5 text-blue-600" />
            )}
            <span className="font-semibold text-lg">{product.name}</span>
            <Badge variant="outline">v{product.version}</Badge>
          </div>
          <div className="flex items-center space-x-4">
            {/* Owner - N/A for products */}
            <div className="w-32">
              <span className="text-xs text-gray-400">N/A</span>
            </div>
            {/* Count */}
            <span className="text-sm text-gray-500 w-12 text-right">{itemCount}</span>
            {/* Sprint Assignment - N/A for products */}
            <div className="w-32">
              <span className="text-xs text-gray-400">N/A</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
              <Button size="sm" variant="ghost" onClick={() => setEditingProduct({ ...product })}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => startAdding(product.id, "feature")}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteProduct(product.id)
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {renderAddItemRow(product.id, "feature", level + 1)}

        {isExpanded &&
          product.features
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((feature) => renderFeature(feature, level + 1))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Product Hierarchy</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={state.currentView === "backlog" ? "default" : "outline"}
                  onClick={() => dispatch({ type: "SET_VIEW", payload: "backlog" })}
                  size="sm"
                >
                  Cards
                </Button>
                <Button variant={state.currentView === "hierarchy" ? "default" : "outline"} size="sm">
                  Hierarchy
                </Button>
                <Button
                  variant={state.currentView === "kanban" ? "default" : "outline"}
                  onClick={() => dispatch({ type: "SET_VIEW", payload: "kanban" })}
                  size="sm"
                >
                  <Kanban className="w-4 h-4 mr-2" />
                  Sprint Planning
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Add filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center py-3 px-4 bg-gray-50 border-b font-medium text-sm text-gray-600">
              <div className="flex-1">Products, Features, Epics, User Stories, Tasks</div>
              <div className="flex items-center space-x-4">
                <span className="w-32 text-center">Owner</span>
                <span className="w-12 text-center">Count</span>
                <span className="w-32 text-center">Sprint</span>
                <div className="w-10" />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {state.products.sort((a, b) => a.name.localeCompare(b.name)).map((product) => renderProduct(product))}

              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => startAdding("root", "product")}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create product</span>
                </Button>
                {renderAddItemRow("root", "product", 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information.</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hierarchy-product-name">Product Name</Label>
                <Input
                  id="hierarchy-product-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="hierarchy-product-description">Description</Label>
                <Input
                  id="hierarchy-product-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Enter product description"
                />
              </div>
              <div>
                <Label htmlFor="hierarchy-product-version">Version</Label>
                <Input
                  id="hierarchy-product-version"
                  value={editingProduct.version}
                  onChange={(e) => setEditingProduct({ ...editingProduct, version: e.target.value })}
                  placeholder="Enter version (e.g., 1.0.0)"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingProduct && handleUpdateProduct(editingProduct)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
