import { NodeField } from "@/utils/types/NodeField";
import { ec2FormSchema } from "./awsNodes/ec2.config";
import { securityGroupFormSchema } from "./resources/sg.config";
import { keyPairFormSchema } from "./resources/keypair.config";

export const formSchemaRegistry: Record<string, NodeField[]> = {
  ec2: ec2FormSchema,
  securityGroup: securityGroupFormSchema,
  keypair: keyPairFormSchema,
};
