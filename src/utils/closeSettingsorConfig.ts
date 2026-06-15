import { useDiagramStore } from "@/store/useDiagramStore";
import { useUIPanelStore } from "@/store/useUIPanelStore";

export default function closeSettingsorConfig() {
  useDiagramStore.getState().closeSettings();
  useUIPanelStore.getState().closePanels();
}
