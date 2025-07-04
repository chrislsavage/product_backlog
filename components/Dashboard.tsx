"use client"

import { useBacklog } from "@/lib/context/BacklogContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Package, Star, Zap, BookOpen, CheckSquare, Kanban, Users, Edit } from "lucide-react"
import KanbanBoard from "./KanbanBoard"
import HierarchyView from "./HierarchyView"
import UserSelector from "./UserSelector"
import UserManagement from "./UserManagement"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import type { Product } from "@/lib/types"

export default function Dashboard() {
  const { state, dispatch, updateFeature, updateEpic, updateUserStory, updateTask, updateProduct } = useBacklog()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product backlog...</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading data</p>
            <p>{state.error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (state.currentView === "kanban") {
    return <KanbanBoard />
  }

  if (state.currentView === "hierarchy") {
    return <HierarchyView />
  }

  if (state.currentView === "users") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-2">Manage your team members and their assignments</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => dispatch({ type: "SET_VIEW", payload: "backlog" })} size="sm">
                Back to Backlog
              </Button>
            </div>
          </div>
          <UserManagement />
        </div>
      </div>
    )
  }

  const selectedProduct = state.products.find((p) => p.id === state.selectedProductId)
  const selectedFeature = selectedProduct?.features.find((c) => c.id === state.selectedFeatureId)
  const selectedEpic = selectedFeature?.epics.find((e) => e.id === state.selectedEpicId)
  const selectedUserStory = selectedEpic?.userStories.find((us) => us.id === state.selectedUserStoryId)

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800"
    if (priority >= 6) return "bg-orange-100 text-orange-800"
    if (priority >= 4) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUserById = (userId?: string) => {
    return state.users.find((user) => user.id === userId)
  }

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      await updateProduct(updatedProduct)
      setEditingProduct(null)
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Backlog</h1>
            <p className="text-gray-600 mt-2">Manage your products, features, epics, user stories, and tasks</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={state.currentView === "backlog" ? "default" : "outline"}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "backlog" })}
              size="sm"
            >
              Cards
            </Button>
            <Button
              variant={state.currentView === "hierarchy" ? "default" : "outline"}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "hierarchy" })}
              size="sm"
            >
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
            <Button
              variant={state.currentView === "users" ? "default" : "outline"}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "users" })}
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Team
            </Button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 mb-6 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: "SELECT_PRODUCT", payload: null })}
            className={!state.selectedProductId ? "bg-blue-100" : ""}
          >
            <Package className="w-4 h-4 mr-1" />
            Products
          </Button>
          {selectedProduct && (
            <>
              <span>/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "SELECT_FEATURE", payload: null })}
                className={!state.selectedFeatureId ? "bg-blue-100" : ""}
              >
                <Star className="w-4 h-4 mr-1" />
                {selectedProduct.name}
              </Button>
            </>
          )}
          {selectedFeature && (
            <>
              <span>/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "SELECT_EPIC", payload: null })}
                className={!state.selectedEpicId ? "bg-blue-100" : ""}
              >
                <Zap className="w-4 h-4 mr-1" />
                {selectedFeature.name}
              </Button>
            </>
          )}
          {selectedEpic && (
            <>
              <span>/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "SELECT_USER_STORY", payload: null })}
                className={!state.selectedUserStoryId ? "bg-blue-100" : ""}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                {selectedEpic.title}
              </Button>
            </>
          )}
          {selectedUserStory && (
            <>
              <span>/</span>
              <Button variant="ghost" size="sm" className="bg-blue-100">
                <CheckSquare className="w-4 h-4 mr-1" />
                {selectedUserStory.title}
              </Button>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Products View */}
          {!state.selectedProductId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Products</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.products.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => dispatch({ type: "SELECT_PRODUCT", payload: product.id })}
                        >
                          <CardTitle className="flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            {product.name}
                          </CardTitle>
                          <CardDescription>{product.description}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProduct({ ...product })
                          }}
                          className="ml-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">v{product.version}</Badge>
                        <span className="text-sm text-gray-500">{product.features.length} features</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-description">Description</Label>
                        <Input
                          id="product-description"
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          placeholder="Enter product description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="product-version">Version</Label>
                        <Input
                          id="product-version"
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
          )}

          {/* Features View */}
          {selectedProduct && !state.selectedFeatureId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Features in {selectedProduct.name}</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProduct.features
                  .sort((a, b) => b.priority - a.priority)
                  .map((feature) => {
                    const assignedUser = getUserById(feature.assignedUserId)
                    return (
                      <Card
                        key={feature.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => dispatch({ type: "SELECT_FEATURE", payload: feature.id })}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="w-5 h-5 mr-2" />
                              {feature.name}
                            </div>
                            <Badge className={getPriorityColor(feature.priority)}>P{feature.priority}</Badge>
                          </CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">{feature.epics.length} epics</span>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned to:</label>
                              <UserSelector
                                selectedUserId={feature.assignedUserId}
                                onUserChange={(userId) => {
                                  const updatedFeature = { ...feature, assignedUserId: userId }
                                  updateFeature(updatedFeature)
                                }}
                                size="sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Epics View */}
          {selectedFeature && !state.selectedEpicId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Epics in {selectedFeature.name}</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Epic
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFeature.epics
                  .sort((a, b) => b.priority - a.priority)
                  .map((epic) => {
                    const assignedUser = getUserById(epic.assignedUserId)
                    return (
                      <Card
                        key={epic.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => dispatch({ type: "SELECT_EPIC", payload: epic.id })}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Zap className="w-5 h-5 mr-2" />
                              {epic.title}
                            </div>
                            <Badge className={getPriorityColor(epic.priority)}>P{epic.priority}</Badge>
                          </CardTitle>
                          <CardDescription>{epic.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Badge className={getStatusColor(epic.status)}>{epic.status}</Badge>
                              <span className="text-sm text-gray-500">{epic.userStories.length} stories</span>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned to:</label>
                              <UserSelector
                                selectedUserId={epic.assignedUserId}
                                onUserChange={(userId) => {
                                  const updatedEpic = { ...epic, assignedUserId: userId }
                                  updateEpic(updatedEpic)
                                }}
                                size="sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}

          {/* User Stories View */}
          {selectedEpic && !state.selectedUserStoryId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">User Stories in {selectedEpic.title}</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User Story
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEpic.userStories
                  .sort((a, b) => b.priority - a.priority)
                  .map((story) => {
                    const assignedUser = getUserById(story.assignedUserId)
                    return (
                      <Card
                        key={story.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => dispatch({ type: "SELECT_USER_STORY", payload: story.id })}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                              <BookOpen className="w-5 h-5 mr-2" />
                              {story.title}
                            </div>
                            <Badge className={getPriorityColor(story.priority)}>P{story.priority}</Badge>
                          </CardTitle>
                          <CardDescription>{story.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-2">
                                <Badge className={getStatusColor(story.status)}>{story.status}</Badge>
                                {story.sprintStatus && <Badge variant="outline">{story.sprintStatus}</Badge>}
                              </div>
                              {story.storyPoints && <Badge variant="outline">{story.storyPoints} pts</Badge>}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-gray-500">
                                {story.tasks.length} tasks • {story.acceptanceCriteria.length} criteria
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned to:</label>
                                <UserSelector
                                  selectedUserId={story.assignedUserId}
                                  onUserChange={(userId) => {
                                    const updatedUserStory = { ...story, assignedUserId: userId }
                                    updateUserStory(updatedUserStory)
                                  }}
                                  size="sm"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Story Points:</label>
                              <Input
                                type="number"
                                min="1"
                                max="21"
                                value={story.storyPoints || ""}
                                onChange={(e) => {
                                  const points = e.target.value ? Number.parseInt(e.target.value) : undefined
                                  const updatedUserStory = { ...story, storyPoints: points }
                                  updateUserStory(updatedUserStory)
                                }}
                                placeholder="Points"
                                className="w-20"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Tasks View */}
          {selectedUserStory && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Tasks in {selectedUserStory.title}</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* User Story Details */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>User Story Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-gray-600">{selectedUserStory.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Acceptance Criteria</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedUserStory.acceptanceCriteria.map((criteria, index) => (
                          <li key={index} className="text-gray-600">
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedUserStory.tasks
                  .sort((a, b) => b.priority - a.priority)
                  .map((task) => {
                    const assignedUser = getUserById(task.assignedUserId)
                    return (
                      <Card key={task.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CheckSquare className="w-5 h-5 mr-2" />
                              {task.title}
                            </div>
                            <Badge className={getPriorityColor(task.priority)}>P{task.priority}</Badge>
                          </CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-2">
                                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                {task.sprintStatus && <Badge variant="outline">{task.sprintStatus}</Badge>}
                              </div>
                              {task.estimatedHours && <Badge variant="outline">{task.estimatedHours}h</Badge>}
                            </div>

                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={assignedUser.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {assignedUser.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{assignedUser.name}</div>
                                <div className="text-xs text-gray-500 capitalize">{assignedUser.role}</div>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-2 block">Assigned to:</label>
                              <UserSelector
                                selectedUserId={task.assignedUserId}
                                onUserChange={(userId) => {
                                  const updatedTask = { ...task, assignedUserId: userId }
                                  updateTask(updatedTask)
                                }}
                                size="sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
