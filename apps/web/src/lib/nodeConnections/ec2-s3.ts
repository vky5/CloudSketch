import { ResourceBlock } from "@/utils/types/resource";
import { handleNewResource } from "../customSaveLogics/rdsSaveHandle";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";

const handleChange = (key: string, value: unknown, id: string) => {
  useTerraformResourceStore.getState().updateResource(id, { [key]: value });
};

export default async function EC2S3(
  sourceNode: ResourceBlock,
  destinationNode: ResourceBlock
) {
  // first step is creating an IAM policy
  const [iamName, iamID] = handleNewResource("iam");
  handleChange("Services", ["ec2.amazonaws.com"], iamID);
  handleChange(
    "ManagedPolicies",
    ["arn:aws:iam::aws:policy/AmazonS3FullAccess"],
    iamID
  );

  console.log("source : ", sourceNode);
  console.log("destination : ", destinationNode);

  await syncNodeWithBackend({
    id: iamID,
    type: "iam",
    data: {
      Name: iamName,
      Services: ["ec2.amazonaws.com"],
      ManagedPolicies: ["arn:aws:iam::aws:policy/AmazonS3FullAccess"],
    },
  });

  const [instanceProfileName, instanceProfileId] =
    handleNewResource("instanceprofile");
  await syncNodeWithBackend({
    id: instanceProfileId,
    type: "instanceprofile",
    data: {
      Name: instanceProfileName,
      ParentRoleName: iamName,
    },
  });

  await syncNodeWithBackend({
    id: sourceNode.id,
    type: "ec2",
    data: {
      ...sourceNode.data,
      InstanceProfileName: instanceProfileName,
    },
  });
}

/*
IAM Role <-- attach multiple policies here
Instance Profile <-- contains that single IAM Role
EC2 Instance <-- uses that single Instance Profile
*/
