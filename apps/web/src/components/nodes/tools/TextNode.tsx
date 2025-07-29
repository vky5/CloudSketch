"use client";
import { useDiagramStore } from "@/store/useDiagramStore";
import { memo, useState, useRef, useEffect } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";

function TextNode({ data, selected, width = 200, height = 50 }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState<string>(typeof data.label === 'string' ? data.label : "Double click to edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Update the store with new text
    useDiagramStore.getState().updateNodeData(data.id as string, { label: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      useDiagramStore.getState().updateNodeData(data.id as string, { label: text });
    }
    if (e.key === 'Escape') {
      setText(typeof data.label === 'string' ? data.label : "Double click to edit");
      setIsEditing(false);
    }
  };

  return (
    <div 
      className="relative"
      style={{ 
        width: width || 200, 
        height: height || 50,
        minWidth: 100,
        minHeight: 30 
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={30}
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 border border-white"
        onResizeEnd={(e, { width, height }) => {
          useDiagramStore
            .getState()
            .updateNodeDimensions(data.id as string, width, height);
        }}
      />
      
      <div
        className="w-full h-full flex items-center justify-center bg-transparent text-white cursor-text border-2 border-dashed border-gray-400/50 hover:border-gray-300/70 transition-colors"
        onDoubleClick={handleDoubleClick}
        style={{
          width: width || 200,
          height: height || 50,
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent text-white text-center resize-none outline-none border-none p-2 text-sm"
            style={{
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.2',
            }}
            placeholder="Enter your text..."
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center p-2 text-sm text-center break-words overflow-hidden"
            style={{
              lineHeight: '1.2',
              wordWrap: 'break-word',
              hyphens: 'auto',
            }}
          >
            {text || "Double click to edit"}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TextNode);