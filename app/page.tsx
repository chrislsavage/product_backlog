import { BacklogProvider } from "@/lib/context/BacklogContext"
import Dashboard from "@/components/Dashboard"

export default function Home() {
  return (
    <BacklogProvider>
      <Dashboard />
    </BacklogProvider>
  )
}
