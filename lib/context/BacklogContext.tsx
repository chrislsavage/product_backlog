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
  currentView: "backlog" | "kanban" | "hierarchy" | "users"
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
  | { type: "REORDER_ITEMS"; payload: { draggedId: string; targetId: string; itemType: string } }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "DELETE_FEATURE"; payload: string }
  | { type: "DELETE_EPIC"; payload: string }
  | { type: "DELETE_USER_STORY"; payload: string }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "SELECT_PRODUCT"; payload: string | null }
  | { type: "SELECT_FEATURE"; payload: string | null }
  | { type: "SELECT_EPIC"; payload: string | null }
  | { type: "SELECT_USER_STORY"; payload: string | null }
  | { type: "SET_VIEW"; payload: "backlog" | "kanban" | "hierarchy" | "users" }
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: string }
  | { type: "UPDATE_FEATURE"; payload: Feature }
  | { type: "UPDATE_EPIC"; payload: Epic }
  | { type: "UPDATE_USER_STORY"; payload: UserStory }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "UPDATE_PRODUCT"; payload: Product }

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

function reorderArray<T extends { id: string }>(array: T[], draggedId: string, targetId: string): T[] {
  const draggedIndex = array.findIndex((item) => item.id === draggedId)
  const targetIndex = array.findIndex((item) => item.id === targetId)

  if (draggedIndex === -1 || targetIndex === -1) return array

  const newArray = [...array]
  const [draggedItem] = newArray.splice(draggedIndex, 1)
  newArray.splice(targetIndex, 0, draggedItem)

  return newArray
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

    case "REORDER_ITEMS":
      return {
        ...state,
        products: state.products.map((product) => {
          if (action.payload.itemType === "product") {
            // Reorder products at the root level
            return product
          }

          return {
            ...product,
            features: product.features.map((feature) => {
              if (action.payload.itemType === "feature") {
                // Find the product that contains both features and reorder
                const parentProduct = state.products.find((p) =>
                  p.features.some((f) => f.id === action.payload.draggedId || f.id === action.payload.targetId),
                )
                if (parentProduct?.id === product.id) {
                  return {
                    ...feature,
                    // This will be handled at the product level
                  }
                }
              }

              return {
                ...feature,
                epics: feature.epics.map((epic) => {
                  if (action.payload.itemType === "epic") {
                    // Find the feature that contains both epics and reorder
                    const parentFeature = product.features.find((f) =>
                      f.epics.some((e) => e.id === action.payload.draggedId || e.id === action.payload.targetId),
                    )
                    if (parentFeature?.id === feature.id) {
                      return {
                        ...epic,
                        // This will be handled at the feature level
                      }
                    }
                  }

                  return {
                    ...epic,
                    userStories: epic.userStories.map((userStory) => {
                      if (action.payload.itemType === "user-story") {
                        // Find the epic that contains both user stories and reorder
                        const parentEpic = feature.epics.find((e) =>
                          e.userStories.some(
                            (us) => us.id === action.payload.draggedId || us.id === action.payload.targetId,
                          ),
                        )
                        if (parentEpic?.id === epic.id) {
                          return {
                            ...userStory,
                            // This will be handled at the epic level
                          }
                        }
                      }

                      if (action.payload.itemType === "task") {
                        // Find the user story that contains both tasks and reorder
                        const parentUserStory = epic.userStories.find((us) =>
                          us.tasks.some((t) => t.id === action.payload.draggedId || t.id === action.payload.targetId),
                        )
                        if (parentUserStory?.id === userStory.id) {
                          return {
                            ...userStory,
                            tasks: reorderArray(userStory.tasks, action.payload.draggedId, action.payload.targetId),
                          }
                        }
                      }

                      return userStory
                    }),
                  }
                }),
              }
            }),
          }
        }),
      }

    // Handle reordering at different levels
    case "REORDER_ITEMS":
      if (action.payload.itemType === "product") {
        return {
          ...state,
          products: reorderArray(state.products, action.payload.draggedId, action.payload.targetId),
        }
      }

      return {
        ...state,
        products: state.products.map((product) => {
          if (action.payload.itemType === "feature") {
            // Check if this product contains the features being reordered
            const hasFeatures = product.features.some(
              (f) => f.id === action.payload.draggedId || f.id === action.payload.targetId,
            )
            if (hasFeatures) {
              return {
                ...product,
                features: reorderArray(product.features, action.payload.draggedId, action.payload.targetId),
              }
            }
          }

          return {
            ...product,
            features: product.features.map((feature) => {
              if (action.payload.itemType === "epic") {
                // Check if this feature contains the epics being reordered
                const hasEpics = feature.epics.some(
                  (e) => e.id === action.payload.draggedId || e.id === action.payload.targetId,
                )
                if (hasEpics) {
                  return {
                    ...feature,
                    epics: reorderArray(feature.epics, action.payload.draggedId, action.payload.targetId),
                  }
                }
              }

              return {
                ...feature,
                epics: feature.epics.map((epic) => {
                  if (action.payload.itemType === "user-story") {
                    // Check if this epic contains the user stories being reordered
                    const hasUserStories = epic.userStories.some(
                      (us) => us.id === action.payload.draggedId || us.id === action.payload.targetId,
                    )
                    if (hasUserStories) {
                      return {
                        ...epic,
                        userStories: reorderArray(epic.userStories, action.payload.draggedId, action.payload.targetId),
                      }
                    }
                  }

                  return {
                    ...epic,
                    userStories: epic.userStories.map((userStory) => {
                      if (action.payload.itemType === "task") {
                        // Check if this user story contains the tasks being reordered
                        const hasTasks = userStory.tasks.some(
                          (t) => t.id === action.payload.draggedId || t.id === action.payload.targetId,
                        )
                        if (hasTasks) {
                          return {
                            ...userStory,
                            tasks: reorderArray(userStory.tasks, action.payload.draggedId, action.payload.targetId),
                          }
                        }
                      }

                      return userStory
                    }),
                  }
                }),
              }
            }),
          }
        }),
      }

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload),
        // Reset selections if deleted product was selected
        selectedProductId: state.selectedProductId === action.payload ? null : state.selectedProductId,
        selectedFeatureId: state.selectedProductId === action.payload ? null : state.selectedFeatureId,
        selectedEpicId: state.selectedProductId === action.payload ? null : state.selectedEpicId,
        selectedUserStoryId: state.selectedProductId === action.payload ? null : state.selectedUserStoryId,
      }

    case "DELETE_FEATURE":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.filter((feature) => feature.id !== action.payload),
        })),
        // Reset selections if deleted feature was selected
        selectedFeatureId: state.selectedFeatureId === action.payload ? null : state.selectedFeatureId,
        selectedEpicId: state.selectedFeatureId === action.payload ? null : state.selectedEpicId,
        selectedUserStoryId: state.selectedFeatureId === action.payload ? null : state.selectedUserStoryId,
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
        // Reset selections if deleted epic was selected
        selectedEpicId: state.selectedEpicId === action.payload ? null : state.selectedEpicId,
        selectedUserStoryId: state.selectedEpicId === action.payload ? null : state.selectedUserStoryId,
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
        // Reset selections if deleted user story was selected
        selectedUserStoryId: state.selectedUserStoryId === action.payload ? null : state.selectedUserStoryId,
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
        // Also unassign the user from all items
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => ({
            ...feature,
            assignedUserId: feature.assignedUserId === action.payload ? undefined : feature.assignedUserId,
            epics: feature.epics.map((epic) => ({
              ...epic,
              assignedUserId: epic.assignedUserId === action.payload ? undefined : epic.assignedUserId,
              userStories: epic.userStories.map((userStory) => ({
                ...userStory,
                assignedUserId: userStory.assignedUserId === action.payload ? undefined : userStory.assignedUserId,
                tasks: userStory.tasks.map((task) => ({
                  ...task,
                  assignedUserId: task.assignedUserId === action.payload ? undefined : task.assignedUserId,
                })),
              })),
            })),
          })),
        })),
      }

    case "UPDATE_FEATURE":
      return {
        ...state,
        products: state.products.map((product) => ({
          ...product,
          features: product.features.map((feature) => (feature.id === action.payload.id ? action.payload : feature)),
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
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) => (product.id === action.payload.id ? action.payload : product)),
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
  createUser: (userData: Omit<User, "id">) => Promise<void>
  updateUser: (user: User) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  updateFeature: (feature: Feature) => Promise<void>
  updateEpic: (epic: Epic) => Promise<void>
  updateUserStory: (userStory: UserStory) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  updateProduct: (product: Product) => Promise<void>
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

  const createUser = async (userData: Omit<User, "id">) => {
    try {
      const user: User = {
        ...userData,
        id: generateId(),
      }
      dispatch({ type: "ADD_USER", payload: user })
    } catch (error) {
      console.error("Failed to create user:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to create user" })
    }
  }

  const updateUser = async (user: User) => {
    try {
      dispatch({ type: "UPDATE_USER", payload: user })
    } catch (error) {
      console.error("Failed to update user:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update user" })
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      dispatch({ type: "DELETE_USER", payload: userId })
    } catch (error) {
      console.error("Failed to delete user:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to delete user" })
    }
  }

  const updateFeature = async (feature: Feature) => {
    try {
      dispatch({ type: "UPDATE_FEATURE", payload: feature })
    } catch (error) {
      console.error("Failed to update feature:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update feature" })
    }
  }

  const updateEpic = async (epic: Epic) => {
    try {
      dispatch({ type: "UPDATE_EPIC", payload: epic })
    } catch (error) {
      console.error("Failed to update epic:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update epic" })
    }
  }

  const updateUserStory = async (userStory: UserStory) => {
    try {
      dispatch({ type: "UPDATE_USER_STORY", payload: userStory })
    } catch (error) {
      console.error("Failed to update user story:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update user story" })
    }
  }

  const updateTask = async (task: Task) => {
    try {
      dispatch({ type: "UPDATE_TASK", payload: task })
    } catch (error) {
      console.error("Failed to update task:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update task" })
    }
  }

  const updateProduct = async (product: Product) => {
    try {
      dispatch({ type: "UPDATE_PRODUCT", payload: product })
    } catch (error) {
      console.error("Failed to update product:", error)
      dispatch({ type: "SET_ERROR", payload: "Failed to update product" })
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
        createUser,
        updateUser,
        deleteUser,
        updateFeature,
        updateEpic,
        updateUserStory,
        updateTask,
        updateProduct,
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
