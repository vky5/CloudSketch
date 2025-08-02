"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { X } from "lucide-react";

export default function TerraformEditor({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState(
    `# Terraform Code Output\n\nresource "aws_instance" "example" {\n  ami           = "ami-12345678"\n  instance_type = "t2.micro"\n}`
  );
  const [editorWidth, setEditorWidth] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newWidth = window.innerWidth - e.clientX;
    const clampedWidth = Math.min(Math.max(newWidth, 300), 800);
    setEditorWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleEditorMount = (editor: any, monaco: any) => {
    monaco.editor.defineTheme("cloudsketch-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#232329",
        "editorLineNumber.foreground": "#888888",
        "editorCursor.foreground": "#3B82F6",
        "editorIndentGuide.background": "#2c2c2c",
        "editor.selectionBackground": "#3B82F622",
        "editor.lineHighlightBackground": "#2a2c31",
        "editorGutter.background": "#1e1f22",
      },
    });
    monaco.editor.setTheme("cloudsketch-dark");
  };

  return (
    <div className="fixed top-17 right-0 h-[calc(100vh-48px)] z-[1000] flex flex-row-reverse">
      {/* Editor Panel */}
      <div
        ref={editorRef}
        style={{ width: editorWidth }}
        className="h-full bg-[#0b0c0e] shadow-lg relative"
      >
        <Editor
          value={code}
          onChange={(val) => setCode(val || "")}
          language="hcl"
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "Fira Code, monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Custom Draggable Divider */}
      <div
        className={`w-[5px] h-full ${
          isDragging ? "bg-blue-500" : "bg-[#1f1f23]"
        } relative cursor-col-resize flex flex-col items-center justify-center`}
        onMouseDown={handleMouseDown}
      >
        {/* Resize Lines */}
        <div className="space-y-[4px] bg-[#111] py-2 px-[2px] rounded-lg shadow-md">
          <div className="w-[15px] h-[2px] bg-[#3B82F6] rounded shadow-sm"></div>
          <div className="w-[15px] h-[2px] bg-[#3B82F6] rounded shadow-sm"></div>
          <div className="w-[15px] h-[2px] bg-[#3B82F6] rounded shadow-sm"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close Editor"
          className="absolute top-2 right-[-24px] text-gray-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
