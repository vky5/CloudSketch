import { useDiagramStore } from "@/store/useDiagramStore";
import { useUIPanelStore } from "@/store/useUIPanelStore";

export default function openConfig() {
  useDiagramStore.getState().closeSettings();
  useUIPanelStore.getState().openConfig();
}
