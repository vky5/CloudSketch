import { create } from "zustand";

type ConfigPanelStore = {
  isConfigOpen: boolean;
  isSettingsOpen: boolean;
  isEditorOpen: boolean;
  isAwsComponentsOpen: boolean;
  isAiConsoleOpen: boolean;
  awsOpenSections: Record<string, boolean>;

  settingsVersion: "resource" | "node";

  setEditorState: (newState: boolean) => void;

  openConfig: () => void;
  openSettings: (type: "resource" | "node") => void;
  closePanels: () => void;
  toggleAwsComponents: () => void;
  toggleAiConsole: () => void;
  toggleAwsSection: (title: string) => void;
  collapseAllSideMenus: () => void;
};

export const useUIPanelStore = create<ConfigPanelStore>((set) => ({
  isEditorOpen: false,
  isConfigOpen: false,
  isSettingsOpen: false,
  isAwsComponentsOpen: false,
  isAiConsoleOpen: false,
  awsOpenSections: {},

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

  toggleAwsComponents: () =>
    set((state) => ({
      isAwsComponentsOpen: !state.isAwsComponentsOpen,
    })),

  toggleAiConsole: () =>
    set((state) => ({
      isAiConsoleOpen: !state.isAiConsoleOpen,
    })),

  toggleAwsSection: (title) =>
    set((state) => ({
      awsOpenSections: {
        ...state.awsOpenSections,
        [title]: !state.awsOpenSections[title],
      },
    })),

  collapseAllSideMenus: () =>
    set(() => ({
      isConfigOpen: false,
      isSettingsOpen: false,
      isEditorOpen: false,
      isAwsComponentsOpen: false,
      isAiConsoleOpen: false,
      awsOpenSections: {},
    })),
}));