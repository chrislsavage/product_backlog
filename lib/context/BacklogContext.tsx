"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Product, Feature, Epic, UserStory, Task, User, Sprint } from "../types"

interface BacklogState {
  products: Product[]
  users: User[]
  sprints: Sprint[]
  selectedProductId: string | null
  selectedFeatureId: string | null
  selectedEpicId: string | null
  selectedUserStoryId: string | null
  currentView: "backlog" | "kanban" | "hierarchy"
  activeSprint: Sprint | null
  loading: boolean
  error: string | null
}

type BacklogAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_SPRINTS"; payload: Sprint[] }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "ADD_FEATURE"; payload: { productId: string; feature: Feature } }
  | { type: "ADD_EPIC"; payload: { featureId: string; epic: Epic } }
  | { type: "ADD_USER_STORY"; payload: { epicId: string; userStory: UserStory } }
  | { type: "ADD_TASK"; payload: { userStoryId: string; task: Task } }
  | { type: "MOVE_TO_SPRINT"; payload: { itemId: string; itemType: "user-story" | "task"; sprintStatus: string } }
  | { type: "SELECT_PRODUCT"; payload: string | null }
  | { type: "SELECT_FEATURE"; payload: string | null }
  | { type: "SELECT_EPIC"; payload: string | null }
  | { type: "SELECT_USER_STORY"; payload: string | null }
  | { type: "SET_VIEW"; payload: "backlog" | "kanban" | "hierarchy" }

const initialState: BacklogState = {
  products: [],
  users: [],
  sprints: [],
  selectedProductId: null,
  selectedFeatureId: null,
  selectedEpicId: null,
  selectedUserStoryId: null,
  currentView: "backlog",
  activeSprint: null,
  loading: false,
  error: null,
}

function backlogReducer(state: BacklogState, action: BacklogAction): BacklogState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }

    case "SET_PRODUCTS":
      return { ...state, products: action.payload, loading: false }

    case "SET_USERS":
      return { ...state, users: action.payload }

    case "SET_SPRINTS":
      return { ...state, sprints: action.payload }

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] }

    case "ADD_FEATURE":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId ? { ...p, features: [...p.features, action.payload.feature] } : p,
        ),
      }

    case "ADD_EPIC":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) =>
            feature.id === action.payload.featureId
              ? { ...feature, epics: [...feature.epics, action.payload.epic] }
              : feature,
          ),
        })),
      }

    case "ADD_USER_STORY":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) =>
              epic.id === action.payload.epicId
                ? { ...epic, userStories: [...epic.userStories, action.payload.userStory] }
                : epic,
            ),
          })),
        })),
      }

    case "ADD_TASK":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) => ({
              ...epic,
              userStories: epic.userStories.map((userStory) =>
                userStory.id === action.payload.userStoryId
                  ? { ...userStory, tasks: [...userStory.tasks, action.payload.task] }
                  : userStory,
              ),
            })),
          })),
        })),
      }

    case "MOVE_TO_SPRINT":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) => ({
              ...epic,
              userStories: epic.userStories.map((userStory) => {
                if (action.payload.itemType === "user-story" && userStory.id === action.payload.itemId) {
                  return { ...userStory, sprintStatus: action.payload.sprintStatus as any }
                }
                return {
                  ...userStory,
                  tasks: userStory.tasks.map((task) => {
                    if (action.payload.itemType === "task" && task.id === action.payload.itemId) {
                      return { ...task, sprintStatus: action.payload.sprintStatus as any }
                    }
                    return task
                  }),
                }
              }),
            })),
          })),
        })),
      }

    case "SELECT_PRODUCT":
      return {
        ...state,
        selectedProductId: action.payload,
        selectedFeatureId: null,
        selectedEpicId: null,
        selectedUserStoryId: null,
      }

    case "SELECT_FEATURE":
      return {
        ...state,
        selectedFeatureId: action.payload,
        selectedEpicId: null,
        selectedUserStoryId: null,
      }

    case "SELECT_EPIC":
      return {
        ...state,
        selectedEpicId: action.payload,
        selectedUserStoryId: null,
      }

    case "SELECT_USER_STORY":
      return {
        ...state,
        selectedUserStoryId: action.payload,
      }

    case "SET_VIEW":
      return {
        ...state,
        currentView: action.payload,
      }

    default:
      return state
  }
}

const BacklogContext = createContext<{
  state: BacklogState
  dispatch: React.Dispatch<BacklogAction>
  createProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt" | "features">) => Promise<void>
  createFeature: (
    productId: string,
    feature: Omit<Feature, "id" | "createdAt" | "updatedAt" | "epics" | "productId">,
  ) => Promise<void>
  createEpic: (
    featureId: string,
    epic: Omit<Epic, "id" | "createdAt" | "updatedAt" | "userStories" | "featureId">,
  ) => Promise<void>
  createUserStory: (
    epicId: string,
    userStory: Omit<UserStory, "id" | "createdAt" | "updatedAt" | "tasks" | "epicId">,
  ) => Promise<void>
  createTask: (userStoryId: string, task: Omit<Task, "id" | "createdAt" | "updatedAt" | "userStoryId">) => Promise<void>
} | null>(null)

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function BacklogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(backlogReducer, initialState)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })

        // Try to load from Supabase, fallback to sample data
        try {
          const { BacklogService } = await import("../services/backlog-service")
          const [products, users, sprints] = await Promise.all([
            BacklogService.getProducts(),
            BacklogService.getUsers(),
            BacklogService.getSprints(),
          ])

          dispatch({ type: "SET_PRODUCTS", payload: products })
          dispatch({ type: "SET_USERS", payload: users })
          dispatch({ type: "SET_SPRINTS", payload: sprints })
        } catch (error) {
          console.warn("Failed to load from Supabase, using sample data:", error)

          // Fallback to sample data
          const { createSampleData } = await import("../utils/data")
          const sampleData = createSampleData()

          dispatch({ type: "SET_PRODUCTS", payload: sampleData.products })
          dispatch({ type: "SET_USERS", payload: sampleData.users })
          dispatch({ type: "SET_SPRINTS", payload: sampleData.sprints })
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load data" })
      }
    }

    loadData()
  }, [])

  const createProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "features">) => {
    try {
      const product: Product = {
        ...productData,
        id: generateId(),
        features: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dispatch({ type: "ADD_PRODUCT", payload: product })
    } catch (error) {
      console.error("Failed to create product:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to create product" })
    }
  }

  const createFeature = async (
    productId: string,
    featureData: Omit<Feature, "id" | "createdAt" | "updatedAt" | "epics" | "productId">,
  ) => {
    try {
      const feature: Feature = {
        ...featureData,
        id: generateId(),
        productId,
        epics: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dispatch({ type: "ADD_FEATURE", payload: { productId, feature } })
    } catch (error) {
      console.error("Failed to create feature:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to create feature" })
    }
  }

  const createEpic = async (
    featureId: string,
    epicData: Omit<Epic, "id" | "createdAt" | "updatedAt" | "userStories" | "featureId">,
  ) => {
    try {
      const epic: Epic = {
        ...epicData,
        id: generateId(),
        featureId,
        userStories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dispatch({ type: "ADD_EPIC", payload: { featureId, epic } })
    } catch (error) {
      console.error("Failed to create epic:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to create epic" })
    }
  }

  const createUserStory = async (
    epicId: string,
    userStoryData: Omit<UserStory, "id" | "createdAt" | "updatedAt" | "tasks" | "epicId">,
  ) => {
    try {
      const userStory: UserStory = {
        ...userStoryData,
        id: generateId(),
        epicId,
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dispatch({ type: "ADD_USER_STORY", payload: { epicId, userStory } })
    } catch (error) {
      console.error("Failed to create user story:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to create user story" })
    }
  }

  const createTask = async (
    userStoryId: string,
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userStoryId">,
  ) => {
    try {
      const task: Task = {
        ...taskData,
        id: generateId(),
        userStoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dispatch({ type: "ADD_TASK", payload: { userStoryId, task } })
    } catch (error) {
      console.error("Failed to create task:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to create task" })
    }
  }

  return (
    <BacklogContext.Provider
      value={{
        state,
        dispatch,
        createProduct,
        createFeature,
        createEpic,
        createUserStory,
        createTask,
      }}
    >
      {children}
    </BacklogContext.Provider>
  )
}

export function useBacklog() {
  const context = useContext(BacklogContext)
  if (!context) {
    throw new Error("useBacklog must be used within a BacklogProvider")
  }
  return context
}
