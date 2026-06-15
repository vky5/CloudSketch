"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { X, ArrowLeft } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import { formSchemaRegistry } from "@/config/formSchemaRegistry";
import { useUIPanelStore } from "@/store/useUIPanelStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import RenderForm from "./RenderForm";
import { ResourceBlock } from "@/utils/types/resource";

function ResourceSettingsPanel({ editorWidth }: { editorWidth: number }) {
  const { settingOpenResourceId, resources, updateResource } =
    useTerraformResourceStore();
  const { openConfig } = useUIPanelStore();
  const [isValid, setIsValid] = useState(false);

  const resource = useMemo(
    () => resources.find((r) => r.id === settingOpenResourceId),
    [resources, settingOpenResourceId]
  ) as ResourceBlock | undefined;

  const resourceType = resource?.type ?? null;

  const formFields = useMemo(
    () => (resourceType ? formSchemaRegistry[resourceType] || [] : []),
    [resourceType]
  );

  const resourceData: Partial<ResourceBlock["data"]> = useMemo(
    () => resource?.data ?? {},
    [resource]
  );

  const handleChange = useCallback(
    <K extends keyof ResourceBlock["data"]>(key: K, value: unknown) => {
      if (!settingOpenResourceId || !resource) return;

      // Narrow the data to the current resource type
      const currentData = resource.data as Record<string, unknown>;

      updateResource(settingOpenResourceId, {
        ...currentData,
        [key]: value,
      } as ResourceBlock["data"]);
    },
    [settingOpenResourceId, resource, updateResource]
  );

  const handleSaveAndClose = useCallback(async () => {
    if (!isValid || !resource) return;
    await syncNodeWithBackend({
      id: resource.id,
      data: resource.data,
      type: resource.type,
    });
    openConfig();
  }, [isValid, resource, openConfig]);

  useEffect(() => {
    if (!resource || !formFields.length) {
      setIsValid(true);
      return;
    }

    const requiredFields = formFields.filter((f) => f.required);
    const missing = requiredFields.filter(
      (field) =>
        resourceData[field.key as keyof ResourceBlock["data"]] === undefined ||
        resourceData[field.key as keyof ResourceBlock["data"]] === null ||
        resourceData[field.key as keyof ResourceBlock["data"]] === ""
    );

    setIsValid(missing.length === 0);
  }, [resource, formFields, resourceData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isValid) handleSaveAndClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isValid, handleSaveAndClose]);

  if (!settingOpenResourceId || !resource) return null;

  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] bg-[#232329] text-white shadow-lg z-[1001] rounded-l-md flex flex-col"
      style={{ right: `${editorWidth}px`, width: "350px" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e32]">
        <button
          onClick={openConfig}
          title="Go Back"
          className="text-gray-300 hover:text-white transition flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
        <h2 className="text-lg font-semibold">Resource Settings</h2>
        <button
          onClick={closeSettingsorConfig}
          title="Close Resource Settings"
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
          Resource ID: {settingOpenResourceId}
        </p>
        {formFields.length === 0 ? (
          <p className="text-sm text-gray-400">
            No settings available for this resource type.
          </p>
        ) : (
          formFields.map((field) => (
            <RenderForm
              key={field.key}
              field={field}
              currentNode={
                resourceData[field.key as keyof ResourceBlock["data"]]
              }
              handleChange={(value: unknown) =>
                handleChange(field.key as keyof ResourceBlock["data"], value)
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

export default ResourceSettingsPanel;
