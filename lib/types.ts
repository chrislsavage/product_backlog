export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "product-owner" | "scrum-master" | "developer" | "designer" | "qa"
}

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: number // 1-10 scale
  estimatedHours?: number
  userStoryId: string
  assignedUserId?: string
  sprintStatus?: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
  sprintId?: string // New field for sprint assignment
  completedAt?: Date // New field for completion tracking
  createdAt: Date
  updatedAt: Date
}

export interface UserStory {
  id: string
  title: string
  description: string
  acceptanceCriteria: string[]
  storyPoints?: number
  priority: number // 1-10 scale
  status: "backlog" | "ready" | "in-progress" | "done"
  epicId: string
  assignedUserId?: string
  sprintStatus?: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
  sprintId?: string // New field for sprint assignment
  completedAt?: Date // New field for completion tracking
  tasks: Task[]
  createdAt: Date
  updatedAt: Date
}

export interface Epic {
  id: string
  title: string
  description: string
  status: "planning" | "in-progress" | "done"
  priority: number // 1-10 scale
  featureId: string
  assignedUserId?: string
  userStories: UserStory[]
  createdAt: Date
  updatedAt: Date
}

export interface Feature {
  id: string
  name: string
  description: string
  priority: number // 1-10 scale
  productId: string
  assignedUserId?: string
  epics: Epic[]
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  version: string
  features: Feature[]
  createdAt: Date
  updatedAt: Date
}

export interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: "planning" | "active" | "completed"
  isCurrent?: boolean // New field to track current sprint
  userStories: string[] // User Story IDs
  tasks: string[] // Task IDs
}

export type SprintStatus = "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
