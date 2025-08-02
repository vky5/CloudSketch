"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Canvas from "@/components/Canvas";
import TerraformEditor from "@/components/Editor";

export default function HomePage() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden bg-[#0b0c0e]">
      <Header onGenerateTerraform={() => setShowEditor(true)} />
      <Sidebar />
      <main className="h-full w-full">
        <Canvas />
      </main>

      {showEditor && <TerraformEditor onClose={() => setShowEditor(false)} />}
    </div>
  );
}
