import { create } from "zustand";
import { ebsData } from "@/config/awsNodes/ebs.config";
import { ec2Data } from "@/config/awsNodes/ec2.config";
import { rdsData } from "@/config/awsNodes/rds.config";
import { s3Data } from "@/config/awsNodes/s3.config";
import { iamData } from "@/config/resources/iam.config";
import { keyPairData } from "@/config/resources/keypair.config";
import { SecurityGroupData } from "@/config/resources/sg.config";

// Map ResourceType to the actual data type
export type ResourceDataMap = {
  ec2: ec2Data;
  ebs: ebsData;
  rds: rdsData;
  s3: s3Data;
  iam: iamData;
  keypair: keyPairData;
  securitygroup: SecurityGroupData;
  instanceprofile: {
    Name: string;
    [key: string]: any;
  };
};

export type ResourceType = keyof ResourceDataMap; // now T must be a key

interface GenericResource<T extends ResourceType = ResourceType> {
  id: string;
  type: T;
  data: ResourceDataMap[T];
}

interface TerraformResourceStore {
  resources: GenericResource[];

  settingOpenResourceId: string | null;

  openSettings: (id: string) => void;
  closeSettings: () => void;

  addResource: <T extends ResourceType>(
    type: T,
    data: ResourceDataMap[T]
  ) => string;
  updateResource: <T extends ResourceType>(
    id: string,
    data: Partial<ResourceDataMap[T]>
  ) => void;
  deleteResource: (id: string) => void;

  getResourceById: <T extends ResourceType = ResourceType>(
    id: string
  ) => GenericResource<T> | undefined;
  getResourcesByType: <T extends ResourceType = ResourceType>(
    type: T
  ) => GenericResource<T>[];

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
    getResourceById: <T extends ResourceType = ResourceType>(
      id: string
    ): GenericResource<T> | undefined => {
      const res = get().resources.find((res) => res.id === id);
      return res as GenericResource<T> | undefined; // <-- type assertion here
    },

    getResourcesByType: <T extends ResourceType = ResourceType>(
      type: T
    ): GenericResource<T>[] => {
      return get().resources.filter(
        (res): res is GenericResource<T> => res.type === type
      );
    },

    resetAll: () => ({ resources: [] }),
  })
);
