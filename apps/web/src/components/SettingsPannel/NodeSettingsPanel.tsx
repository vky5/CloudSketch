import { useDiagramStore } from "@/store/useDiagramStore";
import { formSchemaRegistry } from "@/config/formSchemaRegistry";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import RenderForm from "./RenderForm";
import saveLogic from "@/lib/customSaveLogics/saveLogicRegistry";

function NodeSettingsPanel({ editorWidth }: { editorWidth: number }) {
  const { settingOpenNodeId, nodes, updateNodeData } = useDiagramStore();
  const [isValid, setIsValid] = useState(false);

  if (!settingOpenNodeId) return null;

  const node = nodes.find((n) => n.id === settingOpenNodeId);
  if (!node) return null;

  const nodeType = node.type!;
  const formFields = formSchemaRegistry[nodeType] || [];
  console.log(formFields);

  // Helper to safely get field value from union type
  const getNodeFieldValue = (key: string) => {
    return (node.data as Record<string, any>)[key];
  };

  const handleChange = (key: string, value: any) => {
    updateNodeData(settingOpenNodeId, { [key]: value });
  };

  const handleSaveAndClose = async () => {
    if (!isValid) return;
    await saveLogic({
      id: node.id,
      type: node.type!,
      data: node.data,
    });
    closeSettingsorConfig();
  };

  // Validate required fields whenever node.data changes
  useEffect(() => {
    if (!formFields.length) {
      setIsValid(true);
      return;
    }

    // find all required fields in schema
    const requiredFields = formFields.filter((f) => f.required);

    // check if each required field exists and has a non-empty value
    const missing = requiredFields.filter((field) => {
      const value = getNodeFieldValue(field.key);
      return value === undefined || value === null || value === "";
    });

    setIsValid(missing.length === 0);
  }, [node.data, formFields]);

  // Trigger save & close on Enter key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isValid) {
        handleSaveAndClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isValid, node.data]);

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
              currentNode={getNodeFieldValue(field.key)}
              handleChange={handleChange}
            />
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#2e2e32]">
        <button
          onClick={handleSaveAndClose}
          disabled={!isValid}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition 
            ${
              isValid
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}

export default NodeSettingsPanel;
