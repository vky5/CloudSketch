import { create } from "zustand";

interface terraformResourceStore {
  securityGroups: string[];
  keyPairs: string[];
  vpcs: string[];
  subnets: string[]; // Added subnets for completeness

  addSecurityGroup: (sg: string) => void; // for setting up securityGroups
  addKeyPair: (kp: string) => void; // for adding key pairs
  addVPC: (vpc: string) => void;
  addSubnet: (subnet: string) => void; // for adding subnets

  deleteSecurityGroup: (sg: string) => void;
  deleteKeyPair: (kp: string) => void;
  deleteVPC: (vpc: string) => void;
  deleteSubnet: (subnet: string) => void; // for deleting subnets
}

export const useTerraformResourceStore = create<terraformResourceStore>(
  (set) => ({
    securityGroups: [],
    keyPairs: [],
    vpcs: [],
    subnets: [], 

    addSecurityGroup: (sg) =>
      set((state) => ({ securityGroups: [...state.securityGroups, sg] })),

    addKeyPair: (kp) => set((state) => ({ keyPairs: [...state.keyPairs, kp] })),

    addVPC: (vpc) => set((state) => ({ vpcs: [...state.securityGroups, vpc] })),

    addSubnet: (subnet) =>
      set((state) => ({ subnets: [...state.subnets, subnet] })),

    deleteSecurityGroup: (sg: string) => {
      set((state) => ({
        securityGroups: state.securityGroups.filter((item) => item !== sg),
      }));
    },

    deleteKeyPair: (kp: string) => {
      set((state) => ({
        keyPairs: state.keyPairs.filter((item) => item !== kp),
      }));
    },

    deleteVPC: (vpc: string) => {
      set((state) => ({
        vpcs: state.vpcs.filter((item) => item !== vpc),
      }));
    },

    deleteSubnet: (subnet: string) => {
      set((state) => ({
        subnets: state.subnets.filter((item) => item !== subnet),
      }));
    },
  })
);
