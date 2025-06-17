"use client"

import type React from "react"

import { useBacklog } from "@/lib/context/BacklogContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, CheckSquare, Zap, Star } from "lucide-react"
import type { UserStory, Task, SprintStatus } from "@/lib/types"

export default function KanbanBoard() {
  const { state, dispatch } = useBacklog()

  const columns: { id: SprintStatus; title: string; color: string }[] = [
    { id: "backlog", title: "Backlog", color: "bg-gray-100" },
    { id: "sprint-backlog", title: "Sprint Backlog", color: "bg-blue-100" },
    { id: "in-progress", title: "In Progress", color: "bg-yellow-100" },
    { id: "review", title: "Review", color: "bg-purple-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
  ]

  // Get all user stories and tasks from all products
  const allUserStories: UserStory[] = []
  const allTasks: Task[] = []

  state.products.forEach((product) => {
    product.features.forEach((feature) => {
      feature.epics.forEach((epic) => {
        epic.userStories.forEach((userStory) => {
          allUserStories.push(userStory)
          userStory.tasks.forEach((task) => {
            allTasks.push(task)
          })
        })
      })
    })
  })

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-800"
    if (priority >= 6) return "bg-orange-100 text-orange-800"
    if (priority >= 4) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getUserById = (userId?: string) => {
    return state.users.find((user) => user.id === userId)
  }

  const getHierarchyPath = (item: UserStory | Task) => {
    let userStory: UserStory
    let epic, feature, product

    if ("epicId" in item) {
      // It's a UserStory
      userStory = item
    } else {
      // It's a Task, find its UserStory
      userStory = allUserStories.find((us) => us.id === item.userStoryId)!
    }

    // Find the hierarchy
    state.products.forEach((p) => {
      p.features.forEach((f) => {
        f.epics.forEach((e) => {
          if (e.userStories.some((us) => us.id === userStory.id)) {
            product = p
            feature = f
            epic = e
          }
        })
      })
    })

    return { product, feature, epic, userStory }
  }

  const handleDragStart = (e: React.DragEvent, item: UserStory | Task, type: "user-story" | "task") => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ item, type }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, sprintStatus: SprintStatus) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData("text/plain"))
    const { item, type } = data

    dispatch({
      type: "MOVE_TO_SPRINT",
      payload: {
        itemId: item.id,
        itemType: type,
        sprintStatus,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
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
              <p className="text-gray-600 mt-2">Drag and drop user stories and tasks to plan your sprint</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 h-[calc(100vh-200px)]">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 flex flex-col`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <h3 className="font-semibold text-lg mb-4 text-center">{column.title}</h3>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {/* User Stories */}
                {allUserStories
                  .filter((story) => story.sprintStatus === column.id)
                  .map((story) => {
                    const hierarchy = getHierarchyPath(story)
                    const assignedUser = getUserById(story.assignedUserId)
                    return (
                      <Card
                        key={story.id}
                        className="cursor-move hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, story, "user-story")}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {story.title}
                            </CardTitle>
                            <Badge className={getPriorityColor(story.priority)} variant="secondary">
                              P{story.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>{hierarchy.feature?.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Zap className="w-3 h-3" />
                                <span>{hierarchy.epic?.title}</span>
                              </div>
                            </div>
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
                              {story.storyPoints && (
                                <Badge variant="outline" className="text-xs">
                                  {story.storyPoints} pts
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                {/* Tasks */}
                {allTasks
                  .filter((task) => task.sprintStatus === column.id)
                  .map((task) => {
                    const hierarchy = getHierarchyPath(task)
                    const assignedUser = getUserById(task.assignedUserId)
                    return (
                      <Card
                        key={task.id}
                        className="cursor-move hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task, "task")}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm flex items-center">
                              <CheckSquare className="w-4 h-4 mr-1" />
                              {task.title}
                            </CardTitle>
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              P{task.priority}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3" />
                                <span>{hierarchy.feature?.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Zap className="w-3 h-3" />
                                <span>{hierarchy.epic?.title}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen className="w-3 h-3" />
                                <span>{hierarchy.userStory?.title}</span>
                              </div>
                            </div>
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
                              {task.estimatedHours && (
                                <Badge variant="outline" className="text-xs">
                                  {task.estimatedHours}h
                                </Badge>
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
