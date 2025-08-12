"use client";

import { useState } from "react";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { Shield, KeyRound, X } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import ResourceFolder from "./ResourceFolder";
import ResourceItem from "./ResourceItem";
import openSettings from "@/utils/openSettings";
import { ResourceType } from "@/store/useTerraformResourceStore";

export default function TerraformSideMenu({
  editorWidth,
}: {
  editorWidth: number;
}) {
  const { resources, addResource, deleteResource } =
    useTerraformResourceStore();

  // Helper to filter resources by type
  const securityGroups = resources.filter((r) => r.type === "securityGroup");
  const keyPairs = resources.filter((r) => r.type === "keypair");

  // To add new Resources based on the type passed as parameter
  const handleNewResource = (labelType: ResourceType) => {
    const newLabel = `${labelType}-${Date.now()}`;
    const id = addResource(labelType, { Name: newLabel });
    openSettings(id, "resource");
  };

  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] bg-[#232329] text-white shadow-lg z-[1001] rounded-l-md flex flex-col"
      style={{ right: `${editorWidth}px`, width: "350px" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e32]">
        <h2 className="text-md font-semibold tracking-tight">
          Terraform Config
        </h2>
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
          onAdd={() => handleNewResource("securityGroup")}
        >
          {securityGroups.map(({ id, data }, i) => (
            <div key={id}>
              <ResourceItem
                name={data.Name}
                onDelete={() => deleteResource(id)}
                onClick={() => openSettings(id, "resource")}
              />
              {i !== securityGroups.length - 1 && (
                <hr className="my-1 border-t border-[#3f3f46] w-[90%] mx-auto opacity-70" />
              )}
            </div>
          ))}
        </ResourceFolder>

        {/* Key Pairs */}
        <ResourceFolder
          title="Key Pairs"
          icon={<KeyRound className="w-4 h-4 text-yellow-400" />}
          onAdd={() => handleNewResource("keypair")}
        >
          {keyPairs.map(({ id, data }, i) => (
            <div key={id}>
              <ResourceItem
                name={data.Name}
                onDelete={() => deleteResource(id)}
                onClick={() => openSettings(id, "resource")}
              />
              {i !== keyPairs.length - 1 && (
                <hr className="my-1 border-t border-[#3f3f46] w-[80%] mx-auto" />
              )}
            </div>
          ))}
        </ResourceFolder>
      </div>
    </div>
  );
}
