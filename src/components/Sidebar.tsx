"use client";

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
  Circle,
  Sparkles,
  X,
} from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useUIPanelStore } from "@/store/useUIPanelStore";
import { awsComponents } from "@/data/aws.data";
import AIConsole from "@/components/AIConsole";

const primaryTools = [
  { id: "select", name: "Select", icon: MousePointer2, shortcut: "V" },
  { id: "hand", name: "Hand", icon: Hand, shortcut: "H" },
  { id: "text", name: "Text", icon: Type, shortcut: "T" },
  { id: "rectangle", name: "Rectangle", icon: Square, shortcut: "R" },
  { id: "rhombus", name: "Rhombus", icon: Diamond, shortcut: "D" },
  { id: "circle", name: "Circle", icon: Circle, shortcut: "O" },
  { id: "arrow", name: "Arrow", icon: ArrowRight, shortcut: "A" },
  { id: "line", name: "Line", icon: Minus, shortcut: "L" },
  { id: "eraser", name: "Eraser", icon: Eraser, shortcut: "E" },
  { id: "color", name: "Color", icon: Palette, shortcut: "C" },
];

export default function Sidebar() {
  const { selectedTool, setSelectedTool } = useDiagramStore();
  const {
    isAwsComponentsOpen,
    isAiConsoleOpen,
    awsOpenSections,
    toggleAwsComponents,
    toggleAiConsole,
    toggleAwsSection,
  } = useUIPanelStore();

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

          <Button
            size="sm"
            className={`w-10 h-10 p-0 relative group rounded-md bg-transparent ${
              isAwsComponentsOpen
                ? "bg-[#3B82F6] hover:bg-[#3B82F6]"
                : "hover:bg-[#1E293B]"
            } text-white transition-colors hover:cursor-pointer`}
            onClick={toggleAwsComponents}
            title="AWS Components"
          >
            <Server className="w-4 h-4" />
            <ChevronRight
              className={`w-3 h-3 absolute -right-1 -top-1 transition-transform ${
                isAwsComponentsOpen ? "rotate-90" : ""
              }`}
            />
            <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              AWS Components
            </div>
          </Button>

          <Button
            size="sm"
            className={`w-10 h-10 p-0 relative group rounded-md bg-transparent ${
              isAiConsoleOpen ? "bg-[#10B981] hover:bg-[#10B981]" : "hover:bg-[#1E293B]"
            } text-white transition-colors hover:cursor-pointer mt-2`}
            onClick={toggleAiConsole}
            title="AI Prompt"
          >
            <Type className="w-4 h-4" />
            <ChevronRight
              className={`w-3 h-3 absolute -right-1 -top-1 transition-transform ${
                isAiConsoleOpen ? "rotate-90" : ""
              }`}
            />
            <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              AI Prompt
            </div>
          </Button>
        </div>
      </Card>

      {isAwsComponentsOpen && (
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
                  onClick={() => toggleAwsSection(section.title)}
                  className="flex justify-between items-center text-sm text-gray-200 font-medium cursor-pointer px-2 py-1 hover:bg-[#1F2937] rounded-md"
                >
                  <span>{section.title}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-[#1F2937] px-1.5 py-0.5 rounded-sm text-gray-400">
                      {section.items.length}
                    </span>
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${
                        awsOpenSections[section.title] ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>

                {awsOpenSections[section.title] && (
                  <div className="mt-2 space-y-3">
                    {section.items.map((item) => (
                      <div
                        key={item.name}
                        className="bg-[#1F2937] hover:bg-[#374151] rounded-md px-3 py-2 text-sm flex items-start gap-2 cursor-pointer"
                        onClick={() => setSelectedTool(item.id)}
                      >
                        <item.icon className="w-4 h-4 mt-0.5 text-blue-400" />
                        <div>
                          <div className="text-gray-100 font-medium">{item.name}</div>
                          <div className="text-gray-400 text-xs">{item.desc}</div>
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

      {isAiConsoleOpen && (
        <Card className="fixed left-22 top-1/2 -translate-y-1/2 z-40 w-85 max-h-[85vh] overflow-y-auto bg-[#0c0d12]/95 backdrop-blur-md border border-[#232530] rounded-2xl py-4 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] scrollbar-none flex flex-col gap-3">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-t-2xl" />

          <div className="flex justify-between items-start border-b border-[#1b1c24] pb-3">
            <div className="flex flex-col gap-0.5">
              <div className="text-white font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/15" />
                <span>AI Architecture Copilot</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal">
                Describe your topology to generate live Terraform models.
              </p>
            </div>
            <button
              onClick={toggleAiConsole}
              className="text-gray-400 hover:text-white p-1 hover:bg-[#1b1c24] rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <AIConsole />
        </Card>
      )}
    </>
  );
}