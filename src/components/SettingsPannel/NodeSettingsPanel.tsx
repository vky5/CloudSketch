"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { formSchemaRegistry } from "@/config/formSchemaRegistry";
import { X } from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import RenderForm from "./RenderForm";
import saveLogic from "@/lib/customSaveLogics/saveLogicRegistry";
import { ResourceBlock } from "@/utils/types/resource";
import { NodeField } from "@/utils/types/NodeField";

function NodeSettingsPanel({ editorWidth }: { editorWidth: number }) {
  const { settingOpenNodeId, nodes, updateNodeData } = useDiagramStore();
  const [isValid, setIsValid] = useState(false);

  const node = nodes.find((n) => n.id === settingOpenNodeId) as
    | ResourceBlock
    | undefined;

  const nodeType = node?.type ?? null;

  const formFields: NodeField[] = useMemo(() => {
    return nodeType ? formSchemaRegistry[nodeType] || [] : [];
  }, [nodeType]);

  const getNodeFieldValue = useCallback(
    (key: keyof ResourceBlock["data"]): unknown => {
      if (!node) return undefined;
      return node.data[key];
    },
    [node]
  );

  const handleChange = useCallback(
    (key: keyof ResourceBlock["data"], value: unknown) => {
      if (!settingOpenNodeId) return;
      updateNodeData(settingOpenNodeId, {
        [key]: value,
      } as Partial<ResourceBlock["data"]>);
    },
    [settingOpenNodeId, updateNodeData]
  );

  const handleSaveAndClose = useCallback(async () => {
    if (!isValid || !node) return;
    await saveLogic({
      id: node.id,
      type: node.type!,
      data: node.data,
    });
    closeSettingsorConfig();
  }, [isValid, node]);

  useEffect(() => {
    if (!node) return;
    if (!formFields.length) {
      setIsValid(true);
      return;
    }

    const requiredFields = formFields.filter((f) => f.required);
    const missing = requiredFields.filter((field) => {
      const value = getNodeFieldValue(field.key as keyof ResourceBlock["data"]);
      return value === undefined || value === null || value === "";
    });
    setIsValid(missing.length === 0);
  }, [node, formFields, getNodeFieldValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isValid) handleSaveAndClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isValid, handleSaveAndClose]);

  if (!settingOpenNodeId || !node) return null;

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
              currentNode={getNodeFieldValue(
                field.key as keyof typeof node.data
              )}
              handleChange={(value) =>
                handleChange(field.key as keyof typeof node.data, value)
              }
            />
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#2e2e32]">
        <button
          onClick={handleSaveAndClose}
          disabled={!isValid}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${
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
