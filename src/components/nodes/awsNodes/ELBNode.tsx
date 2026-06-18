import MultiDirectionHandles from "@/components/nodes/shared/MultiDirectionHandles";
import { Repeat } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear, FaTrash } from "react-icons/fa6";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useEffect, useState } from "react";
import { elbData, elbFormSchema } from "@/config/awsNodes/elb.config";
import { AnyNodeProps } from "@/utils/types/resource";
import { useShowNodeActions } from "@/utils/useShowNodeActions";

export default function ELBNode({ data, selected, id }: AnyNodeProps<elbData>) {
  const [hovered, setHovered] = useState(false);
  const showActions = useShowNodeActions(selected, hovered);
  const [isValid, setIsValid] = useState(true);

  const scheme = data.Scheme?.toString() || "internet-facing";
  const listenerPort = data.ListenerPort?.toString() || "80";

  useEffect(() => {
    const requiredFields = elbFormSchema.filter((f) => f.required);
    const missing = requiredFields.filter((field) => {
      const key = field.key as keyof elbData;
      const value = data[key];
      return value === undefined || value === null || value === "";
    });
    setIsValid(missing.length === 0);
  }, [data]);

  return (
    <div
      className={`w-44 relative rounded-md bg-[#0b0f19] text-white border transition-all duration-150 border-l-4 border-l-sky-500
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
      <MultiDirectionHandles />

      {showActions && (
        <div className="absolute -top-2.5 right-1.5 flex items-center gap-1 z-50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openSettings(id, "node");
            }}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            title="Edit Load Balancer Settings"
          >
            <FaGear className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              useDiagramStore
                .getState()
                .triggerDeleteConfirmation(
                  id,
                  "Are you sure you want to delete this load balancer?"
                );
            }}
            className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
            title="Delete Load Balancer"
          >
            <FaTrash className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      <div className="p-2.5 flex items-center gap-2">
        <Repeat className="w-4 h-4 text-sky-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 leading-tight">
          <span
            className="font-semibold text-[12px] text-slate-100 truncate"
            title={data.Name || "Application Load Balancer"}
          >
            {data.Name || "Application Load Balancer"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            ALB · {scheme} · :{listenerPort}
          </span>
        </div>
      </div>
    </div>
  );
}