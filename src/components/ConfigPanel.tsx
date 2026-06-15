"use client";

import React, { useMemo, useCallback } from "react";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { Shield, KeyRound, X } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import ResourceFolder from "./ResourceFolder";
import ResourceItem from "./ResourceItem";
import openSettings from "@/utils/openSettings";
import { ResourceType, ResourceDataMap } from "@/store/useTerraformResourceStore";

interface TerraformSideMenuProps {
  editorWidth: number;
}

export default function TerraformSideMenu({ editorWidth }: TerraformSideMenuProps) {
  const { resources, addResource, deleteResource } = useTerraformResourceStore();

  const securityGroups = useMemo(
    () => resources.filter((r) => r.type === "securitygroup"),
    [resources]
  );
  const keyPairs = useMemo(() => resources.filter((r) => r.type === "keypair"), [resources]);
  const IAM = useMemo(() => resources.filter((r) => r.type === "iam"), [resources]);

  const handleNewResource = useCallback(
    (labelType: ResourceType) => {
      const newLabel = `${labelType}-${Date.now()}`;
      const id = addResource(labelType, { Name: newLabel });
      openSettings(id, "resource");
    },
    [addResource]
  );

  const renderResourceList = useCallback(
    <T extends ResourceType>(items: typeof resources, type: T, w: string) =>
      items.map(({ id, data }, i) => {
        const dataRecord = data as ResourceDataMap[T];
        return (
          <div key={id}>
            <ResourceItem
              name={dataRecord.Name ?? id}
              onDelete={() => deleteResource(id)}
              onClick={() => openSettings(id, "resource")}
            />
            {i !== items.length - 1 && (
              <hr className={`my-1 border-t border-[#3f3f46] w-[${w}] mx-auto`} />
            )}
          </div>
        );
      }),
    [deleteResource]
  );

  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] bg-[#232329] text-white shadow-lg z-[1001] rounded-l-md flex flex-col"
      style={{ right: `${editorWidth}px`, width: "350px" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e32]">
        <h2 className="text-md font-semibold tracking-tight">Terraform Config</h2>
        <button
          onClick={closeSettingsorConfig}
          title="Close"
          className="text-red-400 hover:text-red-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 scrollbar-hide space-y-6">
        {/* Security Groups */}
        <ResourceFolder
          title="Security Groups"
          icon={<Shield className="w-4 h-4 text-blue-400" />}
          onAdd={() => handleNewResource("securitygroup")}
        >
          {renderResourceList(securityGroups, "securitygroup", "90%")}
        </ResourceFolder>

        {/* Key Pairs */}
        <ResourceFolder
          title="Key Pairs"
          icon={<KeyRound className="w-4 h-4 text-yellow-400" />}
          onAdd={() => handleNewResource("keypair")}
        >
          {renderResourceList(keyPairs, "keypair", "80%")}
        </ResourceFolder>

        {/* IAM */}
        <ResourceFolder
          title="IAM"
          icon={<KeyRound className="w-4 h-4 text-yellow-400" />}
          onAdd={() => handleNewResource("iam")}
        >
          {renderResourceList(IAM, "iam", "80%")}
        </ResourceFolder>
      </div>
    </div>
  );
}
