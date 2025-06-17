"use client"

import { useBacklog } from "@/lib/context/BacklogContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Package, Star, Zap, BookOpen, CheckSquare, Kanban } from "lucide-react"
import { useEffect } from "react"
import { createSampleData } from "@/lib/utils/data"
import KanbanBoard from "./KanbanBoard"
import HierarchyView from "./HierarchyView"

export default function Dashboard() {
  const { state, dispatch } = useBacklog()
  const viewMode = state.currentView === "kanban" ? "kanban" : state.currentView === "backlog" ? "hierarchy" : "cards"

  useEffect(() => {
    // Initialize with sample data if no products exist
    if (state.products.length === 0) {
      const sampleData = createSampleData()
      sampleData.products.forEach((product) => {
        dispatch({ type: "ADD_PRODUCT", payload: product })
      })
      sampleData.users.forEach((user) => {
        dispatch({ type: "ADD_USER", payload: user })
      })
      sampleData.sprints.forEach((sprint) => {
        dispatch({ type: "ADD_SPRINT", payload: sprint })
      })
    }
  }, [state.products.length, dispatch])

  // Render different views based on viewMode
  if (viewMode === "kanban") {
    return <KanbanBoard />
  }

  if (viewMode === "hierarchy") {
    return <HierarchyView />
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

  const getHierarchyPath = (task: any) => {
    let userStory, epic, feature

    // Find the hierarchy for this task
    state.products.forEach((product) => {
      product.features.forEach((feat) => {
        feat.epics.forEach((ep) => {
          ep.userStories.forEach((us) => {
            if (us.tasks.some((t) => t.id === task.id)) {
              feature = feat
              epic = ep
              userStory = us
            }
          })
        })
      })
    })

    return { feature, epic, userStory }
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
              variant={viewMode === "cards" ? "default" : "outline"}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "cards" })}
              size="sm"
            >
              Cards
            </Button>
            <Button
              variant={viewMode === "hierarchy" ? "default" : "outline"}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "backlog" })}
              size="sm"
            >
              Hierarchy
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              onClick={() => dispatch({ type: "SET_VIEW", payload: "kanban" })}
              size="sm"
            >
              <Kanban className="w-4 h-4 mr-2" />
              Sprint Planning
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
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => dispatch({ type: "SELECT_PRODUCT", payload: product.id })}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        {product.name}
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
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
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{feature.epics.length} epics</span>
                            {assignedUser && (
                              <div className="flex items-center space-x-1">
                                <Avatar className="w-6 h-6">
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
                            {assignedUser && (
                              <div className="flex items-center space-x-1">
                                <Avatar className="w-6 h-6">
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
                              {assignedUser && (
                                <div className="flex items-center space-x-1">
                                  <Avatar className="w-6 h-6">
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
                    const hierarchy = getHierarchyPath(task)
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
                            {/* Hierarchy Path */}
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              <div className="flex items-center space-x-1 mb-1">
                                <Star className="w-3 h-3" />
                                <span>{hierarchy.feature?.name}</span>
                              </div>
                              <div className="flex items-center space-x-1 mb-1">
                                <Zap className="w-3 h-3" />
                                <span>{hierarchy.epic?.title}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{hierarchy.userStory?.title}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex space-x-2">
                                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                {task.sprintStatus && <Badge variant="outline">{task.sprintStatus}</Badge>}
                              </div>
                              {task.estimatedHours && <Badge variant="outline">{task.estimatedHours}h</Badge>}
                            </div>

                            {assignedUser && (
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
                            )}
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
