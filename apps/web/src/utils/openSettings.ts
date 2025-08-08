import { useDiagramStore } from "@/store/useDiagramStore";
import { useUIPanelStore } from "@/store/useUIPanelStore";

export default function openSettings(id: string) {
  useDiagramStore.getState().openSettings(id);
  useUIPanelStore.getState().openSettings();
}
