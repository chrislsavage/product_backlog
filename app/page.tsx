export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Product Backlog Manager</h1>
        <p className="text-gray-600 mt-2">Your product backlog application is working!</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-gray-600">Manage your products</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <p className="text-gray-600">Track features and epics</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Tasks</h2>
            <p className="text-gray-600">Manage user stories and tasks</p>
          </div>
        </div>
      </div>
    </div>
  )
}
