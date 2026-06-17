"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { memo, useState, useEffect, useRef } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";
import { FaTrash } from "react-icons/fa6";

function TextNode({ id, data, selected, width }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const [text, setText] = useState<string>(
    typeof data.label === "string" ? data.label : "Click to edit text"
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const w = width || 100;

  const updateNodeData = useDiagramStore((state) => state.updateNodeData);
  const updateNodeDimensions = useDiagramStore(
    (state) => state.updateNodeDimensions
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateNodeData(id, { Name: newText });
  };

  // Auto-resize height only
  useEffect(() => {
    const textarea = textareaRef.current;
    const container = containerRef.current;

    if (textarea && container) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight + 4;
      textarea.style.height = `${scrollHeight}px`;
      container.style.width = `${w}px`;
      container.style.height = `${scrollHeight}px`;

      // Sync height, keep width same
      updateNodeDimensions(id, w, scrollHeight);
    }
  }, [text, w, id, updateNodeDimensions]);

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
          updateNodeDimensions(id, width, height);
        }}
      />

      {(hovered || selected) && (
        <div className="absolute -top-6 right-0 flex items-center gap-1 z-50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              useDiagramStore
                .getState()
                .triggerDeleteConfirmation(id, "Are you sure you want to delete this text block?");
            }}
            className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
            title="Delete Text"
          >
            <FaTrash className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        className="bg-transparent text-white text-sm resize-none outline-none p-1 absolute top-0 left-0"
        style={{
          width: `${w}px`, // Keep width constant
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
