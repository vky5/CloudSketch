import { create } from "zustand";

interface TerraformResourceStore {
  securityGroups: string[];
  keyPairs: string[];

  addSecurityGroup: (sg: string) => void;
  deleteSecurityGroup: (sg: string) => void;

  addKeyPair: (kp: string) => void;
  deleteKeyPair: (kp: string) => void;

  resetAll: () => void; // Optional: clear all for reset button

  // vpc will be handled in the userdiagramstore as a node
}

export const useTerraformResourceStore = create<TerraformResourceStore>((set) => ({
  securityGroups: [],
  keyPairs: [],

  addSecurityGroup: (sg) =>
    set((state) => ({
      securityGroups: [...state.securityGroups, sg],
    })),

  deleteSecurityGroup: (sg) =>
    set((state) => ({
      securityGroups: state.securityGroups.filter((item) => item !== sg),
    })),

  addKeyPair: (kp) =>
    set((state) => ({
      keyPairs: [...state.keyPairs, kp],
    })),

  deleteKeyPair: (kp) =>
    set((state) => ({
      keyPairs: state.keyPairs.filter((item) => item !== kp),
    })),

  resetAll: () =>
    set(() => ({
      securityGroups: [],
      keyPairs: [],
    })),
}));
