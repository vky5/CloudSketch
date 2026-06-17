import { Handle, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear, FaTrash } from "react-icons/fa6";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useEffect, useState } from "react";
import { ec2Data, ec2FormSchema } from "@/config/awsNodes/ec2.config";
import { AnyNodeProps } from "@/utils/types/resource";

export default function EC2Node({ data, selected, id }: AnyNodeProps<ec2Data>) {
  const [hovered, setHovered] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const instanceType = data.InstanceType?.toString() || "t3.micro";

  useEffect(() => {
    const checkNode = () => {
      const requiredFields = ec2FormSchema.filter((f) => f.required);
      const missing = requiredFields.filter((field) => {
        const key = field.key as keyof ec2Data; 
        const value = data[key];
        return value === undefined || value === null || value === "";
      });
      setIsValid(missing.length === 0);
    };
    checkNode();
  }, [data]);

  return (
    <div
      className={`w-44 relative rounded-md bg-[#0b0f19] text-white border transition-all duration-150 border-l-4 border-l-amber-500
        ${
          selected
            ? "border-indigo-500 shadow-md"
            : isValid
            ? "border-slate-800 hover:border-slate-700"
            : "border-red-500"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-700 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-700 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Left} className="!bg-slate-700 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} className="!bg-slate-700 !w-1.5 !h-1.5" />

      {(hovered || selected) && (
        <div className="absolute -top-2.5 right-1.5 flex items-center gap-1 z-50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openSettings(id, "node");
            }}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            title="Edit EC2 Settings"
          >
            <FaGear className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Are you sure you want to delete this resource?")) {
                useDiagramStore.getState().deleteNode(id);
              }
            }}
            className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
            title="Delete EC2"
          >
            <FaTrash className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      <div className="p-2.5 flex items-center gap-2">
        <Server className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-semibold text-[12px] text-slate-100 truncate" title={data.Name || "EC2 Instance"}>
            {data.Name || "EC2 Instance"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{instanceType}</span>
        </div>
      </div>
    </div>
  );
}
