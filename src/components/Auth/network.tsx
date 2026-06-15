"use client"

import React from "react"

type NodeType = "ec2" | "rds" | "s3" | "lambda"

type Node = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  type: NodeType
  radius: number
}

type Props = {
  className?: string
}

export function BackgroundNetwork({ className }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const frameRef = React.useRef<number | null>(null)
  const nodesRef = React.useRef<Node[]>([])
  const linkDistanceRef = React.useRef<number>(120)
  const mouseRef = React.useRef<{ x: number; y: number } | null>(null)

  const NODE_COLOR = "#0B3B8C"
  const EDGE_BASE_ALPHA = 0.28
  const BG = "#FAFAFA"

  const initNodes = React.useCallback((w: number, h: number) => {
    // Base count based on screen width
    const baseCount = w < 480 ? 40 : w < 768 ? 60 : w < 1280 ? 80 : 100
    const count = Math.floor(baseCount * 1.2) // increase by 20%
    const types: NodeType[] = ["ec2", "rds", "s3", "lambda"]
    const nodes: Node[] = Array.from({ length: count }).map((_, i) => {
      const type = types[i % types.length]
      const radius = 2 + Math.random() * 2
      const speed = 0.05 + Math.random() * 0.05 // slow random motion
      const angle = Math.random() * Math.PI * 2
      return {
        id: i,
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type,
        radius,
      }
    })
    nodesRef.current = nodes
  }, [])

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true
    }
    initNodes(rect.width, rect.height)
  }, [initNodes])

  const step = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { width, height } = canvas.getBoundingClientRect()

    ctx.fillStyle = BG
    ctx.fillRect(0, 0, width, height)

    const nodes = nodesRef.current

    for (const n of nodes) {
      // Gentle default random motion
      const RANDOM_ACCEL = 0.03
      n.vx += (Math.random() - 0.5) * RANDOM_ACCEL
      n.vy += (Math.random() - 0.5) * RANDOM_ACCEL

      // Bounce off edges
      if (n.x < 0 || n.x > width) n.vx *= -1
      if (n.y < 0 || n.y > height) n.vy *= -1
      n.x = Math.max(0, Math.min(width, n.x))
      n.y = Math.max(0, Math.min(height, n.y))

      // Mouse attraction (only nearby nodes)
      if (mouseRef.current) {
        const dx = mouseRef.current.x - n.x
        const dy = mouseRef.current.y - n.y
        const dist = Math.hypot(dx, dy)
        const MAX_ATTRACT_DIST = 150
        if (dist < MAX_ATTRACT_DIST) {
          const force = (1 - dist / MAX_ATTRACT_DIST) * 0.002 // slow, smooth attraction
          n.vx += dx * force
          n.vy += dy * force
        }
      }

      // Damping to keep motion subtle
      const damping = mouseRef.current ? 0.995 : 0.96
      n.vx *= damping
      n.vy *= damping

      // Update position
      n.x += n.vx
      n.y += n.vy
    }

    // Draw edges
    ctx.lineWidth = 1
    ctx.lineCap = "round"
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.hypot(dx, dy)
        if (dist < linkDistanceRef.current) {
          const alpha = (1 - dist / linkDistanceRef.current) * EDGE_BASE_ALPHA
          ctx.strokeStyle = `rgba(0,0,0,${alpha.toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    // Draw nodes
    for (const n of nodes) {
      ctx.beginPath()
      ctx.fillStyle = NODE_COLOR
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    frameRef.current = requestAnimationFrame(step)
  }, [])

  React.useEffect(() => {
    resizeCanvas()
    frameRef.current = requestAnimationFrame(step)

    const onResize = () => resizeCanvas()
    const onMouseMove = (e: MouseEvent) =>
      (mouseRef.current = { x: e.clientX, y: e.clientY })
    const onMouseLeave = () => (mouseRef.current = null)

    window.addEventListener("resize", onResize)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [resizeCanvas, step])

  return (
    <canvas
      ref={canvasRef}
      className={["absolute inset-0 w-full h-full", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  )
}
