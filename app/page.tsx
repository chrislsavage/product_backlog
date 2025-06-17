import { BacklogProvider } from "@/lib/context/BacklogContext"
import Dashboard from "@/components/Dashboard"
import { Suspense } from "react"

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading product backlog...</div>}>
      <BacklogProvider>
        <Dashboard />
      </BacklogProvider>
    </Suspense>
  )
}
