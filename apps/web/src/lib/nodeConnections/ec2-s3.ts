import { resourceBlock } from "@/utils/types/resource";
import { handleNewResource } from "../customSaveLogics/rdsSaveHandle";


export default function EC2S3(
  sourceNode: resourceBlock,
  destinationNode: resourceBlock,
){
  // first step is creating an IAM policy
  const [iamName, id] = handleNewResource("iam")
  

}






/*
IAM Role <-- attach multiple policies here
Instance Profile <-- contains that single IAM Role
EC2 Instance <-- uses that single Instance Profile
*/



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