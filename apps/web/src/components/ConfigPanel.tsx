// components/TerraformSideMenu.tsx
"use client";

import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { Shield, KeyRound, X } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import ResourceFolder from "./ResourceFolder";
import ResourceItem from "./ResourceItem";

export default function TerraformSideMenu({
  editorWidth,
}: {
  editorWidth: number;
}) {
  const {
    securityGroups,
    keyPairs,
    deleteKeyPair,
    deleteSecurityGroup,
    addSecurityGroup,
    addKeyPair,
  } = useTerraformResourceStore();

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
          onAdd={() => addSecurityGroup("sg-" + Date.now())}
        >
          {securityGroups.map((sg, i) => (
            <div key={sg}>
              <ResourceItem
                name={sg}
                onDelete={() => deleteSecurityGroup(sg)}
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
          onAdd={() => addKeyPair("key-" + Date.now())}
        >
          {keyPairs.map((kp, i) => (
            <div key={kp}>
              <ResourceItem name={kp} onDelete={() => deleteKeyPair(kp)} />
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
