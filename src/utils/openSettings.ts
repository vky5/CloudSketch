import { useDiagramStore } from "@/store/useDiagramStore";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { useUIPanelStore } from "@/store/useUIPanelStore";

export default function openSettings(id: string, type: "node" | "resource") {
  if (type === "node") {
    useDiagramStore.getState().openSettings(id);
    useUIPanelStore.getState().openSettings("node");
  } else {
    useTerraformResourceStore.getState().openSettings(id);
    useUIPanelStore.getState().openSettings("resource");
  }
}

// this is generic settings handler
