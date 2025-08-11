import { NodeField } from "@/utils/types/NodeField";
import { ec2FormSchema } from "./awsNodes/ec2.config";
import { securityGroupFormSchema } from "./awsNodes/resources/sg.config";

export const formSchemaRegistry: Record<string, NodeField[]> = {
  ec2: ec2FormSchema,
  sg: securityGroupFormSchema,
};
