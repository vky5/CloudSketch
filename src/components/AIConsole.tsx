"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trash2, Play, CheckCircle2, Loader2, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { callAI } from "@/lib/aiClient";
import { useDiagramStore } from "@/store/useDiagramStore";
import { getDefaultDataForNode } from "@/components/Canvas/nodeTypes";
import { handleConnection } from "@/lib/graphProtocol/ugcp";
import { syncNodeWithBackend } from "@/utils/terraformSync";

const SUGGESTIONS = [
  {
    label: "Web App with RDS",
    prompt: "Deploy a production EC2 Web Instance nested inside a Public Subnet inside a VPC, connected to a PostgreSQL RDS database.",
  },
  {
    label: "S3 Attached Compute",
    prompt: "Create a VPC containing a Subnet. Nested inside, place an EC2 instance. Add an EBS Volume and an S3 bucket, both connected to the EC2 instance.",
  },
  {
    label: "Lambda Data Pipeline",
    prompt: "Set up a serverless Lambda function connected to an RDS Database for processing data streams.",
  },
];

export default function AIConsole() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [summary, setSummary] = useState<{ nodes: string[]; edges: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    
    // Custom animated loader sequence
    const statusSteps = [
      "Analyzing architectural request...",
      "Resolving subnet and network containment topology...",
      "Generating relative layout coordinates...",
      "Synchronizing resources with Terraform backend...",
      "Building security groups and volume attachment handshakes...",
    ];

    let currentStep = 0;
    setStatusText(statusSteps[0]);
    const loaderInterval = setInterval(() => {
      if (currentStep < statusSteps.length - 1) {
        currentStep++;
        setStatusText(statusSteps[currentStep]);
      }
    }, 1200);

    try {
      const res = await callAI(prompt);
      clearInterval(loaderInterval);
      
      if (res?.graph) {
        const { nodes: aiNodes = [], edges: aiEdges = [] } = res.graph;
        const { addNode, addEdge } = useDiagramStore.getState();

        const nodeNames: string[] = [];
        const edgeNames: string[] = [];

        // 1. Gather all nodes and calculate default dimensions & absolute positions
        const idMap: Record<string, string> = {};
        const processedNodes = aiNodes.map((n: any, idx: number) => {
          const oldId = n.id || `node-${idx}`;
          const id = crypto.randomUUID();
          idMap[oldId] = id;
          const type = (n.type || "rectangle").toLowerCase();
          
          let width = 120;
          let height = 80;
          if (type === "vpc") {
            width = 600;
            height = 400;
          } else if (type === "subnet") {
            width = 260;
            height = 180;
          } else if (type === "s3" || type === "ebs") {
            width = 100;
            height = 80;
          }

          const absX = typeof n.x === "number" ? n.x : 100 + idx * 180;
          const absY = typeof n.y === "number" ? n.y : 100 + idx * 120;

          let data: any = {};
          try {
            data = getDefaultDataForNode(type, id);
          } catch (e) {
            data = { id };
          }

          if (n.label && data) {
            const lbl = n.label.toString();
            if ("Name" in data) data.Name = lbl;
            else if ("TagName" in data) data.TagName = lbl;
            
            if (type === "ec2" && lbl.match(/(t\d\.[a-z0-9]+)/i)) {
              data.InstanceType = lbl.match(/(t\d\.[a-z0-9]+)/i)[1];
            }
          }

          nodeNames.push(`${type.toUpperCase()}: "${data.Name || id.substring(0, 6)}"`);

          return {
            id,
            type,
            data,
            width,
            height,
            absX,
            absY,
            parentId: undefined as string | undefined,
          };
        });

        // 2. Resolve VPC -> Subnet containment
        processedNodes.forEach((node: any) => {
          if (node.type === "subnet") {
            const containingVpc = processedNodes.find((other: any) => {
              if (other.type !== "vpc") return false;
              const nLeft = node.absX;
              const nRight = node.absX + node.width;
              const nTop = node.absY;
              const nBottom = node.absY + node.height;

              const cLeft = other.absX;
              const cRight = other.absX + other.width;
              const cTop = other.absY;
              const cBottom = other.absY + other.height;

              return (
                nLeft >= cLeft &&
                nRight <= cRight &&
                nTop >= cTop &&
                nBottom <= cBottom
              );
            });

            if (containingVpc) {
              node.parentId = containingVpc.id;
              node.data.parentVpcId = containingVpc.id;
            }
          }
        });

        // 3. Resolve Subnet -> Instance containment
        processedNodes.forEach((node: any) => {
          if (node.type === "ec2" || node.type === "rds") {
            const containingSubnet = processedNodes.find((other: any) => {
              if (other.type !== "subnet") return false;
              const nLeft = node.absX;
              const nRight = node.absX + node.width;
              const nTop = node.absY;
              const nBottom = node.absY + node.height;

              const cLeft = other.absX;
              const cRight = other.absX + other.width;
              const cTop = other.absY;
              const cBottom = other.absY + other.height;

              return (
                nLeft >= cLeft &&
                nRight <= cRight &&
                nTop >= cTop &&
                nBottom <= cBottom
              );
            });

            if (containingSubnet) {
              node.parentId = containingSubnet.id;
              node.data.SubnetID = containingSubnet.id;
            }
          }
        });

        // 4. Map final relative coordinates & sync each node
        const finalNodes = processedNodes.map((node: any) => {
          let x = node.absX;
          let y = node.absY;

          if (node.parentId) {
            const parent = processedNodes.find((p: any) => p.id === node.parentId);
            if (parent) {
              x = node.absX - parent.absX;
              y = node.absY - parent.absY;
            }
          }

          const nodePayload = {
            id: node.id,
            type: node.type,
            data: node.data,
            width: node.width,
            height: node.height,
            position: { x, y },
            parentId: node.parentId,
            extent: node.parentId ? ("parent" as const) : undefined,
          };

          syncNodeWithBackend({ id: node.id, type: node.type, data: node.data }).catch(() => {});
          addNode(nodePayload as any);
          return nodePayload;
        });

        // 5. Connect and register handshakes
        for (const e of aiEdges) {
          try {
            const edgeId = crypto.randomUUID();
            const sourceId = idMap[e.from] || e.from;
            const targetId = idMap[e.to] || e.to;
            const edgeObj = { id: edgeId, source: sourceId, target: targetId, label: e.label };

            const sourceNode = finalNodes.find((x: any) => x.id === edgeObj.source);
            const targetNode = finalNodes.find((x: any) => x.id === edgeObj.target);
            if (!sourceNode || !targetNode) {
              console.warn("AI edge references missing node, skipping", edgeObj);
              continue;
            }

            const ugcpRes = handleConnection(edgeObj as any, sourceNode as any, targetNode as any);
            if (!ugcpRes.success) {
              console.warn("UGCP rejected AI connection", ugcpRes.error);
              continue;
            }

            addEdge(edgeObj as any);
            edgeNames.push(`Connected ${sourceNode.type.toUpperCase()} ➔ ${targetNode.type.toUpperCase()}`);
          } catch (err) {
            console.error("Failed to add AI edge", err);
          }
        }

        setSummary({ nodes: nodeNames, edges: edgeNames });
      }
    } catch (err: any) {
      clearInterval(loaderInterval);
      setError(err?.message || "AI failed to process architecture. Check endpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-gray-200">
      {/* Examples Header */}
      {!loading && !summary && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold tracking-wider text-gray-400 uppercase flex items-center gap-1">
            <Info className="w-3 h-3 text-emerald-400" />
            Quick Templates
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setPrompt(s.prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#1e2025] hover:bg-[#323642] border border-[#2e313a] text-gray-300 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your target infrastructure (e.g. Deploy an EC2 inside a private subnet...)"
          className="w-full h-28 p-3 rounded-lg bg-[#0e0e11]/90 text-sm text-white border border-[#2b2d35]
            placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none shadow-inner"
          disabled={loading}
        />
        <div className="absolute bottom-2.5 right-2.5 text-[10px] text-gray-500 font-mono">
          {prompt.length} chars
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 gap-2 h-9 text-xs rounded-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Generate Architecture
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setPrompt("");
            setSummary(null);
            setError(null);
          }}
          disabled={loading || !prompt}
          className="border-[#2b2d35] bg-transparent hover:bg-[#1a1b21] hover:text-white rounded-md h-9 w-9"
          title="Clear"
        >
          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
        </Button>
      </div>

      {/* Loading State Details */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-[#111218]/90 border border-emerald-950/40 flex items-center gap-3"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">AI Copilot</span>
              <span className="text-xs text-gray-300 font-medium leading-tight">{statusText}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-0.5">Generation Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Summary Box */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-2 p-3.5 rounded-lg bg-[#14161d] border border-[#2b2d35]/65 shadow-lg"
          >
            <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#23252e] pb-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Generation Success
            </div>
            
            {/* Created Nodes list */}
            <div className="flex flex-col gap-1">
              <div className="text-[10px] text-gray-400 font-bold uppercase">Resources Instantiated</div>
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                {summary.nodes.map((name, i) => (
                  <div key={i} className="text-xs text-gray-300 flex items-center gap-1 font-mono">
                    <span className="text-emerald-400 font-bold">•</span> {name}
                  </div>
                ))}
              </div>
            </div>

            {/* Created Connections list */}
            {summary.edges.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase">Network Handshakes</div>
                <div className="flex flex-col gap-1 max-h-20 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
                  {summary.edges.map((name, i) => (
                    <div key={i} className="text-xs text-gray-300 flex items-center gap-1 font-mono">
                      <span className="text-blue-400 font-bold">➔</span> {name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
