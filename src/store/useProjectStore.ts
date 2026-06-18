import { create } from "zustand";
import type { Edge } from "@xyflow/react";
import { useDiagramStore } from "./useDiagramStore";
import { useTerraformResourceStore } from "./useTerraformResourceStore";
import { useTerraformStore } from "./useTerraformStore";
import type { AnyNode } from "@/utils/types/resource";
import type { ResourceType, ResourceDataMap } from "./useTerraformResourceStore";

export interface ProjectMetadata {
  id: string;
  name: string;
  updatedAt: number;
}

type StoredResource = {
  id: string;
  type: ResourceType;
  data: ResourceDataMap[ResourceType];
};

export interface ProjectPayload {
  id: string;
  name: string;
  nodes: AnyNode[];
  edges: Edge[];
  resources: StoredResource[];
  terraformBlocks: Record<string, string>;
  updatedAt: number;
}

interface ProjectStore {
  currentProjectId: string | null;
  currentProjectName: string;
  projectsList: ProjectMetadata[];
  isInitialized: boolean;

  init: () => void;
  createNewProject: (name?: string) => string;
  loadProject: (id: string) => void;
  saveCurrentProject: () => void;
  renameCurrentProject: (newName: string) => void;
  deleteProject: (id: string) => void;
}

const METADATA_KEY = "cloudsketch_projects";
let saveTimeout: NodeJS.Timeout | null = null;

export const useProjectStore = create<ProjectStore>((set, get) => {
  // Debounced save helper to prevent spamming localStorage on every pixel move/drag
  const triggerDebouncedSave = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      get().saveCurrentProject();
    }, 800);
  };

  return {
    currentProjectId: null,
    currentProjectName: "Untitled Project",
    projectsList: [],
    isInitialized: false,

    init: () => {
      if (typeof window === "undefined" || get().isInitialized) return;

      try {
        const stored = localStorage.getItem(METADATA_KEY);
        const list: ProjectMetadata[] = stored ? JSON.parse(stored) : [];

        set({ projectsList: list, isInitialized: true });

        if (list.length > 0) {
          // Load the latest updated project
          const latest = list.reduce((prev, current) =>
            prev.updatedAt > current.updatedAt ? prev : current
          );
          get().loadProject(latest.id);
        } else {
          get().createNewProject("My First Project");
        }

        // Set up subscriptions to auto-save on changes
        useDiagramStore.subscribe(() => {
          triggerDebouncedSave();
        });
        useTerraformResourceStore.subscribe(() => {
          triggerDebouncedSave();
        });
        useTerraformStore.subscribe(() => {
          triggerDebouncedSave();
        });
      } catch (e) {
        console.error("Failed to initialize projects list:", e);
      }
    },

    createNewProject: (name) => {
      const id = crypto.randomUUID();
      const projectName = name || "Untitled Project";

      // Clear current workspace states
      useDiagramStore.getState().clearAll();
      useTerraformResourceStore.getState().resetAll();
      useTerraformStore.getState().clearAll();

      const timestamp = Date.now();
      const newProjectPayload: ProjectPayload = {
        id,
        name: projectName,
        nodes: [],
        edges: [],
        resources: [],
        terraformBlocks: {},
        updatedAt: timestamp,
      };

      try {
        localStorage.setItem(`cloudsketch_project_${id}`, JSON.stringify(newProjectPayload));

        const updatedList = [
          ...get().projectsList,
          { id, name: projectName, updatedAt: timestamp },
        ];
        localStorage.setItem(METADATA_KEY, JSON.stringify(updatedList));

        set({
          currentProjectId: id,
          currentProjectName: projectName,
          projectsList: updatedList,
        });
      } catch (e) {
        console.error("Failed to create new project:", e);
      }

      return id;
    },

    loadProject: (id) => {
      if (typeof window === "undefined") return;

      try {
        const storedPayload = localStorage.getItem(`cloudsketch_project_${id}`);
        if (!storedPayload) {
          console.warn(`Project payload not found for ID: ${id}`);
          return;
        }

        const payload: ProjectPayload = JSON.parse(storedPayload);

        // Load content into diagram, resources, and terraform blocks stores
        useDiagramStore.getState().setNodesAndEdges(payload.nodes || [], payload.edges || []);
        useTerraformResourceStore.getState().setResources(payload.resources || []);
        useTerraformStore.getState().setBlocks(payload.terraformBlocks || {});

        set({
          currentProjectId: id,
          currentProjectName: payload.name || "Untitled Project",
        });
      } catch (e) {
        console.error("Failed to load project:", e);
      }
    },

    saveCurrentProject: () => {
      const { currentProjectId, currentProjectName, projectsList } = get();
      if (!currentProjectId || typeof window === "undefined") return;

      const nodes = useDiagramStore.getState().nodes;
      const edges = useDiagramStore.getState().edges;
      const resources = useTerraformResourceStore.getState().resources;
      const terraformBlocks = useTerraformStore.getState().terraformBlocks;

      const timestamp = Date.now();
      const payload: ProjectPayload = {
        id: currentProjectId,
        name: currentProjectName,
        nodes,
        edges,
        resources,
        terraformBlocks,
        updatedAt: timestamp,
      };

      try {
        localStorage.setItem(`cloudsketch_project_${currentProjectId}`, JSON.stringify(payload));

        const updatedList = projectsList.map((p) =>
          p.id === currentProjectId
            ? { ...p, name: currentProjectName, updatedAt: timestamp }
            : p
        );

        localStorage.setItem(METADATA_KEY, JSON.stringify(updatedList));
        set({ projectsList: updatedList });
      } catch (e) {
        console.error("Failed to save project payload:", e);
      }
    },

    renameCurrentProject: (newName) => {
      const { currentProjectId } = get();
      if (!currentProjectId) return;

      set({ currentProjectName: newName });
      get().saveCurrentProject();
    },

    deleteProject: (id) => {
      if (typeof window === "undefined") return;

      const { currentProjectId, projectsList } = get();

      try {
        localStorage.removeItem(`cloudsketch_project_${id}`);
        const updatedList = projectsList.filter((p) => p.id !== id);
        localStorage.setItem(METADATA_KEY, JSON.stringify(updatedList));

        set({ projectsList: updatedList });

        if (currentProjectId === id) {
          if (updatedList.length > 0) {
            get().loadProject(updatedList[0].id);
          } else {
            get().createNewProject("Untitled Project");
          }
        }
      } catch (e) {
        console.error("Failed to delete project:", e);
      }
    },
  };
});
