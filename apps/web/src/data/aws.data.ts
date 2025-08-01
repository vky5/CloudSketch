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
} from 'lucide-react';

export const awsComponents = [
  {
    title: 'Compute',
    items: [
      { name: 'EC2 Instance', desc: 'Virtual server in the cloud', icon: Server },
      { name: 'Lambda Function', desc: 'Serverless compute service', icon: Zap },
    ],
  },
  {
    title: 'Storage',
    items: [
      { name: 'S3 Bucket', desc: 'Object storage service', icon: Folder },
      { name: 'EBS Volume', desc: 'Block storage for EC2', icon: HardDrive },
    ],
  },
  {
    title: 'Database',
    items: [
      { name: 'RDS Instance', desc: 'Managed SQL database', icon: Database },
    ],
  },
  {
    title: 'Networking',
    items: [
      { name: 'VPC', desc: 'Isolated virtual network', icon: Globe },
      { name: 'Load Balancer', desc: 'Distribute traffic across resources', icon: Repeat },
      { name: 'Security Group', desc: 'Virtual firewall for instances', icon: Shield },
    ],
  },
  {
    title: 'Security',
    items: [
      { name: 'IAM Role', desc: 'Permissions for AWS resources', icon: Lock },
    ],
  },
];
