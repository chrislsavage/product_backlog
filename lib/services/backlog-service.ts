import { supabase } from "../supabase/client"
import type { Product, User, Sprint } from "../types"

export class BacklogService {
  static async getProducts(): Promise<Product[]> {
    try {
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

      return (
        products?.map((product) => ({
          ...product,
          createdAt: new Date(product.created_at),
          updatedAt: new Date(product.updated_at),
          features:
            product.features?.map((feature) => ({
              ...feature,
              name: feature.name,
              productId: feature.product_id,
              assignedUserId: feature.assigned_user_id,
              createdAt: new Date(feature.created_at),
              updatedAt: new Date(feature.updated_at),
              epics:
                feature.epics?.map((epic) => ({
                  ...epic,
                  featureId: epic.feature_id,
                  assignedUserId: epic.assigned_user_id,
                  createdAt: new Date(epic.created_at),
                  updatedAt: new Date(epic.updated_at),
                  userStories:
                    epic.user_stories?.map((story) => ({
                      ...story,
                      acceptanceCriteria: Array.isArray(story.acceptance_criteria)
                        ? (story.acceptance_criteria as string[])
                        : [],
                      storyPoints: story.story_points,
                      sprintStatus: story.sprint_status as any,
                      epicId: story.epic_id,
                      assignedUserId: story.assigned_user_id,
                      createdAt: new Date(story.created_at),
                      updatedAt: new Date(story.updated_at),
                      tasks:
                        story.tasks?.map((task) => ({
                          ...task,
                          estimatedHours: task.estimated_hours,
                          sprintStatus: task.sprint_status as any,
                          userStoryId: task.user_story_id,
                          assignedUserId: task.assigned_user_id,
                          createdAt: new Date(task.created_at),
                          updatedAt: new Date(task.updated_at),
                        })) || [],
                    })) || [],
                })) || [],
            })) || [],
        })) || []
      )
    } catch (error) {
      console.error("Error fetching products:", error)
      return []
    }
  }

  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from("users").select("*").order("name")
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  static async getSprints(): Promise<Sprint[]> {
    try {
      const { data, error } = await supabase.from("sprints").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return (
        data?.map((sprint) => ({
          ...sprint,
          startDate: new Date(sprint.start_date),
          endDate: new Date(sprint.end_date),
          userStories: [],
          tasks: [],
        })) || []
      )
    } catch (error) {
      console.error("Error fetching sprints:", error)
      return []
    }
  }

  static async updateSprintStatus(
    itemId: string,
    itemType: "user-story" | "task",
    sprintStatus: string,
  ): Promise<void> {
    try {
      if (itemType === "user-story") {
        const { error } = await supabase.from("user_stories").update({ sprint_status: sprintStatus }).eq("id", itemId)
        if (error) throw error
      } else {
        const { error } = await supabase.from("tasks").update({ sprint_status: sprintStatus }).eq("id", itemId)
        if (error) throw error
      }
    } catch (error) {
      console.error("Error updating sprint status:", error)
    }
  }
}
