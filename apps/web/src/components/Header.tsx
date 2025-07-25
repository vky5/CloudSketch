'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full px-6 py-4 border-b border-neutral-800 bg-black text-white flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        CloudSketch
      </Link>

      <nav className="hidden md:flex gap-4">
        <Link href="/canvas" className="hover:text-neutral-300 transition">
          Canvas
        </Link>
        <Link href="/editor" className="hover:text-neutral-300 transition">
          Editor
        </Link>
        <Link href="/docs" className="hover:text-neutral-300 transition">
          Docs
        </Link>
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="hidden md:inline-flex text-sm px-4 py-2 border-neutral-700 bg-neutral-900 hover:bg-neutral-800">
          Login
        </Button>
        <Button className="md:hidden p-2" variant="ghost">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
