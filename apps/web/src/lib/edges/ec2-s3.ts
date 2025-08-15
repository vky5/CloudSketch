import { Connection, Edge } from "@xyflow/react";
import {
  ResourceType,
  useTerraformResourceStore,
} from "@/store/useTerraformResourceStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { useDiagramStore } from "@/store/useDiagramStore";

// To add new Resources based on the type passed as parameter
const handleNewResource = (labelType: ResourceType) => {
  const newLabel = `${labelType}-${Date.now()}`;
  return useTerraformResourceStore
    .getState()
    .addResource(labelType, { Name: newLabel });
};

const handleChange = (key: string, value: any, id: string) => {
  useTerraformResourceStore.getState().updateResource(id, { [key]: value });
};

export default async function EC2S3(edge: Edge | Connection, id?: string) {
  // first is adding the iam role if not present
  try {
    let iam;
    if (!id) {
      const idCreated = handleNewResource("iam");
      handleChange("Services", ["ec2.amazonaws.com"], idCreated);
      handleChange(
        "ManagedPolicies",
        ["arn:aws:iam::aws:policy/AmazonS3FullAccess"],
        idCreated
      );
      id = idCreated;
      // if IAM role is present use it else use what is provided
      iam = useTerraformResourceStore
        .getState()
        .resources.find((rs) => rs.id === id);

      await syncNodeWithBackend({
        id,
        type: "iam",
        data: {
          Name: iam?.data.Name,
          Services: iam?.data.Services,
          ManagedPolicies: iam?.data.ManagedPolicies,
        },
      });
    }

    // create the instance profile type
    const instanceProfileId = handleNewResource("instanceprofile");

    // setting up the ec2 to assume the role through profile instance
    const instanceProfileName = useTerraformResourceStore
      .getState()
      .resources.find((ip) => ip.id === instanceProfileId);

    await syncNodeWithBackend({
      id: instanceProfileId,
      type: "instanceprofile",
      data: {
        Name: instanceProfileName?.data.Name,
        ParentRoleName: iam?.data.Name,
      },
    });

    const ec2State = useDiagramStore
      .getState()
      .nodes.find((nds) => nds.id === edge.source);

    await syncNodeWithBackend({
      id: edge.source,
      type: "ec2",
      data: {
        ...ec2State?.data,
        InstanceProfile: instanceProfileName?.data.Name,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

/*
IAM Role <-- attach multiple policies here
Instance Profile <-- contains that single IAM Role
EC2 Instance <-- uses that single Instance Profile
*/
