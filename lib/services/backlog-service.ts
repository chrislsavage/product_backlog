import { supabase } from "../supabase/client"
import type { Product, Feature, Epic, UserStory, Task, User, Sprint } from "../types"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase environment variables not found")
}

export class BacklogService {
  // Products
  static async getProducts(): Promise<Product[]> {
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        features (
          *,
          epics (
            *,
            user_stories (
              *,
              tasks (*)
            )
          )
        )
      `)
      .order("name")

    if (error) throw error

    return products.map((product) => ({
      ...product,
      createdAt: new Date(product.created_at),
      updatedAt: new Date(product.updated_at),
      features: product.features.map((feature) => ({
        ...feature,
        name: feature.name,
        productId: feature.product_id,
        assignedUserId: feature.assigned_user_id,
        createdAt: new Date(feature.created_at),
        updatedAt: new Date(feature.updated_at),
        epics: feature.epics.map((epic) => ({
          ...epic,
          featureId: epic.feature_id,
          assignedUserId: epic.assigned_user_id,
          createdAt: new Date(epic.created_at),
          updatedAt: new Date(epic.updated_at),
          userStories: epic.user_stories.map((story) => ({
            ...story,
            acceptanceCriteria: Array.isArray(story.acceptance_criteria) ? (story.acceptance_criteria as string[]) : [],
            storyPoints: story.story_points,
            sprintStatus: story.sprint_status as any,
            epicId: story.epic_id,
            assignedUserId: story.assigned_user_id,
            createdAt: new Date(story.created_at),
            updatedAt: new Date(story.updated_at),
            tasks: story.tasks.map((task) => ({
              ...task,
              estimatedHours: task.estimated_hours,
              sprintStatus: task.sprint_status as any,
              userStoryId: task.user_story_id,
              assignedUserId: task.assigned_user_id,
              createdAt: new Date(task.created_at),
              updatedAt: new Date(task.updated_at),
            })),
          })),
        })),
      })),
    }))
  }

  static async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt" | "features">): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        description: product.description,
        version: product.version,
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      features: [],
    }
  }

  // Features
  static async createFeature(feature: Omit<Feature, "id" | "createdAt" | "updatedAt" | "epics">): Promise<Feature> {
    const { data, error } = await supabase
      .from("features")
      .insert({
        name: feature.name,
        description: feature.description,
        priority: feature.priority,
        product_id: feature.productId,
        assigned_user_id: feature.assignedUserId,
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      productId: data.product_id,
      assignedUserId: data.assigned_user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      epics: [],
    }
  }

  // Epics
  static async createEpic(epic: Omit<Epic, "id" | "createdAt" | "updatedAt" | "userStories">): Promise<Epic> {
    const { data, error } = await supabase
      .from("epics")
      .insert({
        title: epic.title,
        description: epic.description,
        status: epic.status,
        priority: epic.priority,
        feature_id: epic.featureId,
        assigned_user_id: epic.assignedUserId,
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      featureId: data.feature_id,
      assignedUserId: data.assigned_user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      userStories: [],
    }
  }

  // User Stories
  static async createUserStory(
    userStory: Omit<UserStory, "id" | "createdAt" | "updatedAt" | "tasks">,
  ): Promise<UserStory> {
    const { data, error } = await supabase
      .from("user_stories")
      .insert({
        title: userStory.title,
        description: userStory.description,
        acceptance_criteria: userStory.acceptanceCriteria,
        story_points: userStory.storyPoints,
        priority: userStory.priority,
        status: userStory.status,
        sprint_status: userStory.sprintStatus,
        epic_id: userStory.epicId,
        assigned_user_id: userStory.assignedUserId,
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      acceptanceCriteria: Array.isArray(data.acceptance_criteria) ? (data.acceptance_criteria as string[]) : [],
      storyPoints: data.story_points,
      sprintStatus: data.sprint_status as any,
      epicId: data.epic_id,
      assignedUserId: data.assigned_user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      tasks: [],
    }
  }

  // Tasks
  static async createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        estimated_hours: task.estimatedHours,
        sprint_status: task.sprintStatus,
        user_story_id: task.userStoryId,
        assigned_user_id: task.assignedUserId,
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      estimatedHours: data.estimated_hours,
      sprintStatus: data.sprint_status as any,
      userStoryId: data.user_story_id,
      assignedUserId: data.assigned_user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }

  // Users
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").order("name")

    if (error) throw error

    return data
  }

  // Sprints
  static async getSprints(): Promise<Sprint[]> {
    const { data, error } = await supabase.from("sprints").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return data.map((sprint) => ({
      ...sprint,
      startDate: new Date(sprint.start_date),
      endDate: new Date(sprint.end_date),
      userStories: [], // These would be populated separately if needed
      tasks: [],
    }))
  }

  // Update sprint status for items
  static async updateSprintStatus(
    itemId: string,
    itemType: "user-story" | "task",
    sprintStatus: string,
  ): Promise<void> {
    if (itemType === "user-story") {
      const { error } = await supabase.from("user_stories").update({ sprint_status: sprintStatus }).eq("id", itemId)

      if (error) throw error
    } else {
      const { error } = await supabase.from("tasks").update({ sprint_status: sprintStatus }).eq("id", itemId)

      if (error) throw error
    }
  }
}
