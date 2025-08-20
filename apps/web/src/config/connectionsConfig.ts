import { connectionKeys } from "@/lib/nodeConnections/connectionLogicRegistry";

// Allowed connections map
const connectionRules: Record<string, string[]> = {
  //   EC2: ["EBS", "SecurityGroup", "Subnet"],
  ebs: ["ec2"],
  s3: ["ec2"],
  //   RDS: ["Subnet", "SecurityGroup"],
  //   SecurityGroup: ["EC2", "RDS"],
  //   Subnet: ["EC2", "RDS"],
};

// Connection validation
export default function canConnect(
  sourceType: string,
  targetType: string
): boolean {
  // If source has rules, check against them
  if (connectionRules[sourceType]) {
    return connectionRules[sourceType].includes(targetType);
  }

  return true;
}

export function keyGen(
  sourceType: string,
  destinationType: string
): connectionKeys | null {
  if (sourceType === "ec2" && destinationType === "ebs") {
    return "ec2ebs";
  }

  return null;
}
