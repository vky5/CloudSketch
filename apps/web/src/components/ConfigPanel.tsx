"use client";

import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";

export default function SideMenuConfig({
  editorWidth,
}: {
  editorWidth: number;
}) {
  const { securityGroups, keyPairs } = useTerraformResourceStore();

  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] bg-[#f9f9fa] text-black shadow-lg z-[1001] rounded-l-md flex flex-col"
      style={{ right: `${editorWidth}px`, width: "350px" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
        <h2 className="text-lg font-semibold">Terraform Config</h2>
      </div>
      <div className="p-4 overflow-y-auto flex-1">
        <h3 className="text-md font-semibold mb-2">Security Groups</h3>
        <ul className="list-disc ml-4 text-sm mb-4">
          {securityGroups.map((sg, i) => (
            <li key={i}>
              <pre className="bg-white p-2 rounded border">{sg}</pre>
            </li>
          ))}
        </ul>

        <h3 className="text-md font-semibold mb-2">Key Pairs</h3>
        <ul className="list-disc ml-4 text-sm">
          {keyPairs.map((kp, i) => (
            <li key={i}>
              <pre className="bg-white p-2 rounded border">{kp}</pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
