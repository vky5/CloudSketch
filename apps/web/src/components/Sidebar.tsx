"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MousePointer2,
  Type,
  Square,
  Diamond,
  ArrowRight,
  Minus,
  Hand,
  Eraser,
  Palette,
  ChevronRight,
  Server,
} from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";

const primaryTools = [ // use tool.id everywhere to identify the tool
  { id: "select", name: "Select", icon: MousePointer2, shortcut: "V" },
  { id: "hand", name: "Hand", icon: Hand, shortcut: "H" },
  { id: "text", name: "Text", icon: Type, shortcut: "T" },
  { id: "rectangle", name: "Rectangle", icon: Square, shortcut: "R" },
  { id: "rhombus", name: "Rhombus", icon: Diamond, shortcut: "D" },
  { id: "arrow", name: "Arrow", icon: ArrowRight, shortcut: "A" },
  { id: "line", name: "Line", icon: Minus, shortcut: "L" },
  { id: "eraser", name: "Eraser", icon: Eraser, shortcut: "E" },
  { id: "color", name: "Color", icon: Palette, shortcut: "C" },
];

export default function Sidebar() {
  const { selectedTool, setSelectedTool } = useDiagramStore();
  const [showAWSComponents, setShowAWSComponents] = useState(false);

  return (
    <>
      <Card className="fixed left-4 top-1/2 -translate-y-1/2 z-50 p-2 shadow-lg border-none rounded-xl bg-[#232329] border border-white border-2xl">
        <div className="flex flex-col gap-1">
          {primaryTools.map((tool, index) => (
            <div key={tool.id}>
              <Button
                size="sm"
                className={`w-10 h-10 p-0 relative group rounded-md bg-transparent ${
                  selectedTool === tool.id
                    ? "bg-[#3B82F6] hover:bg-[#3B82F6]"
                    : "hover:bg-[#1E293B]"
                } text-white transition-colors hover:cursor-pointer`}
                onClick={() => setSelectedTool(tool.id)}
                title={`${tool.name} (${tool.shortcut})`}
              >
                <tool.icon className="w-4 h-4" />
                <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {tool.name} ({tool.shortcut})
                </div>
              </Button>
              {index === 1 && <Separator className="my-2" />}
              {index === 8 && <Separator className="my-2" />}
            </div>
          ))}

          {/* AWS Component Toggle */}
          <Button
            size="sm"
            className={`w-10 h-10 p-0 relative group rounded-md bg-transparent ${
              showAWSComponents ? "bg-[#3B82F6] hover:bg-[#3B82F6]" : "hover:bg-[#1E293B]"
            } text-white transition-colors hover:cursor-pointer`}
            onClick={() => setShowAWSComponents(!showAWSComponents)}
            title="AWS Components"
          >
            <Server className="w-4 h-4" />
            <ChevronRight
              className={`w-3 h-3 absolute -right-1 -top-1 transition-transform ${
                showAWSComponents ? "rotate-90" : ""
              }`}
            />
            <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              AWS Components
            </div>
          </Button>
        </div>
      </Card>
    </>
  );
}
