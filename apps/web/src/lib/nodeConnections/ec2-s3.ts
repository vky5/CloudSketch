import { ResourceBlock, ResourceBlockSpecific } from "@/utils/types/resource";
import { handleNewResource } from "../customSaveLogics/rdsSaveHandle";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ec2Data } from "@/config/awsNodes/ec2.config";
import { useDiagramStore } from "@/store/useDiagramStore";

const handleChange = (key: string, value: unknown, id: string) => {
  useTerraformResourceStore.getState().updateResource(id, { [key]: value });
};

export default async function EC2S3(
  sourceNode: ResourceBlockSpecific<ec2Data>,
  destinationNode: ResourceBlock
) {
  // first step: check if the sourceNode already has instance profile

  console.log("Source Node data is : ", sourceNode.data);
  const instanceProfile = sourceNode.data.InstanceProfile as string | undefined;

  if (!instanceProfile) {
    // 1. create IAM role
    const [iamName, iamID] = handleNewResource("iam");
    handleChange("Services", ["ec2.amazonaws.com"], iamID);
    handleChange(
      "ManagedPolicies",
      ["arn:aws:iam::aws:policy/AmazonS3FullAccess"],
      iamID
    );

    await syncNodeWithBackend({
      id: iamID,
      type: "iam",
      data: {
        Name: iamName,
        Services: ["ec2.amazonaws.com"],
        ManagedPolicies: ["arn:aws:iam::aws:policy/AmazonS3FullAccess"],
      },
    });

    // 2. create instance profile
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

    // 3. update EC2 with instance profile
    await syncNodeWithBackend({
      id: sourceNode.id,
      type: "ec2",
      data: {
        ...sourceNode.data,
        InstanceProfile: instanceProfileName,
      },
    });

    useDiagramStore.getState().updateNodeData(sourceNode.id, {
      InstanceProfile: instanceProfileName,
    });
  } else {
    // If EC2 already has a profile, it already has a role.
    // Since we are using AmazonS3FullAccess, nothing more is required.
    console.log(
      `EC2 ${sourceNode.id} already has instance profile ${instanceProfile}, skipping IAM creation.`
    );
  }
}

/*
IAM Role <-- attach multiple policies here
Instance Profile <-- contains that single IAM Role
EC2 Instance <-- uses that single Instance Profile

✔ Fix: only create new IAM role/profile if EC2 has none.
✔ Else: skip, since AmazonS3FullAccess already covers multiple buckets.
*/

// RN there is a problem with the current setup.
/*
If we add another s3 to the existing ec2, instead of checking if there is already an IAM role attached to it, 
it adds new IAM role and in that IAM role it also adds the policy of fulla access of S3 and then update the profile instance id because it is also recreating the Profile instance as well


an EC2 instance has a single profile instance and if it has, just update the IAM role
*/
