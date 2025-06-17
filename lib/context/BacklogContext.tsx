"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import type { Product, Feature, Epic, UserStory, Task, User, Sprint } from "../types"
import { BacklogService } from "../services/backlog-service"

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
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_FEATURE"; payload: { productId: string; feature: Feature } }
  | { type: "UPDATE_FEATURE"; payload: Feature }
  | { type: "DELETE_FEATURE"; payload: string }
  | { type: "ADD_EPIC"; payload: { featureId: string; epic: Epic } }
  | { type: "UPDATE_EPIC"; payload: Epic }
  | { type: "DELETE_EPIC"; payload: string }
  | { type: "ADD_USER_STORY"; payload: { epicId: string; userStory: UserStory } }
  | { type: "UPDATE_USER_STORY"; payload: UserStory }
  | { type: "DELETE_USER_STORY"; payload: string }
  | { type: "ADD_TASK"; payload: { userStoryId: string; task: Task } }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "ADD_SPRINT"; payload: Sprint }
  | { type: "UPDATE_SPRINT"; payload: Sprint }
  | { type: "SET_ACTIVE_SPRINT"; payload: Sprint | null }
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
      return {
        ...state,
        products: [...state.products, action.payload],
      }

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
        selectedProductId: state.selectedProductId === action.payload ? null : state.selectedProductId,
      }

    case "ADD_FEATURE":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.productId ? { ...p, features: [...p.features, action.payload.feature] } : p,
        ),
      }

    case "UPDATE_FEATURE":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => (feature.id === action.payload.id ? action.payload : feature)),
        })),
      }

    case "DELETE_FEATURE":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.filter((feature) => feature.id !== action.payload),
        })),
        selectedFeatureId: state.selectedFeatureId === action.payload ? null : state.selectedFeatureId,
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

    case "UPDATE_EPIC":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) => (epic.id === action.payload.id ? action.payload : epic)),
          })),
        })),
      }

    case "DELETE_EPIC":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.filter((epic) => epic.id !== action.payload),
          })),
        })),
        selectedEpicId: state.selectedEpicId === action.payload ? null : state.selectedEpicId,
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

    case "UPDATE_USER_STORY":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) => ({
              ...epic,
              userStories: epic.userStories.map((userStory) =>
                userStory.id === action.payload.id ? action.payload : userStory,
              ),
            })),
          })),
        })),
      }

    case "DELETE_USER_STORY":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) => ({
              ...epic,
              userStories: epic.userStories.filter((userStory) => userStory.id !== action.payload),
            })),
          })),
        })),
        selectedUserStoryId: state.selectedUserStoryId === action.payload ? null : state.selectedUserStoryId,
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

    case "UPDATE_TASK":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) => ({
              ...epic,
              userStories: epic.userStories.map((userStory) => ({
                ...userStory,
                tasks: userStory.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
              })),
            })),
          })),
        })),
      }

    case "DELETE_TASK":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            epics: feature.epics.map((epic) => ({
              ...epic,
              userStories: epic.userStories.map((userStory) => ({
                ...userStory,
                tasks: userStory.tasks.filter((task) => task.id !== action.payload),
              })),
            })),
          })),
        })),
      }

    case "ADD_USER":
      return {
        ...state,
        users: [...state.users, action.payload],
      }

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
      }

    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
      }

    case "ADD_SPRINT":
      return {
        ...state,
        sprints: [...state.sprints, action.payload],
      }

    case "UPDATE_SPRINT":
      return {
        ...state,
        sprints: state.sprints.map((sprint) => (sprint.id === action.payload.id ? action.payload : sprint)),
      }

    case "SET_ACTIVE_SPRINT":
      return {
        ...state,
        activeSprint: action.payload,
      }

    case "MOVE_TO_SPRINT":
      // Update locally first for immediate UI feedback
      const updatedState = {
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

      // Update in database
      BacklogService.updateSprintStatus(
        action.payload.itemId,
        action.payload.itemType,
        action.payload.sprintStatus,
      ).catch(console.error)

      return updatedState

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

export function BacklogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(backlogReducer, initialState)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })

        const [products, users, sprints] = await Promise.all([
          BacklogService.getProducts(),
          BacklogService.getUsers(),
          BacklogService.getSprints(),
        ])

        dispatch({ type: "SET_PRODUCTS", payload: products })
        dispatch({ type: "SET_USERS", payload: users })
        dispatch({ type: "SET_SPRINTS", payload: sprints })
      } catch (error) {
        console.error("Failed to load data:", error)
        dispatch({ type: "SET_ERROR", payload: "Failed to load data" })
      }
    }

    loadData()
  }, [])

  const createProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "features">) => {
    try {
      const product = await BacklogService.createProduct(productData)
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
      const feature = await BacklogService.createFeature({ ...featureData, productId })
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
      const epic = await BacklogService.createEpic({ ...epicData, featureId })
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
      const userStory = await BacklogService.createUserStory({ ...userStoryData, epicId })
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
      const task = await BacklogService.createTask({ ...taskData, userStoryId })
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
