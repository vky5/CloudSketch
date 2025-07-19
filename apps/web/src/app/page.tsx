import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import Canvas from '@/components/Canvas'

export default function HomePage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-[#0b0c0e]">
        <Header />
        <main className="flex-1 overflow-auto">
          <Canvas />
        </main>
      </div>
    </div>
  )
}
