export interface NodeMetadata {
  type: string;
  displayName: string;
  category: string;
  requiredFields: string[];
  templatePath: string;
}

export const nodeRegistry: Record<string, NodeMetadata> = {
  ec2: {
    type: "ec2",
    displayName: "EC2 Instance",
    category: "Compute",
    requiredFields: ["Name", "AMI", "InstanceType"],
    templatePath: "src/templates/aws/ec2.tf.tmpl",
  },
  securitygroup: {
    type: "securitygroup",
    displayName: "Security Group",
    category: "Resource",
    requiredFields: ["Name", "NodeID"],
    templatePath: "src/templates/aws/sg.tf.tmpl",
  },
  keypair: {
    type: "keypair",
    displayName: "Key Pair",
    category: "Resource",
    requiredFields: ["Name", "PublicKey", "NodeID"],
    templatePath: "src/templates/aws/kp.tf.tmpl",
  },
  s3: {
    type: "s3",
    displayName: "S3 Bucket",
    category: "Storage",
    requiredFields: ["BucketName", "NodeID"],
    templatePath: "src/templates/aws/s3.tf.tmpl",
  },
  iam: {
    type: "iam",
    displayName: "IAM",
    category: "Resource",
    requiredFields: ["Name", "NodeID", "Services", "ManagedPolicies"],
    templatePath: "src/templates/aws/iam.tf.tmpl",
  },
  instanceprofile: {
    type: "instanceprofile",
    displayName: "Instance Profile",
    category: "Resource",
    requiredFields: ["Name", "NodeID", "ParentRoleName"],
    templatePath: "src/templates/aws/instance_profile.tf.tmpl",
  },
  rds: {
    type: "rds",
    displayName: "RDS",
    category: "Database",
    requiredFields: ["Name", "TagName", "NodeID"],
    templatePath: "src/templates/aws/rds.tf.tmpl",
  },
  ebs: {
    type: "ebs",
    displayName: "Elastic Block Storage",
    category: "Storage",
    requiredFields: ["Name", "VolumeType", "Size"],
    templatePath: "src/templates/aws/ebs.tf.tmpl",
  },
  ec2ebs: {
    type: "ec2ebs",
    displayName: "Attach EBS Volume to EC2",
    category: "Connection",
    requiredFields: ["NodeID", "VolumeID", "DeviceName", "EC2NodeID"],
    templatePath: "src/templates/aws/attach_ebs.tf.tmpl",
  },
  vpc: {
    type: "vpc",
    displayName: "VPC",
    category: "Networking",
    requiredFields: ["NodeID", "Name"],
    templatePath: "src/templates/aws/vpc.tf.tmpl",
  },
  subnet: {
    type: "subnet",
    displayName: "Subnet of VPC",
    category: "Networking",
    requiredFields: ["NodeID", "Name"],
    templatePath: "src/templates/aws/subnet.tf.tmpl",
  },
};
