"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Star, Zap, BookOpen, CheckSquare, Kanban } from "lucide-react"

// Simple sample data
const sampleProducts = [
  {
    id: "1",
    name: "E-Commerce Platform",
    description: "A comprehensive e-commerce solution",
    version: "1.0.0",
    features: [
      {
        id: "f1",
        name: "Authentication System",
        description: "User login and registration",
        priority: 9,
        epics: [
          {
            id: "e1",
            title: "User Management",
            description: "Complete user authentication system",
            priority: 8,
            userStories: [
              {
                id: "us1",
                title: "User Login",
                description: "As a user, I want to log in to access my account",
                priority: 9,
                tasks: [
                  {
                    id: "t1",
                    title: "Implement user authentication",
                    description: "Set up login functionality",
                    priority: 8,
                    status: "todo" as const,
                  },
                  {
                    id: "t2",
                    title: "Create login form UI",
                    description: "Design login interface",
                    priority: 6,
                    status: "in-progress" as const,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<"backlog" | "kanban" | "hierarchy">("backlog")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null)

  const selectedProduct = sampleProducts.find((p) => p.id === selectedProductId)
  const selectedFeature = selectedProduct?.features.find((f) => f.id === selectedFeatureId)
  const selectedEpic = selectedFeature?.epics.find((e) => e.id === selectedEpicId)

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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Kanban View
  if (currentView === "kanban") {
    const allTasks = sampleProducts.flatMap((product) =>
      product.features.flatMap((feature) =>
        feature.epics.flatMap((epic) => epic.userStories.flatMap((story) => story.tasks)),
      ),
    )

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sprint Planning Board</h1>
            <Button variant="outline" onClick={() => setCurrentView("backlog")}>
              Back to Backlog
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {["todo", "in-progress", "done"].map((status) => (
              <div key={status} className="bg-white rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4 capitalize">{status.replace("-", " ")}</h3>
                <div className="space-y-3">
                  {allTasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <Card key={task.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center">
                              <CheckSquare className="w-4 h-4 mr-2" />
                              {task.title}
                            </div>
                            <Badge className={getPriorityColor(task.priority)}>P{task.priority}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-gray-600">{task.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Hierarchy View
  if (currentView === "hierarchy") {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Product Hierarchy</h1>
            <Button variant="outline" onClick={() => setCurrentView("backlog")}>
              Back to Backlog
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              {sampleProducts.map((product) => (
                <div key={product.id} className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-lg">{product.name}</span>
                    <Badge variant="outline">v{product.version}</Badge>
                  </div>

                  {product.features.map((feature) => (
                    <div key={feature.id} className="ml-6 space-y-3">
                      <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded">
                        <Star className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{feature.name}</span>
                        <Badge className={getPriorityColor(feature.priority)}>P{feature.priority}</Badge>
                      </div>

                      {feature.epics.map((epic) => (
                        <div key={epic.id} className="ml-6 space-y-2">
                          <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded">
                            <Zap className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">{epic.title}</span>
                            <Badge className={getPriorityColor(epic.priority)}>P{epic.priority}</Badge>
                          </div>

                          {epic.userStories.map((userStory) => (
                            <div key={userStory.id} className="ml-6 space-y-2">
                              <div className="flex items-center space-x-3 p-2 bg-green-50 rounded">
                                <BookOpen className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{userStory.title}</span>
                                <Badge className={getPriorityColor(userStory.priority)}>P{userStory.priority}</Badge>
                              </div>

                              {userStory.tasks.map((task) => (
                                <div key={task.id} className="ml-6">
                                  <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                    <CheckSquare className="w-4 h-4 text-gray-600" />
                                    <span>{task.title}</span>
                                    <Badge className={getPriorityColor(task.priority)}>P{task.priority}</Badge>
                                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Backlog View
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
              variant={currentView === "backlog" ? "default" : "outline"}
              onClick={() => setCurrentView("backlog")}
              size="sm"
            >
              Cards
            </Button>
            <Button
              variant={currentView === "hierarchy" ? "default" : "outline"}
              onClick={() => setCurrentView("hierarchy")}
              size="sm"
            >
              Hierarchy
            </Button>
            <Button
              variant={currentView === "kanban" ? "default" : "outline"}
              onClick={() => setCurrentView("kanban")}
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
            onClick={() => setSelectedProductId(null)}
            className={!selectedProductId ? "bg-blue-100" : ""}
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
                onClick={() => setSelectedFeatureId(null)}
                className={!selectedFeatureId ? "bg-blue-100" : ""}
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
                onClick={() => setSelectedEpicId(null)}
                className={!selectedEpicId ? "bg-blue-100" : ""}
              >
                <Zap className="w-4 h-4 mr-1" />
                {selectedFeature.name}
              </Button>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Products View */}
          {!selectedProductId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Products</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedProductId(product.id)}
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
          {selectedProduct && !selectedFeatureId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Features in {selectedProduct.name}</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProduct.features.map((feature) => (
                  <Card
                    key={feature.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedFeatureId(feature.id)}
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
                      <span className="text-sm text-gray-500">{feature.epics.length} epics</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Epics View */}
          {selectedFeature && !selectedEpicId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Epics in {selectedFeature.name}</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Epic
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFeature.epics.map((epic) => (
                  <Card
                    key={epic.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedEpicId(epic.id)}
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
                      <span className="text-sm text-gray-500">{epic.userStories.length} stories</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* User Stories View */}
          {selectedEpic && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">User Stories in {selectedEpic.title}</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User Story
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEpic.userStories.map((story) => (
                  <Card key={story.id}>
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
                      <div className="space-y-4">
                        <span className="text-sm text-gray-500">{story.tasks.length} tasks</span>

                        {/* Tasks */}
                        <div className="space-y-2">
                          <h4 className="font-semibold">Tasks:</h4>
                          {story.tasks.map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <CheckSquare className="w-4 h-4 mr-2" />
                                <span className="text-sm">{task.title}</span>
                              </div>
                              <div className="flex space-x-2">
                                <Badge className={getPriorityColor(task.priority)}>P{task.priority}</Badge>
                                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
