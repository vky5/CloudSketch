export type ebsAttachData = {
  EC2NodeID: string;
  VolumeID: string;
  DeviceName?: string;
  ForceDetach?: boolean;
  Name: string;
};
