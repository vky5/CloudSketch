"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { formSchemaRegistry } from "@/config/formSchemaRegistry";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import RenderForm from "./RenderForm";
import saveLogic from "@/lib/customSaveLogics/saveLogicRegistry";
import { ResourceBlock } from "@/utils/types/resource";
import { NodeField } from "@/utils/types/NodeField";
import SettingsPanelShell from "./SettingsPanelShell";

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

  const nodeName =
    "Name" in node.data && typeof node.data.Name === "string"
      ? node.data.Name
      : undefined;

  return (
    <SettingsPanelShell
      editorWidth={editorWidth}
      title="Node settings"
      subtitle={nodeName || nodeType || undefined}
      meta={settingOpenNodeId}
      onClose={closeSettingsorConfig}
      footer={
        <button
          onClick={handleSaveAndClose}
          disabled={!isValid}
          className="h-9 w-full rounded-lg bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save & close
        </button>
      }
    >
      {formFields.length === 0 ? (
        <p className="text-sm text-slate-500">
          No settings available for this node type.
        </p>
      ) : (
        <div className="space-y-5">
          {formFields.map((field) => (
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
          ))}
        </div>
      )}
    </SettingsPanelShell>
  );
}

export default NodeSettingsPanel;