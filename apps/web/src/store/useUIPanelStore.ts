// stores/configPanelStore.ts
import { create } from "zustand";

type ConfigPanelStore = {
  isConfigOpen: boolean;
  isSettingsOpen: boolean;
  isEditorOpen: boolean;

  setEditorState: (newState: boolean) => void;

  openConfig: () => void;
  openSettings: () => void;
  closePanels: () => void;
};

export const useUIPanelStore = create<ConfigPanelStore>((set) => ({
  isEditorOpen: false,
  isConfigOpen: false,
  isSettingsOpen: false,

  setEditorState: (newState) =>
    set(() => ({
      isEditorOpen: newState,
    })),

  openConfig: () =>
    set(() => ({
      isConfigOpen: true,
      isSettingsOpen: false,
    })),

  openSettings: () =>
    set(() => ({
      isConfigOpen: false,
      isSettingsOpen: true,
    })),

  closePanels: () =>
    set(() => ({
      isConfigOpen: false,
      isSettingsOpen: false,
    })),
}));
