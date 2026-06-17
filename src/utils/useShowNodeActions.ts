import { useDiagramStore } from "@/store/useDiagramStore";

export function useShowNodeActions(
  selected: boolean,
  hovered: boolean
): boolean {
  const isMultiSelect = useDiagramStore(
    (state) => state.selectedNodeIds.length > 1
  );

  if (isMultiSelect) return false;
  return hovered || selected;
}