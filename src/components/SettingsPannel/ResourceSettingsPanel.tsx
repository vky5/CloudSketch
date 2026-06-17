"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { ArrowLeft } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import { formSchemaRegistry } from "@/config/formSchemaRegistry";
import { useUIPanelStore } from "@/store/useUIPanelStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import RenderForm from "./RenderForm";
import { ResourceBlock } from "@/utils/types/resource";
import SettingsPanelShell from "./SettingsPanelShell";

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

  const resourceName =
    typeof resource.data.Name === "string" ? resource.data.Name : undefined;

  return (
    <SettingsPanelShell
      editorWidth={editorWidth}
      title="Resource settings"
      subtitle={resourceName || resourceType || undefined}
      meta={settingOpenResourceId}
      onClose={closeSettingsorConfig}
      headerLeft={
        <button
          onClick={openConfig}
          title="Go back"
          className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to resources
        </button>
      }
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
          No settings available for this resource type.
        </p>
      ) : (
        <div className="space-y-5">
          {formFields.map((field) => (
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
          ))}
        </div>
      )}
    </SettingsPanelShell>
  );
}

export default ResourceSettingsPanel;