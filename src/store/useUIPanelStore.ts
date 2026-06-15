// stores/configPanelStore.ts
import { create } from "zustand";

type ConfigPanelStore = {
  isConfigOpen: boolean;
  isSettingsOpen: boolean;
  isEditorOpen: boolean;

  settingsVersion: "resource" | "node"; // two types of settigns

  setEditorState: (newState: boolean) => void;

  openConfig: () => void;
  openSettings: (type: "resource" | "node") => void;
  closePanels: () => void;
};

export const useUIPanelStore = create<ConfigPanelStore>((set) => ({
  isEditorOpen: false,
  isConfigOpen: false,
  isSettingsOpen: false,

  settingsVersion: "node",

  setEditorState: (newState) =>
    set(() => ({
      isEditorOpen: newState,
    })),

  openConfig: () =>
    set(() => ({
      isConfigOpen: true,
      isSettingsOpen: false,
    })),

  openSettings: (type) =>
    set(() => ({
      isConfigOpen: false,
      isSettingsOpen: true,
      settingsVersion: type,
    })),

  closePanels: () =>
    set(() => ({
      isConfigOpen: false,
      isSettingsOpen: false,
    })),
}));
