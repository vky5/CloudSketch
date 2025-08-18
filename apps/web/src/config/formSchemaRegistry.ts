import { NodeField } from "@/utils/types/NodeField";
import { ec2FormSchema } from "./awsNodes/ec2.config";
import { securityGroupFormSchema } from "./resources/sg.config";
import { keyPairFormSchema } from "./resources/keypair.config";
import { s3FormConfig } from "./awsNodes/s3.config";
import { iamFormSchema } from "./resources/iam.config";
import { rdsFormSchema } from "./awsNodes/rds.config";

export const formSchemaRegistry: Record<string, NodeField[]> = {
  ec2: ec2FormSchema,
  securitygroup: securityGroupFormSchema,
  keypair: keyPairFormSchema,
  s3: s3FormConfig,
  iam: iamFormSchema,
  rds: rdsFormSchema,
};
