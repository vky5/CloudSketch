import { useDiagramStore } from "@/store/useDiagramStore";
import { formSchemaRegistry } from "@/config/formSchemaRegistry";
import { X } from "lucide-react";
import React from "react";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import RenderForm from "./RenderForm";

function NodeSettingsPanel({ editorWidth }: { editorWidth: number }) {
  const { settingOpenNodeId, nodes, updateNodeData } = useDiagramStore();

  if (!settingOpenNodeId) return null;

  const node = nodes.find((n) => n.id === settingOpenNodeId);
  if (!node) return null;

  const nodeType = node.type!;
  const formFields = formSchemaRegistry[nodeType] || [];

  const handleChange = (key: string, value: string) => {
    updateNodeData(settingOpenNodeId, { [key]: value });
  };

  const handleSaveAndClose = async () => {
    await syncNodeWithBackend({
      id: node.id,
      type: node.type!,
      data: node.data,
    });
    closeSettingsorConfig();
  };

  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] bg-[#232329] text-white shadow-lg z-[1001] rounded-l-md flex flex-col"
      style={{ right: `${editorWidth}px`, width: "350px" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e32]">
        <h2 className="text-lg font-semibold">Settings</h2>
        <button
          onClick={closeSettingsorConfig}
          title="Close Settings"
          className="text-red-400 hover:text-red-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="p-4 overflow-y-auto flex-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        <p className="text-xs mb-4 text-gray-400">
          Node ID: {settingOpenNodeId}
        </p>

        {formFields.length === 0 ? (
          <p className="text-sm text-gray-400">
            No settings available for this node type.
          </p>
        ) : (
          formFields.map((field) => (
            <RenderForm
              key={field.key}
              field={field}
              currentNode={(node.data?.[field.key] as string) || ""}
              handleChange={handleChange}
            />
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#2e2e32]">
        <button
          onClick={handleSaveAndClose}
          className="w-full bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}

export default NodeSettingsPanel;
