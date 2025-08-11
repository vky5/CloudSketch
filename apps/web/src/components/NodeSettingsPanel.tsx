import { useDiagramStore } from "@/store/useDiagramStore";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { formSchemaRegistry } from "@/config/formSchemaRegistry";
import { X } from "lucide-react";
import React from "react";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";

function NodeSettingsPanel({ editorWidth }: { editorWidth: number }) {
  const { settingOpenNodeId, nodes, updateNodeData } = useDiagramStore();
  const { resources } = useTerraformResourceStore();

  if (!settingOpenNodeId) return null;

  const node = nodes.find((n) => n.id === settingOpenNodeId);
  if (!node) return null;

  const nodeType = node.type!;
  const formFields = formSchemaRegistry[nodeType] || [];

  const handleChange = (key: string, value: string) => {
    updateNodeData(settingOpenNodeId, { [key]: value });
  };

  const renderField = (field: any) => {
    const currentValue = (node.data?.[field.key] as string) || "";

    switch (field.type) {
      case "text":
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm mb-1 font-medium text-gray-300">
              {field.label}
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder || ""}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-white rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
            />
          </div>
        );

      case "dropdown": {
        let options: string[] = [];
        if (resources.length==0){
          // do nothing 
        }
        else if (field.dynamicOptionsSource === "securityGroups") {
          options = resources.map((sg) =>
            sg.type === "securityGroup" ? sg.data.label : ""
          );
        } else if (field.dynamicOptionsSource === "keyPairs") {
          options = resources.map((kp) =>
            kp.type === "keyPair" ? kp.data.label : ""
          );
        }

        return (
          <div key={field.key} className="mb-4">
            <label className="block text-sm mb-1 font-medium text-gray-300">
              {field.label}
            </label>
            <select
              value={currentValue}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-sm rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {field.label}</option>
              {options.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const handleSaveAndClose = async () => {
    await syncNodeWithBackend(node);
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
          formFields.map(renderField)
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
