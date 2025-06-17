"use client"

import { useState, useEffect } from "react"
import { useBacklog } from "@/lib/context/BacklogContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import type { Product, Feature, Epic, UserStory, Task } from "@/lib/types"
import { supabase } from "@/lib/supabase/client"
import { BacklogService } from "@/lib/services/backlog-service"

type HierarchyViewProps = {}

export default function HierarchyView({}: HierarchyViewProps) {
  const { state, dispatch, createProduct, createFeature, createEpic, createUserStory, createTask } = useBacklog()

  // Debug logging
  console.log("HierarchyView state:", {
    productsCount: state.products.length,
    products: state.products.map((p) => ({
      id: p.id,
      name: p.name,
      featuresCount: p.features.length,
      features: p.features.map((f) => ({
        id: f.id,
        name: f.name,
        epicsCount: f.epics.length,
        epics: f.epics.map((e) => ({
          id: e.id,
          title: e.title,
          userStoriesCount: e.userStories.length,
        })),
      })),
    })),
  })

  // Initialize expanded items to show the sample data structure
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>()

    // Auto-expand items that have children to show the sample data
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
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set())
  const [editItemTitles, setEditItemTitles] = useState<Record<string, string>>({})

  // Auto-expand items when products are loaded
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

      cancelAdding(parentId, type)
    } catch (error) {
      console.error("Failed to create item:", error)
      // You could show an error message to the user here
    }
  }

  const startEditing = (id: string, currentTitle: string, type: string) => {
    setEditingItems(new Set([...editingItems, id]))
    setEditItemTitles({ ...editItemTitles, [id]: currentTitle })
  }

  const cancelEditing = (id: string) => {
    const newEditingItems = new Set(editingItems)
    newEditingItems.delete(id)
    setEditingItems(newEditingItems)

    const newTitles = { ...editItemTitles }
    delete newTitles[id]
    setEditItemTitles(newTitles)
  }

  const handleEditItem = async (id: string, type: string) => {
    const newTitle = editItemTitles[id]?.trim()
    if (!newTitle) return

    try {
      // Update in database based on type
      if (type === "product") {
        const { error } = await supabase.from("products").update({ name: newTitle }).eq("id", id)
        if (error) throw error
      } else if (type === "feature") {
        const { error } = await supabase.from("features").update({ name: newTitle }).eq("id", id)
        if (error) throw error
      } else if (type === "epic") {
        const { error } = await supabase.from("epics").update({ title: newTitle }).eq("id", id)
        if (error) throw error
      } else if (type === "user-story") {
        const { error } = await supabase.from("user_stories").update({ title: newTitle }).eq("id", id)
        if (error) throw error
      } else if (type === "task") {
        const { error } = await supabase.from("tasks").update({ title: newTitle }).eq("id", id)
        if (error) throw error
      }

      // Refresh data
      const products = await BacklogService.getProducts()
      dispatch({ type: "SET_PRODUCTS", payload: products })

      cancelEditing(id)
    } catch (error) {
      console.error("Failed to update item:", error)
    }
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

  const getItemCount = (item: Product | Feature | Epic | UserStory) => {
    if ("features" in item) {
      // Product
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
      // Feature
      return item.epics.reduce(
        (total, epic) =>
          total +
          epic.userStories.reduce((storyTotal, story) => storyTotal + story.tasks.length, epic.userStories.length),
        item.epics.length,
      )
    } else if ("userStories" in item) {
      // Epic
      return item.userStories.reduce((total, story) => total + story.tasks.length, item.userStories.length)
    } else if ("tasks" in item) {
      // User Story
      return item.tasks.length
    }
    return 0
  }

  const renderAddItemRow = (parentId: string, type: string, level: number) => {
    const key = `${parentId}-${type}`
    const isAdding = addingItems.has(key)

    if (!isAdding) return null

    return (
      <div className={`flex items-center py-2 pl-${level * 6 + 8} pr-4 border-l-2 border-blue-200`}>
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
    const isEditing = editingItems.has(task.id)

    return (
      <div key={task.id} className="flex items-center py-3 pl-8 pr-4 hover:bg-gray-50 border-l-2 border-gray-100">
        <div className={`pl-${level * 6} flex items-center space-x-3 flex-1`}>
          <CheckSquare className="w-4 h-4 text-blue-600" />
          {isEditing ? (
            <div className="flex items-center space-x-2 flex-1">
              <Input
                value={editItemTitles[task.id] || ""}
                onChange={(e) => setEditItemTitles({ ...editItemTitles, [task.id]: e.target.value })}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEditItem(task.id, "task")
                  } else if (e.key === "Escape") {
                    cancelEditing(task.id)
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={() => handleEditItem(task.id, "task")}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => cancelEditing(task.id)}>
                Cancel
              </Button>
            </div>
          ) : (
            <span
              className="font-medium cursor-pointer hover:text-blue-600"
              onClick={() => startEditing(task.id, task.title, "task")}
            >
              {task.title}
            </span>
          )}
          <Badge className={getPriorityColor(task.priority)} variant="secondary">
            P{task.priority}
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          {assignedUser && (
            <Avatar className="w-6 h-6">
              <AvatarImage src={assignedUser.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {assignedUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="text-sm text-gray-500 w-8 text-right">{task.estimatedHours || 0}</span>
        </div>
      </div>
    )
  }

  const renderUserStory = (userStory: UserStory, level: number) => {
    const isExpanded = expandedItems.has(userStory.id)
    const assignedUser = getUserById(userStory.assignedUserId)
    const taskCount = userStory.tasks.length
    const isEditing = editingItems.has(userStory.id)

    return (
      <div key={userStory.id}>
        <div className="flex items-center py-3 pl-8 pr-4 hover:bg-gray-50 border-l-2 border-gray-100">
          <div className={`pl-${level * 6} flex items-center space-x-3 flex-1`}>
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
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editItemTitles[userStory.id] || ""}
                  onChange={(e) => setEditItemTitles({ ...editItemTitles, [userStory.id]: e.target.value })}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditItem(userStory.id, "user-story")
                    } else if (e.key === "Escape") {
                      cancelEditing(userStory.id)
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleEditItem(userStory.id, "user-story")}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => cancelEditing(userStory.id)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <span
                className="font-medium cursor-pointer hover:text-blue-600"
                onClick={() => startEditing(userStory.id, userStory.title, "user-story")}
              >
                {userStory.title}
              </span>
            )}
            <Badge className={getPriorityColor(userStory.priority)} variant="secondary">
              P{userStory.priority}
            </Badge>
            {userStory.storyPoints && <Badge variant="outline">{userStory.storyPoints} pts</Badge>}
          </div>
          <div className="flex items-center space-x-4">
            {assignedUser && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={assignedUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {assignedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-sm text-gray-500 w-8 text-right">{taskCount}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(userStory.id, "task")}
              className="opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-4 h-4" />
            </Button>
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
    const isEditing = editingItems.has(epic.id)

    return (
      <div key={epic.id} className="group">
        <div className="flex items-center py-3 pl-6 pr-4 hover:bg-gray-50 border-l-2 border-gray-200">
          <div className={`pl-${level * 6} flex items-center space-x-3 flex-1`}>
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
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editItemTitles[epic.id] || ""}
                  onChange={(e) => setEditItemTitles({ ...editItemTitles, [epic.id]: e.target.value })}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditItem(epic.id, "epic")
                    } else if (e.key === "Escape") {
                      cancelEditing(epic.id)
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleEditItem(epic.id, "epic")}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => cancelEditing(epic.id)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <span
                className="font-medium cursor-pointer hover:text-blue-600"
                onClick={() => startEditing(epic.id, epic.title, "epic")}
              >
                {epic.title}
              </span>
            )}
            <Badge className={getPriorityColor(epic.priority)} variant="secondary">
              P{epic.priority}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            {assignedUser && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={assignedUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {assignedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-sm text-gray-500 w-8 text-right">{itemCount}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(epic.id, "user-story")}
              className="opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-4 h-4" />
            </Button>
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
    const isEditing = editingItems.has(feature.id)

    return (
      <div key={feature.id} className="group">
        <div className="flex items-center py-3 pl-4 pr-4 hover:bg-gray-50 border-l-2 border-gray-300">
          <div className={`pl-${level * 6} flex items-center space-x-3 flex-1`}>
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
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editItemTitles[feature.id] || ""}
                  onChange={(e) => setEditItemTitles({ ...editItemTitles, [feature.id]: e.target.value })}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditItem(feature.id, "feature")
                    } else if (e.key === "Escape") {
                      cancelEditing(feature.id)
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleEditItem(feature.id, "feature")}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => cancelEditing(feature.id)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <span
                className="font-medium cursor-pointer hover:text-blue-600"
                onClick={() => startEditing(feature.id, feature.name, "feature")}
              >
                {feature.name}
              </span>
            )}
            <Badge className={getPriorityColor(feature.priority)} variant="secondary">
              P{feature.priority}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            {assignedUser && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={assignedUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {assignedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-sm text-gray-500 w-8 text-right">{itemCount}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(feature.id, "epic")}
              className="opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {renderAddItemRow(feature.id, "epic", level + 1)}

        {isExpanded && feature.epics.sort((a, b) => b.priority - a.priority).map((epic) => renderEpic(epic, level + 1))}
      </div>
    )
  }

  const renderProduct = (product: Product, level = 0) => {
    const isExpanded = expandedItems.has(product.id)
    const itemCount = getItemCount(product)
    const isEditing = editingItems.has(product.id)

    return (
      <div key={product.id} className="group">
        <div className="flex items-center py-4 pl-2 pr-4 hover:bg-gray-50 border-l-4 border-blue-500">
          <div className="flex items-center space-x-3 flex-1">
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
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editItemTitles[product.id] || ""}
                  onChange={(e) => setEditItemTitles({ ...editItemTitles, [product.id]: e.target.value })}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditItem(product.id, "product")
                    } else if (e.key === "Escape") {
                      cancelEditing(product.id)
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={() => handleEditItem(product.id, "product")}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => cancelEditing(product.id)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <span
                className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                onClick={() => startEditing(product.id, product.name, "product")}
              >
                {product.name}
              </span>
            )}
            <Badge variant="outline">v{product.version}</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 w-8 text-right">{itemCount}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startAdding(product.id, "feature")}
              className="opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {renderAddItemRow(product.id, "feature", level + 1)}

        {isExpanded &&
          product.features.sort((a, b) => b.priority - a.priority).map((feature) => renderFeature(feature, level + 1))}
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
                <Button variant="outline" onClick={() => dispatch({ type: "SET_VIEW", payload: "backlog" })} size="sm">
                  Cards
                </Button>
                <Button variant="default" size="sm">
                  Hierarchy
                </Button>
                <Button variant="outline" onClick={() => dispatch({ type: "SET_VIEW", payload: "kanban" })} size="sm">
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
            {/* Header Row */}
            <div className="flex items-center py-3 px-4 bg-gray-50 border-b font-medium text-sm text-gray-600">
              <div className="flex-1">Products, Features, Epics, User Stories, Tasks</div>
              <div className="flex items-center space-x-4">
                <span className="w-20 text-center">Owner</span>
                <span className="w-8 text-center">Count</span>
                <div className="w-10" /> {/* Space for add button */}
              </div>
            </div>

            {/* Tree Content */}
            <div className="divide-y divide-gray-100">
              {state.products.sort((a, b) => a.name.localeCompare(b.name)).map((product) => renderProduct(product))}

              {/* Add Product Row */}
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
    </div>
  )
}
