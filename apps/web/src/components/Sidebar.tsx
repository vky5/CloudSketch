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
import { awsComponents } from "@/data/aws.data";

const primaryTools = [
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

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
              showAWSComponents
                ? "bg-[#3B82F6] hover:bg-[#3B82F6]"
                : "hover:bg-[#1E293B]"
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

      {/* AWS Panel: Sidebar right-aligned panel */}
      {showAWSComponents && (
        <Card
          className="fixed left-22 top-1/2 -translate-y-1/2 z-40 w-60 max-h-[70vh] overflow-y-auto bg-[#232329] border border-[#374151] rounded-xl py-3 px-2"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="text-white font-semibold text-md mb-2 flex justify-between items-center">
            <span>AWS Components</span>
            <span className="text-xs bg-[#1F2937] px-2 py-1 rounded-lg text-gray-300">
              {awsComponents.reduce((sum, sec) => sum + sec.items.length, 0)}
            </span>
          </div>
          <div className="space-y-6">
            {awsComponents.map((section) => (
              <div key={section.title} className="">
                <div
                  onClick={() => toggleSection(section.title)}
                  className="flex justify-between items-center text-sm text-gray-200 font-medium cursor-pointer px-2 py-1 hover:bg-[#1F2937] rounded-md"
                >
                  <span>{section.title}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-[#1F2937] px-1.5 py-0.5 rounded-sm text-gray-400">
                      {section.items.length}
                    </span>
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${
                        openSections[section.title] ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {openSections[section.title] && (
                  <div className="mt-2 space-y-3">
                    {section.items.map((item) => (
                      <div
                        key={item.name}
                        className="bg-[#1F2937] hover:bg-[#374151] rounded-md px-3 py-2 text-sm flex items-start gap-2 cursor-pointer"
                      >
                        <item.icon className="w-4 h-4 mt-0.5 text-blue-400" />
                        <div>
                          <div className="text-gray-100 font-medium">
                            {item.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
