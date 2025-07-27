import { useDiagramStore } from '@/store/useDiagramStore'

export default function NodeSettingsPanel() {
  const { selectedNodeId, nodes, updateNodeData, closeSettings } = useDiagramStore()

  const node = nodes.find((n) => n.id === selectedNodeId)

  if (!node) return null

  const data = node.data || {}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateNodeData(node.id, { ...data, [name]: value })
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-[#111827] text-white p-4 border-l border-gray-700 shadow-lg z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Settings: {node.data.label}</h2>
        <button onClick={closeSettings} className="text-gray-400 hover:text-white">✖️</button>
      </div>

      {/* Form: customize based on node type */}
      {node.type === 'customNode' && (
        <>
          <label className="block text-sm mb-1">Instance Type</label>
          <input
            name="instanceType"
            value={data.instanceType || ''}
            onChange={handleChange}
            className="w-full mb-3 p-1 rounded bg-gray-800 border border-gray-600"
            placeholder="e.g., t2.micro"
          />

          <label className="block text-sm mb-1">Security Group</label>
          <input
            name="securityGroup"
            value={data.securityGroup || ''}
            onChange={handleChange}
            className="w-full mb-3 p-1 rounded bg-gray-800 border border-gray-600"
            placeholder="e.g., sg-123456"
          />
        </>
      )}

      {/* Save/Close Buttons */}
      <button
        onClick={closeSettings}
        className="mt-4 w-full bg-orange-500 hover:bg-orange-600 p-2 rounded"
      >
        Close Panel
      </button>
    </div>
  )
}
