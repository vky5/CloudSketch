import { Node, Edge } from "@xyflow/react";
import { NodeCommunicationContract, SignalResponse } from "./types";
import { useTerraformStore } from "@/store/useTerraformStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";

export const contractRegistry: Record<string, NodeCommunicationContract> = {
  vpc: {},
  subnet: {
    onContainerEnter: (childNode, containerNode): SignalResponse => {
      if (containerNode.type === "vpc") {
        return {
          success: true,
          updatedSourceData: {
            ...childNode.data,
            parentVpcId: containerNode.id,
          },
        };
      }
      return { success: false };
    },
    onContainerExit: (childNode, containerNode): SignalResponse => {
      if (containerNode.type === "vpc") {
        return {
          success: true,
          updatedSourceData: {
            ...childNode.data,
            parentVpcId: "",
          },
        };
      }
      return { success: false };
    },
  },
  ec2: {
    onContainerEnter: (childNode, containerNode): SignalResponse => {
      if (containerNode.type === "subnet") {
        return {
          success: true,
          updatedSourceData: {
            ...childNode.data,
            SubnetID: containerNode.id,
          },
        };
      }
      return { success: false };
    },
    onContainerExit: (childNode, containerNode): SignalResponse => {
      if (containerNode.type === "subnet") {
        return {
          success: true,
          updatedSourceData: {
            ...childNode.data,
            SubnetID: undefined,
          },
        };
      }
      return { success: false };
    },
    onConnectionRequest: (currentNode, otherNode, role, edge): SignalResponse => {
      if (otherNode.type === "ebs") {
        if (otherNode.data.connectedTo) {
          return {
            success: false,
            error: `EBS "${otherNode.data.Name || otherNode.id}" is already connected to another instance.`,
          };
        }

        // Sync volume attachment block in Terraform
        syncNodeWithBackend({
          id: edge.id,
          type: "ec2ebs",
          data: {
            Name: edge.id,
            EC2NodeID: currentNode.id,
            VolumeID: otherNode.id,
            DeviceName: "/dev/sdf",
          } as any,
        }).catch((err) => console.error("Failed to sync ec2ebs connection:", err));

        return {
          success: true,
          updatedTargetData: {
            ...otherNode.data,
            connectedTo: currentNode.id,
          },
        };
      }

      if (otherNode.type === "s3") {
        // Sync IAM attachment block in Terraform
        syncNodeWithBackend({
          id: edge.id,
          type: "ec2s3",
          data: {
            Name: edge.id,
            EC2NodeID: currentNode.id,
            BucketID: otherNode.id,
          } as any,
        }).catch((err) => console.error("Failed to sync ec2s3 connection:", err));

        return { success: true };
      }

      return { success: true };
    },
    onConnectionDelete: (currentNode, otherNode, role, edge): SignalResponse => {
      if (otherNode.type === "ebs") {
        useTerraformStore.getState().deleteBlock(edge.id);
        return {
          success: true,
          updatedTargetData: {
            ...otherNode.data,
            connectedTo: undefined,
          },
        };
      }

      if (otherNode.type === "s3") {
        useTerraformStore.getState().deleteBlock(edge.id);
        return { success: true };
      }

      return { success: true };
    },
  },
  rds: {
    onContainerEnter: (childNode, containerNode): SignalResponse => {
      if (containerNode.type === "subnet") {
        return {
          success: true,
          updatedSourceData: {
            ...childNode.data,
            SubnetID: containerNode.id,
          },
        };
      }
      return { success: false };
    },
    onContainerExit: (childNode, containerNode): SignalResponse => {
      if (containerNode.type === "subnet") {
        return {
          success: true,
          updatedSourceData: {
            ...childNode.data,
            SubnetID: undefined,
          },
        };
      }
      return { success: false };
    },
  },
  ebs: {
    onConnectionRequest: (currentNode, otherNode, role, edge): SignalResponse => {
      if (otherNode.type === "ec2") {
        return contractRegistry.ec2.onConnectionRequest!(otherNode, currentNode, "source", edge);
      }
      return { success: true };
    },
    onConnectionDelete: (currentNode, otherNode, role, edge): SignalResponse => {
      if (otherNode.type === "ec2") {
        return contractRegistry.ec2.onConnectionDelete!(otherNode, currentNode, "source", edge);
      }
      return { success: true };
    },
  },
  s3: {
    onConnectionRequest: (currentNode, otherNode, role, edge): SignalResponse => {
      if (otherNode.type === "ec2") {
        return contractRegistry.ec2.onConnectionRequest!(otherNode, currentNode, "source", edge);
      }
      return { success: true };
    },
    onConnectionDelete: (currentNode, otherNode, role, edge): SignalResponse => {
      if (otherNode.type === "ec2") {
        return contractRegistry.ec2.onConnectionDelete!(otherNode, currentNode, "source", edge);
      }
      return { success: true };
    },
  },
};
