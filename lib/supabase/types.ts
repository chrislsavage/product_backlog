export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          avatar: string | null
          role: "product-owner" | "scrum-master" | "developer" | "designer" | "qa"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          avatar?: string | null
          role: "product-owner" | "scrum-master" | "developer" | "designer" | "qa"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar?: string | null
          role?: "product-owner" | "scrum-master" | "developer" | "designer" | "qa"
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          version?: string
          created_at?: string
          updated_at?: string
        }
      }
      features: {
        Row: {
          id: string
          name: string
          description: string | null
          priority: number
          product_id: string
          assigned_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          priority?: number
          product_id: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          priority?: number
          product_id?: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      epics: {
        Row: {
          id: string
          title: string
          description: string | null
          status: "planning" | "in-progress" | "done"
          priority: number
          feature_id: string
          assigned_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: "planning" | "in-progress" | "done"
          priority?: number
          feature_id: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: "planning" | "in-progress" | "done"
          priority?: number
          feature_id?: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stories: {
        Row: {
          id: string
          title: string
          description: string | null
          acceptance_criteria: Json
          story_points: number | null
          priority: number
          status: "backlog" | "ready" | "in-progress" | "done"
          sprint_status: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
          epic_id: string
          assigned_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          acceptance_criteria?: Json
          story_points?: number | null
          priority?: number
          status?: "backlog" | "ready" | "in-progress" | "done"
          sprint_status?: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
          epic_id: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          acceptance_criteria?: Json
          story_points?: number | null
          priority?: number
          status?: "backlog" | "ready" | "in-progress" | "done"
          sprint_status?: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
          epic_id?: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: "todo" | "in-progress" | "done"
          priority: number
          estimated_hours: number | null
          sprint_status: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
          user_story_id: string
          assigned_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: "todo" | "in-progress" | "done"
          priority?: number
          estimated_hours?: number | null
          sprint_status?: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
          user_story_id: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: "todo" | "in-progress" | "done"
          priority?: number
          estimated_hours?: number | null
          sprint_status?: "backlog" | "sprint-backlog" | "in-progress" | "review" | "done"
          user_story_id?: string
          assigned_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sprints: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          status: "planning" | "active" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          status?: "planning" | "active" | "completed"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          status?: "planning" | "active" | "completed"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
