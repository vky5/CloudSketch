// components/ComponentItem.tsx
'use client'

import { cn } from "@/lib/utils"

export function ComponentItem({ component, className }: { component: any; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer border border-border",
        className
      )}
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData("application/json", JSON.stringify(component))
      }
    >
      <component.icon className="h-5 w-5 text-blue-500 mt-1" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{component.name}</span>
        <span className="text-xs text-muted-foreground">{component.description}</span>
      </div>
    </div>
  )
}
