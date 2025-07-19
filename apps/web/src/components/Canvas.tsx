'use client'

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from 'reactflow'

import 'reactflow/dist/style.css'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Compute' },
    position: { x: 250, y: 5 },
  },
]

const initialEdges: Edge[] = []

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = (params: Edge | Connection) =>
    setEdges((eds) => addEdge(params, eds))

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        className='bg-[#020817]'
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={11} size={1} />
      </ReactFlow>
    </div>
  )
}
