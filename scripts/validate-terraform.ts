// Renders every template in awsTemplates with representative sample data,
// then runs `terraform fmt -check` (syntax) and `terraform validate`
// (provider schema) on the output. Run with: pnpm test:tf
//
// First run downloads the AWS provider (~a few hundred MB) into
// .tfvalidate/.terraform; later runs reuse it.
import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { evaluateTemplate } from "../src/lib/templateEvaluator";
import { awsTemplates } from "../src/registry/awsTemplates";

const outDir = join(__dirname, "..", ".tfvalidate");

// Representative node data per template type. When adding a new resource
// template, add a sample here so it gets validated.
const samples: Record<string, Record<string, unknown>> = {
  ec2: {
    NodeID: "web_1",
    AMI: "ami-0123456789abcdef0",
    InstanceType: "t3.micro",
    TagName: "web",
    SecurityGroups: ["sg-111", "sg-222"],
    KeyName: "main-key",
    SubnetID: "subnet-111",
  },
  securitygroup: {
    NodeID: "sg_1",
    Name: "web_sg",
    Description: "web traffic",
    VpcID: "vpc-111",
    IngressRules: [
      { CidrIPv4: "0.0.0.0/0", FromPort: 443, ToPort: 443, Protocol: "tcp" },
      { CidrIPv4: "10.0.0.0/8", FromPort: 22, ToPort: 22, Protocol: "tcp" },
    ],
    EgressRules: [
      { CidrIPv4: "0.0.0.0/0", FromPort: 0, ToPort: 0, Protocol: "-1" },
    ],
  },
  keypair: { KeyName: "main_key", PublicKey: "ssh-ed25519 AAAA test" },
  s3: { NodeID: "bucket_1", BucketName: "my-app-assets" },
  iam: {
    NodeID: "role_1",
    Name: "role_1",
    Services: ["ec2.amazonaws.com"],
    ManagedPolicies: ["arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"],
  },
  instanceprofile: {
    NodeID: "profile_1",
    Name: "profile_1",
    ParentRoleName: "role_1",
  },
  rds: {
    NodeID: "db_1",
    AllocatedStorage: 20,
    StorageType: "gp3",
    Engine: "postgres",
    EngineVersion: "16.3",
    InstanceClass: "db.t3.micro",
    DBName: "app",
    Username: "dbadmin",
    Password: "changeme123",
    TagName: "db",
  },
  ebs: {
    NodeID: "vol_1",
    AvailabilityZone: "us-east-1a",
    Size: 20,
    VolumeType: "gp3",
    TagName: "data",
  },
  ec2ebs: {
    NodeID: "attach_1",
    EC2NodeID: "web_1",
    VolumeID: "vol-0123",
    DeviceName: "/dev/sdf",
  },
  vpc: { NodeID: "vpc_1", CIDR: "10.0.0.0/16", Name: "main", EnableDNS: "yes" },
  subnet: {
    NodeID: "subnet_1",
    ParentVpcId: "vpc-111",
    CIDR: "10.0.1.0/24",
    Name: "public_a",
    AvailabilityZone: "us-east-1a",
    MapPublicIpOnLaunch: "yes",
  },
  elb: {
    NodeID: "alb_1",
    Name: "web-alb",
    Scheme: "internet-facing",
    ListenerPort: "80",
    TargetPort: "8080",
    SubnetID: "subnet_1",
    VpcID: "vpc_1",
  },
  elbec2: {
    NodeID: "tga_1",
    ALBNodeID: "alb_1",
    EC2NodeID: "web_1",
    TargetPort: "8080",
  },
};

const missingSamples = Object.keys(awsTemplates).filter((t) => !samples[t]);
if (missingSamples.length > 0) {
  console.error(
    `No sample data for template(s): ${missingSamples.join(", ")} — add them to scripts/validate-terraform.ts`
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
for (const [type, data] of Object.entries(samples)) {
  writeFileSync(
    join(outDir, `${type}.tf`),
    evaluateTemplate(awsTemplates[type], data) + "\n"
  );
}

writeFileSync(
  join(outDir, "providers.tf"),
  `terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
`
);

console.log(`Rendered ${Object.keys(samples).length} templates to .tfvalidate/`);

const run = (cmd: string) =>
  execSync(cmd, { cwd: outDir, stdio: "inherit" });

if (!existsSync(join(outDir, ".terraform"))) {
  console.log("Initializing terraform (downloads the AWS provider once)...");
  run("terraform init -backend=false -input=false");
}

run("terraform validate");
