import { useDiagramStore } from "@/store/useDiagramStore";
import { useUIPanelStore } from "@/store/useUIPanelStore";

export function collapseSideMenusOnCanvasInteract() {
  useDiagramStore.getState().closeSettings();
  useUIPanelStore.getState().collapseAllSideMenus();
}