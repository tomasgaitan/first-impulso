import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-dvh bg-zinc-950">
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0 min-h-dvh">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
