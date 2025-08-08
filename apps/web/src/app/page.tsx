"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Canvas from "@/components/Canvas";
import TerraformEditor from "@/components/Editor";
import { useDiagramStore } from "@/store/useDiagramStore";
import NodeSettingsPanel from "@/components/NodeSettingsPanel";

export default function HomePage() {
  const [showEditor, setShowEditor] = useState(false);
   const [editorWidth, setEditorWidth] = useState(500); 
  const { settingOpenNodeId } = useDiagramStore();

  return (
    <div className="w-full h-screen overflow-hidden bg-[#0b0c0e]">
      <Header onGenerateTerraform={() => setShowEditor(true)} />
      <Sidebar />
      <main className="h-full w-full">
        <Canvas />
      </main>

      {settingOpenNodeId && <NodeSettingsPanel editorWidth={showEditor ? editorWidth +5: 0} />}
      {showEditor && <TerraformEditor onClose={() => setShowEditor(false)}    editorWidth={editorWidth}
          setEditorWidth={setEditorWidth} />}
    </div>
  );
}
