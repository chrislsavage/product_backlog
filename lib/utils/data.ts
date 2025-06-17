import type { Product, Feature, Epic, UserStory, Task, User, Sprint } from "../types"

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function createSampleUsers(): User[] {
  return [
    {
      id: generateId(),
      name: "John Doe",
      email: "john@example.com",
      role: "product-owner",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: generateId(),
      name: "Jane Smith",
      email: "jane@example.com",
      role: "scrum-master",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: generateId(),
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "developer",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: generateId(),
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "designer",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: generateId(),
      name: "Tom Brown",
      email: "tom@example.com",
      role: "qa",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]
}

export function createSampleData(): { products: Product[]; users: User[]; sprints: Sprint[] } {
  const now = new Date()
  const users = createSampleUsers()

  const productId = generateId()
  const featureId = generateId()
  const epicId = generateId()
  const userStoryId = generateId()
  const task1Id = generateId()
  const task2Id = generateId()

  const task1: Task = {
    id: task1Id,
    title: "Implement user authentication",
    description: "Set up login and registration functionality",
    status: "todo",
    priority: 8,
    estimatedHours: 8,
    userStoryId: userStoryId,
    assignedUserId: users[2].id,
    sprintStatus: "backlog",
    createdAt: now,
    updatedAt: now,
  }

  const task2: Task = {
    id: task2Id,
    title: "Create login form UI",
    description: "Design and implement the login form interface",
    status: "todo",
    priority: 6,
    estimatedHours: 4,
    userStoryId: userStoryId,
    assignedUserId: users[3].id,
    sprintStatus: "backlog",
    createdAt: now,
    updatedAt: now,
  }

  const userStory: UserStory = {
    id: userStoryId,
    title: "User Login",
    description: "As a user, I want to log in to access my account",
    acceptanceCriteria: [
      "User can enter email and password",
      "System validates credentials",
      "User is redirected to dashboard on success",
    ],
    storyPoints: 5,
    priority: 9,
    status: "backlog",
    epicId: epicId,
    assignedUserId: users[2].id,
    sprintStatus: "backlog",
    tasks: [task1, task2],
    createdAt: now,
    updatedAt: now,
  }

  const epic: Epic = {
    id: epicId,
    title: "User Management",
    description: "Complete user authentication and profile management system",
    status: "planning",
    priority: 8,
    featureId: featureId,
    assignedUserId: users[0].id,
    userStories: [userStory],
    createdAt: now,
    updatedAt: now,
  }

  const feature: Feature = {
    id: featureId,
    name: "Authentication System",
    description: "Handles user authentication and authorization",
    priority: 9,
    productId: productId,
    assignedUserId: users[1].id,
    epics: [epic],
    createdAt: now,
    updatedAt: now,
  }

  const product: Product = {
    id: productId,
    name: "E-Commerce Platform",
    description: "A comprehensive e-commerce solution",
    version: "1.0.0",
    features: [feature],
    createdAt: now,
    updatedAt: now,
  }

  const sprint: Sprint = {
    id: generateId(),
    name: "Sprint 1",
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: "planning",
    userStories: [],
    tasks: [],
  }

  return {
    products: [product],
    users,
    sprints: [sprint],
  }
}
