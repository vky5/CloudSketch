"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Canvas from "@/components/Canvas";
import TerraformEditor from "@/components/Editor";
import NodeSettingsPanel from "@/components/NodeSettingsPanel";
import { useUIPanelStore } from "@/store/useUIPanelStore";
import SideMenuConfig from "@/components/ConfigPanel";

export default function HomePage() {
  const [editorWidth, setEditorWidth] = useState(500);
  const { isEditorOpen, setEditorState, isSettingsOpen, isConfigOpen, openConfig } =
    useUIPanelStore();

  return (
    <div className="w-full h-screen overflow-hidden bg-[#0b0c0e]">
      <Header onGenerateTerraform={() => setEditorState(true)} onToggleConfigPanel={openConfig}/>
      <Sidebar />
      <main className="h-full w-full">
        <Canvas />
      </main>

      {isSettingsOpen && (
        <NodeSettingsPanel editorWidth={isEditorOpen ? editorWidth + 5 : 0} />
      )}

      {isConfigOpen && <SideMenuConfig editorWidth={isEditorOpen ? editorWidth + 5 : 0} />}

      {isEditorOpen && (
        <TerraformEditor
          onClose={() => setEditorState(false)}
          editorWidth={editorWidth}
          setEditorWidth={setEditorWidth}
        />
      )}
    </div>
  );
}
