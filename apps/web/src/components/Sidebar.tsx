'use client'

import { Server, Zap, Box, Cloud, Database, HardDrive, Folder, Shield, Activity, Bell, Repeat, MessageSquare, Lock, Globe, Wifi, AlertTriangle, Monitor, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils'

const serviceBlocks = [
  {
    title: 'Compute',
    items: [
      { name: 'EC2 Instance', desc: 'Virtual server in the cloud', icon: Server },
      { name: 'Lambda Function', desc: 'Serverless compute service', icon: Zap },
      { name: 'ECS Service', desc: 'Container orchestration service', icon: Box },
      { name: 'EKS Cluster', desc: 'Managed Kubernetes cluster', icon: Cloud },
    ],
  },
  {
    title: 'Storage',
    items: [
      { name: 'S3 Bucket', desc: 'Object storage service', icon: Folder },
      { name: 'EBS Volume', desc: 'Block storage for EC2', icon: HardDrive },
      { name: 'EFS File System', desc: 'Shared POSIX-compliant storage', icon: Database },
    ],
  },
  {
    title: 'Database',
    items: [
      { name: 'RDS Instance', desc: 'Managed SQL database', icon: Database },
      { name: 'DynamoDB Table', desc: 'Serverless NoSQL database', icon: Database },
      { name: 'Redis Cache', desc: 'In-memory key-value store', icon: Database },
    ],
  },
  {
    title: 'Networking',
    items: [
      { name: 'VPC', desc: 'Isolated virtual network', icon: Globe },
      { name: 'Load Balancer', desc: 'Distribute traffic across resources', icon: Repeat },
      { name: 'NAT Gateway', desc: 'Enable outbound traffic from private subnets', icon: Wifi },
      { name: 'Security Group', desc: 'Virtual firewall for instances', icon: Shield },
    ],
  },
  {
    title: 'Security',
    items: [
      { name: 'IAM Role', desc: 'Permissions for AWS resources', icon: Lock },
      { name: 'Secrets Manager', desc: 'Store API keys and credentials securely', icon: Shield },
      { name: 'KMS Key', desc: 'Encrypt and decrypt data securely', icon: Lock },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { name: 'CloudWatch Logs', desc: 'Log monitoring and management', icon: Activity },
      { name: 'CloudWatch Alarms', desc: 'Set thresholds and receive alerts', icon: Bell },
      { name: 'Metrics Dashboard', desc: 'Custom visualization of resource metrics', icon: Monitor },
    ],
  },
  {
    title: 'Messaging',
    items: [
      { name: 'SQS Queue', desc: 'Reliable, scalable message queue', icon: MessageSquare },
      { name: 'SNS Topic', desc: 'Pub/Sub messaging and notifications', icon: Bell },
      { name: 'EventBridge', desc: 'Event-driven routing between services', icon: GitBranch },
    ],
  },
];

export default function Sidebar() {
  return (
    <div className="w-[260px] h-full bg-[#0e0f11] border-r border-zinc-800 p-4 overflow-y-auto" style={{scrollbarWidth: "none"}}>
      {serviceBlocks.map((block) => (
        <div key={block.title} className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-500 mb-3">{block.title}</h2>
          <div className="space-y-4" >
            {block.items.map((item) => (
              <div
                key={item.name}
                className="bg-[#141518] hover:bg-[#020817] cursor-pointer p-3 rounded-xl border border-zinc-700 flex gap-3 items-center"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item))
                }}

                
              >
                <item.icon className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{item.name}</span>
                  <span className="text-xs text-zinc-400">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
