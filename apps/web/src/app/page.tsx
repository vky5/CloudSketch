import Sidebar from "@/components/Sidebar"
import Header from '@/components/Header'
import Canvas from '@/components/Canvas'

export default function HomePage() {
  return (
    <div className="w-full h-screen overflow-hidden bg-[#0b0c0e]">
      <Header />

      <Sidebar />

      {/* Main content area with padding for header and sidebar */}
      <main className="h-full w-full">
        <Canvas />
      </main>
    </div>
  )
}
