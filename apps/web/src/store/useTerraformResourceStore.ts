import { create } from "zustand";

export type ResourceType = "securityGroup" | "keyPair" | "vpc";

interface GenericResource {
  id: string;
  type: ResourceType;
  data: {
    label: string;
    [key: string]: any; // called  index signature in TypeScript
  };
}

interface TerraformResourceStore {
  resources: GenericResource[];

  settingOpenResourceId: string | null;

  openSettings: (id: string) => void;
  closeSettings: () => void;

  addResource: (type: ResourceType, data: any) => string;
  updateResource: (id: string, data: Partial<any>) => void;
  deleteResource: (id: string) => void;

  getResourceById: (id: string) => GenericResource | undefined;
  getResourcesByType: (type: ResourceType) => GenericResource[];

  resetAll: () => void;
}

export const useTerraformResourceStore = create<TerraformResourceStore>(
  (set, get) => ({
    resources: [],
    settingOpenResourceId: null,

    openSettings: (id) => set({ settingOpenResourceId: id }),
    closeSettings: () => set({ settingOpenResourceId: null }),

    addResource: (type, data) => {
      const id = crypto.randomUUID();
      set((state) => ({
        resources: [...state.resources, { id, type, data }],
      }));
      return id;
    },

    updateResource: (id, data) =>
      set((state) => ({
        resources: state.resources.map((res) =>
          res.id === id ? { ...res, data: { ...res.data, ...data } } : res
        ),
      })),

    deleteResource: (id) =>
      set((state) => ({
        resources: state.resources.filter((res) => res.id !== id),
      })),

    getResourceById: (id) => get().resources.find((res) => res.id === id),

    getResourcesByType: (type) =>
      get().resources.filter((res) => res.type === type),

    resetAll: () => ({ resources: [] }),
  })
);
