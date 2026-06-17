import { Handle, Position } from "@xyflow/react";
import { Database } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear, FaTrash } from "react-icons/fa6";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useState, useEffect } from "react";
import { rdsData, rdsFormSchema } from "@/config/awsNodes/rds.config";
import { AnyNodeProps } from "@/utils/types/resource";

export default function RDSNode({ data, selected, id }: AnyNodeProps<rdsData>) {
  const [hovered, setHovered] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const instanceClass = data.InstanceClass?.toString() || "db.t3.micro";

  useEffect(() => {
    const requiredFields = rdsFormSchema.filter((f) => f.required);
    const missing = requiredFields.filter((field) => {
      const key = field.key as keyof rdsData;
      const value = data[key];
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      );
    });
    setIsValid(missing.length === 0);
  }, [data]);

  return (
    <div
      className={`w-44 relative rounded-md bg-[#0b0f19] text-white border transition-all duration-150 border-l-4 border-l-blue-500
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
            title="Edit RDS Settings"
          >
            <FaGear className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              useDiagramStore
                .getState()
                .triggerDeleteConfirmation(id, "Are you sure you want to delete this RDS instance?");
            }}
            className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
            title="Delete RDS"
          >
            <FaTrash className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      <div className="p-2.5 flex items-center gap-2">
        <Database className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-semibold text-[12px] text-slate-100 truncate" title={data.Name || "RDS Database"}>
            {data.Name || "RDS Database"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{instanceClass}</span>
        </div>
      </div>
    </div>
  );
}
