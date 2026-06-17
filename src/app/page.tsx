"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Canvas from "@/components/Canvas";
import TerraformEditor from "@/components/Editor";
import NodeSettingsPanel from "@/components/SettingsPannel/NodeSettingsPanel";
import { useUIPanelStore } from "@/store/useUIPanelStore";
import SideMenuConfig from "@/components/ConfigPanel";
import ResourceSettingsPanel from "@/components/SettingsPannel/ResourceSettingsPanel";
import { useProjectStore } from "@/store/useProjectStore";
import { useEffect } from "react";

export default function HomePage() {
  const [editorWidth, setEditorWidth] = useState(500);
  const {
    isEditorOpen,
    setEditorState,
    isSettingsOpen,
    isConfigOpen,
    openConfig,
    settingsVersion,
  } = useUIPanelStore();

  const { init: initProjects } = useProjectStore();

  useEffect(() => {
    initProjects();
  }, [initProjects]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0b0c0e]">
      <Header
        onGenerateTerraform={() => setEditorState(true)}
        onToggleConfigPanel={openConfig}
      />
      <div className="relative min-h-0 flex-1">
        <Sidebar />
        <main className="h-full w-full">
          <Canvas />
        </main>

      {isSettingsOpen &&
        (settingsVersion === "node" ? (
          <NodeSettingsPanel editorWidth={isEditorOpen ? editorWidth + 5 : 0} />
        ) : (
          <ResourceSettingsPanel
            editorWidth={isEditorOpen ? editorWidth + 5 : 0}
          />
        ))}

      {isConfigOpen && (
        <SideMenuConfig editorWidth={isEditorOpen ? editorWidth + 5 : 0} />
      )}

      {isEditorOpen && (
        <TerraformEditor
          onClose={() => setEditorState(false)}
          editorWidth={editorWidth}
          setEditorWidth={setEditorWidth}
        />
      )}
      </div>
    </div>
  );
}
