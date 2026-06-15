import {
  Server,
  Zap,
  Folder,
  HardDrive,
  Database,
  Globe,
  Repeat,
  Shield,
  Lock,
} from "lucide-react";

export const awsComponents = [
  {
    title: "Compute",
    items: [
      {
        id: "ec2",
        name: "EC2 Instance",
        desc: "Virtual server in the cloud",
        icon: Server,
      },
      {
        id: "lambda",
        name: "Lambda Function",
        desc: "Serverless compute service",
        icon: Zap,
      },
    ],
  },
  {
    title: "Storage",
    items: [
      {
        id: "s3",
        name: "S3 Bucket",
        desc: "Object storage service",
        icon: Folder,
      },
      {
        id: "ebs",
        name: "EBS Volume",
        desc: "Block storage for EC2",
        icon: HardDrive,
      },
    ],
  },
  {
    title: "Database",
    items: [
      {
        id: "rds",
        name: "RDS Instance",
        desc: "Managed SQL database",
        icon: Database,
      },
    ],
  },
  {
    title: "Networking",
    items: [
      { id: "vpc", name: "VPC", desc: "Isolated virtual network", icon: Globe },
      {
        id: "elb",
        name: "Load Balancer",
        desc: "Distribute traffic across resources",
        icon: Repeat,
      },
      {
        id: "sg",
        name: "Security Group",
        desc: "Virtual firewall for instances",
        icon: Shield,
      },
    ],
  },
  {
    title: "Security",
    items: [
      {
        id: "iam",
        name: "IAM Role",
        desc: "Permissions for AWS resources",
        icon: Lock,
      },
    ],
  },
];
