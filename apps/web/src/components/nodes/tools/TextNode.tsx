"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { memo, useState, useEffect, useRef } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";

function TextNode({ data, selected, width = 100 }: NodeProps) {
  const [text, setText] = useState<string>(
    typeof data.label === "string" ? data.label : "Click to edit text"
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateNodeData = useDiagramStore((state) => state.updateNodeData);
  const updateNodeDimensions = useDiagramStore(
    (state) => state.updateNodeDimensions
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateNodeData(data.id as string, { Name: newText });
  };

  // Auto-resize height only
  useEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;

    if (textarea && container) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight + 4;
      textarea.style.height = `${scrollHeight}px`;
      container.style.width = `${width}px`;
      container.style.height = `${scrollHeight}px`;

      // Sync height, keep width same
      updateNodeDimensions(data.id as string, width, scrollHeight);
    }
  }, [text, width, data.id, updateNodeDimensions]);

  // Restore autofocus
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (data.label !== text) {
      setText(typeof data.label === "string" ? data.label : "");
    }
  }, [data.label, text]);

  return (
    <div
      ref={containerRef}
      className="relative bg-transparent"
      style={{ minWidth: 80, minHeight: 40 }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        lineClassName="border-emerald-500"
        handleClassName="bg-emerald-500 border border-white"
        onResizeEnd={(e, { width, height }) => {
          updateNodeDimensions(data.id as string, width, height);
        }}
      />

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="bg-transparent text-white text-sm resize-none outline-none p-1 absolute top-0 left-0"
        style={{
          width: `${width}px`, // Keep width constant
          fontFamily: "inherit",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
        }}
        spellCheck={false}
      />
    </div>
  );
}

export default memo(TextNode);
