import { describe, it, expect } from "vitest";
import { awsTemplates } from "./awsTemplates";
import { evaluateTemplate } from "@/lib/templateEvaluator";

// Renders a template the same way terraformSync.syncNodeWithBackend does
function render(type: string, data: Record<string, unknown>): string {
  const template = awsTemplates[type];
  if (!template) throw new Error(`No template for type: ${type}`);
  return evaluateTemplate(template, data);
}

describe("awsTemplates rendering", () => {
  it("has a template for every registered type", () => {
    // Guards against registering a node type without a template
    const expectedTypes = [
      "ec2",
      "securitygroup",
      "keypair",
      "s3",
      "iam",
      "instanceprofile",
      "rds",
      "ebs",
      "ec2ebs",
      "vpc",
      "elb",
      "elbec2",
      "subnet",
    ];
    for (const type of expectedTypes) {
      expect(awsTemplates[type], `missing template: ${type}`).toBeDefined();
    }
  });

  describe("ec2", () => {
    it("renders instance with ami, type, and node tag", () => {
      const tf = render("ec2", {
        NodeID: "web_1",
        AMI: "ami-123",
        InstanceType: "t3.micro",
        TagName: "web",
      });

      expect(tf).toContain('resource "aws_instance" "web_1"');
      expect(tf).toContain('ami           = "ami-123"');
      expect(tf).toContain('instance_type = "t3.micro"');
      expect(tf).toContain('NodeID = "web_1"');
    });

    it("emits TODO placeholders when required fields are missing", () => {
      const tf = render("ec2", { NodeID: "web_1" });
      expect(tf).toContain("TODO: Provide AMI ID");
      expect(tf).toContain("TODO: provide instance type");
    });

    it("joins multiple security groups with commas", () => {
      const tf = render("ec2", {
        NodeID: "web_1",
        SecurityGroups: ["sg-1", "sg-2"],
      });
      expect(tf).toContain('"sg-1"');
      expect(tf).toContain(',"sg-2"');
    });
  });

  describe("vpc", () => {
    it("renders dns hostnames true when EnableDNS is yes", () => {
      const tf = render("vpc", {
        NodeID: "vpc_1",
        CIDR: "10.0.0.0/16",
        Name: "main",
        EnableDNS: "yes",
      });
      expect(tf).toContain("enable_dns_hostnames = true");
    });

    it("renders dns hostnames false when EnableDNS is no", () => {
      const tf = render("vpc", {
        NodeID: "vpc_1",
        CIDR: "10.0.0.0/16",
        Name: "main",
        EnableDNS: "no",
      });
      expect(tf).toContain("enable_dns_hostnames = false");
    });

    it("never renders a dangling assignment", () => {
      const tf = render("vpc", {
        NodeID: "vpc_1",
        CIDR: "10.0.0.0/16",
        Name: "main",
        EnableDNS: "no",
      });
      expect(tf).not.toMatch(/=\s*$/m);
    });
  });

  describe("elb", () => {
    const base = {
      NodeID: "alb_1",
      Name: "web-alb",
      ListenerPort: "80",
      TargetPort: "8080",
      SubnetID: "subnet_1",
      VpcID: "vpc_1",
    };

    it("renders internal = false for internet-facing scheme", () => {
      const tf = render("elb", { ...base, Scheme: "internet-facing" });
      expect(tf).toContain("internal           = false");
    });

    it("renders internal = true for internal scheme", () => {
      const tf = render("elb", { ...base, Scheme: "internal" });
      expect(tf).toContain("internal           = true");
    });

    it("renders load balancer, target group, and listener blocks", () => {
      const tf = render("elb", { ...base, Scheme: "internet-facing" });
      expect(tf).toContain('resource "aws_lb" "alb_1"');
      expect(tf).toContain('resource "aws_lb_target_group" "alb_1_tg"');
      expect(tf).toContain('resource "aws_lb_listener" "alb_1_listener"');
      expect(tf).toContain("port     = 8080");
      expect(tf).toContain("port              = 80");
    });

    it("references the subnet and vpc resources", () => {
      const tf = render("elb", { ...base, Scheme: "internet-facing" });
      expect(tf).toContain("subnets = [aws_subnet.subnet_1.id]");
      expect(tf).toContain("vpc_id   = aws_vpc.vpc_1.id");
    });
  });

  describe("s3", () => {
    it("renders bucket with public access block and no deprecated acl argument", () => {
      const tf = render("s3", { NodeID: "bucket_1", BucketName: "my-assets" });

      expect(tf).toContain('resource "aws_s3_bucket" "bucket_1"');
      expect(tf).toContain('bucket = "my-assets"');
      expect(tf).toContain(
        'resource "aws_s3_bucket_public_access_block" "bucket_1_block"'
      );
      // acl was removed from aws_s3_bucket in AWS provider v4+
      expect(tf).not.toMatch(/^\s*acl\s*=/m);
    });
  });

  describe("subnet", () => {
    it("renders vpc reference and cidr", () => {
      const tf = render("subnet", {
        NodeID: "subnet_1",
        ParentVpcId: "vpc-abc",
        CIDR: "10.0.1.0/24",
        Name: "public-a",
      });

      expect(tf).toContain('resource "aws_subnet" "subnet_1"');
      expect(tf).toContain('vpc_id     = "vpc-abc"');
      expect(tf).toContain('cidr_block = "10.0.1.0/24"');
    });
  });

  describe("connection templates", () => {
    it("ec2ebs renders a volume attachment referencing both resources", () => {
      const tf = render("ec2ebs", {
        NodeID: "attach_1",
        EC2NodeID: "web_1",
        VolumeID: "vol-123",
        DeviceName: "/dev/sdh",
      });

      expect(tf).toContain('resource "aws_volume_attachment" "attach_1"');
      expect(tf).toContain("instance_id = aws_instance.web_1.id");
      expect(tf).toContain('volume_id   = "vol-123"');
      expect(tf).toContain('device_name = "/dev/sdh"');
    });

    it("elbec2 renders a target group attachment referencing both resources", () => {
      const tf = render("elbec2", {
        NodeID: "tga_1",
        ALBNodeID: "alb_1",
        EC2NodeID: "web_1",
        TargetPort: "8080",
      });

      expect(tf).toContain('resource "aws_lb_target_group_attachment" "tga_1"');
      expect(tf).toContain("target_group_arn = aws_lb_target_group.alb_1_tg.arn");
      expect(tf).toContain("target_id        = aws_instance.web_1.id");
      expect(tf).toContain("port             = 8080");
    });
  });

  describe("iam", () => {
    it("renders role with services and managed policy attachments", () => {
      const tf = render("iam", {
        NodeID: "role_1",
        Name: "app-role",
        Services: ["ec2.amazonaws.com"],
        ManagedPolicies: ["arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"],
      });

      expect(tf).toContain('resource "aws_iam_role" "role_1"');
      expect(tf).toContain('"ec2.amazonaws.com"');
      expect(tf).toContain(
        'policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"'
      );
    });
  });

  describe("securitygroup", () => {
    it("renders ingress and egress rules per entry", () => {
      const tf = render("securitygroup", {
        NodeID: "sg_1",
        Name: "web_sg",
        VpcID: "vpc-1",
        IngressRules: [
          { CidrIPv4: "0.0.0.0/0", FromPort: 443, ToPort: 443, Protocol: "tcp" },
        ],
        EgressRules: [
          { CidrIPv4: "0.0.0.0/0", FromPort: 0, ToPort: 0, Protocol: "-1" },
        ],
      });

      expect(tf).toContain('resource "aws_security_group" "web_sg"');
      expect(tf).toContain(
        'resource "aws_vpc_security_group_ingress_rule" "web_sg_ingress_0"'
      );
      expect(tf).toContain(
        'resource "aws_vpc_security_group_egress_rule" "web_sg_egress_0"'
      );
    });
  });
});
