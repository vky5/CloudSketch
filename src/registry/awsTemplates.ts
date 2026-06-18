export const awsTemplates: Record<string, string> = {
  ec2: `resource "aws_instance" "{{.NodeID}}" {
  ami           = "{{or .AMI "TODO: Provide AMI ID"}}"
  instance_type = "{{or .InstanceType "TODO: provide instance type"}}"

  {{- if .InstanceProfile }}
  iam_instance_profile = aws_iam_instance_profile.{{.InstanceProfile}}.name
  {{- end }}

  vpc_security_group_ids = [
    {{- if .SecurityGroups }}
      {{- range $i, $sg := .SecurityGroups }}
        {{- if $i}},{{end}}"{{$sg}}"
      {{- end }}
    {{- else }}
      "TODO: add security group IDs"
    {{- end }}
  ]

  {{- if .KeyName }}
  key_name = "{{.KeyName}}"
  {{- else }}
  # key_name = "TODO: add key pair name if needed"
  {{- end }}

  {{- if .SubnetID }}
  subnet_id = "{{.SubnetID}}"
  {{- else }}
  # subnet_id = "TODO: add subnet ID if required"
  {{- end }}

  tags = {
    Name   = "{{or .TagName "TODO: set Name tag"}}"
    NodeID = "{{.NodeID}}"
  }
}`,

  securitygroup: `# Security Group Resource
resource "aws_security_group" "{{.Name}}" {
  name        = "{{.Name}}"
  description = "{{or .Description "TODO: Provide description"}}"

  {{if .VpcID}}
    vpc_id = "{{.VpcID}}"
  {{else}}
    # vpc_id = "TODO: Provide VPC ID (will use default VPC if omitted)"
  {{end}}

  tags = {
    Name   = "{{.Name}}"
    NodeID   = "{{.NodeID}}"
  }
}

{{/* Ingress Rules */}}
{{range $i, $rule := .IngressRules}}
resource "aws_vpc_security_group_ingress_rule" "{{$.Name}}_ingress_{{$i}}" {
  security_group_id = aws_security_group.{{$.Name}}.id
  {{if $rule.CidrIPv4}}cidr_ipv4 = "{{$rule.CidrIPv4}}"{{end}}
  {{if $rule.CidrIPv6}}cidr_ipv6 = "{{$rule.CidrIPv6}}"{{end}}
  from_port         = {{$rule.FromPort}}
  to_port           = {{$rule.ToPort}}
  ip_protocol       = "{{$rule.Protocol}}"
}
{{end}}

{{/* Egress Rules */}}
{{range $i, $rule := .EgressRules}}
resource "aws_vpc_security_group_egress_rule" "{{$.Name}}_egress_{{$i}}" {
  security_group_id = aws_security_group.{{$.Name}}.id
  {{if $rule.CidrIPv4}}cidr_ipv4 = "{{$rule.CidrIPv4}}"{{end}}
  {{if $rule.CidrIPv6}}cidr_ipv6 = "{{$rule.CidrIPv6}}"{{end}}
  from_port         = {{$rule.FromPort}}
  to_port           = {{$rule.ToPort}}
  ip_protocol       = "{{$rule.Protocol}}"
}
{{end}}`,

  keypair: `# Key Pair Resource
resource "aws_key_pair" "{{.KeyName}}" {
    key_name   = "{{.KeyName}}"
    public_key = "{{.PublicKey}}"
}`,

  s3: `resource "aws_s3_bucket" "{{ .NodeID }}" {
  bucket = "{{ .BucketName }}"
  acl    = "private"

  tags = {
    Name = "{{ .BucketName }}"
  }
}

resource "aws_s3_bucket_public_access_block" "{{ .NodeID }}_block" {
  bucket                  = aws_s3_bucket.{{ .NodeID }}.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`,

  iam: `# IAM Role
resource "aws_iam_role" "{{.NodeID}}" {
  name = "{{.Name}}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
            Service = [
                {{- range $i, $svc := .Services }}
                "{{$svc}}",
                {{- end }}
            ]
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    CreatedBy = "CloudSketch"
    NodeID    = "{{.NodeID}}"
  }
}

# Attach selected managed policies
{{if .ManagedPolicies}}
{{range $i, $policy := .ManagedPolicies}}
resource "aws_iam_role_policy_attachment" "{{$.Name}}_{{$i}}" {
  role       = aws_iam_role.{{$.Name}}.name
  policy_arn = "{{$policy}}"
}
{{end}}
{{end}}

# Attach custom policies
{{if .CustomPolicies}}
{{range $i, $policy := .CustomPolicies}}
resource "aws_iam_role_policy_attachment" "{{$.Name}}_{{$i}}_custom" {
  role       = aws_iam_role.{{$.Name}}.name
  policy_arn = "{{$policy}}"
}
{{end}}
{{end}}`,

  instanceprofile: `resource "aws_iam_instance_profile" "{{.NodeID}}" {
  name = "{{.Name}}"
  role = aws_iam_role.{{.ParentRoleName}}.name
}`,

  rds: `resource "aws_db_instance" "{{.NodeID}}" {
  allocated_storage    = {{or .AllocatedStorage "TODO: set allocated storage"}}
  storage_type         = "{{or .StorageType "TODO: set storage type"}}"
  engine               = "{{or .Engine "TODO: set engine"}}"
  engine_version       = "{{or .EngineVersion "TODO: set engine version"}}"
  instance_class       = "{{or .InstanceClass "TODO: set instance class"}}"
  db_name              = "{{or .DBName "TODO: set DB name"}}"
  username             = "{{or .Username "TODO: set master username"}}"
  password             = "{{or .Password "TODO: set master password"}}"
  skip_final_snapshot  = true
  {{- if .SecurityGroups }}
  vpc_security_group_ids = [
      {{- range $i, $sg := .SecurityGroups }}
          {{- if $i}},{{end}}aws_security_group.{{$sg}}.id
      {{- end }}
  ]
  {{- else }}
  # TODO: add security group IDs
  {{- end }}
  {{- if .SubnetID }}
  db_subnet_group_name = aws_db_subnet_group.{{.NodeID}}_subnet_group.name
  {{- else if .SubnetGroupName }}
  db_subnet_group_name = "{{.SubnetGroupName}}"
  {{- else }}
  # TODO: add subnet group name if required
  {{- end }}
  tags = {
    Name   = "{{or .TagName "TODO: set Name tag"}}"
    NodeID = "{{.NodeID}}"
  }
}

{{- if .SubnetID }}
# Create a subnet group for the single subnet
resource "aws_db_subnet_group" "{{.NodeID}}_subnet_group" {
  name       = "{{.NodeID}}-subnet-group"
  subnet_ids = [aws_subnet.{{.SubnetID}}.id]
  
  tags = {
    Name = "{{.NodeID}} DB Subnet Group"
  }
}
{{- end }}`,

  ebs: `resource "aws_ebs_volume" "{{.NodeID}}" {
  availability_zone = "{{or .AvailabilityZone "TODO: provide AZ matching instance"}}"
  size              = {{or .Size "TODO: provide size in GB"}}
  type              = "{{or .VolumeType "gp3"}}"

  {{- if .Encrypted }}
  encrypted = true
  {{- else }}
  # encrypted = true   # TODO: enable encryption if required
  {{- end }}

  tags = {
    Name   = "{{or .TagName "TODO: set Name tag"}}"
    NodeID = "{{.NodeID}}"
  }
}`,

  ec2ebs: `resource "aws_volume_attachment" "{{.NodeID}}" {
  instance_id = aws_instance.{{.EC2NodeID}}.id
  volume_id   = "{{.VolumeID}}"
  device_name = "{{or .DeviceName "/dev/sdf"}}"

  # force_detach = {{or .ForceDetach false}}
}`,

  vpc: `resource "aws_vpc" "{{.NodeID}}" {
  cidr_block           = "{{.CIDR}}"
  enable_dns_support   = true
  enable_dns_hostnames = {{if eq .EnableDNS "yes"}}true{{else}}false{{end}}

  tags = {
    Name   = "{{or .Name "TODO: set Name"}}"
    NodeID = "{{.NodeID}}"
  }
}`,

  elb: `resource "aws_lb" "{{.NodeID}}" {
  name               = "{{.Name}}"
  load_balancer_type = "application"
  internal           = {{if eq .Scheme "internal"}}true{{else}}false{{end}}

  {{- if .SubnetID }}
  subnets = [aws_subnet.{{.SubnetID}}.id]
  {{- else }}
  # subnets = [aws_subnet.TODO.id]  # place ALB in a subnet
  {{- end }}

  tags = {
    Name   = "{{or .Name "ALB"}}"
    NodeID = "{{.NodeID}}"
  }
}

resource "aws_lb_target_group" "{{.NodeID}}_tg" {
  name     = "{{.Name}}-tg"
  port     = {{or .TargetPort "80"}}
  protocol = "HTTP"
  vpc_id   = aws_vpc.{{or .VpcID "TODO_vpc_id"}}.id

  health_check {
    enabled = true
    path    = "/"
  }
}

resource "aws_lb_listener" "{{.NodeID}}_listener" {
  load_balancer_arn = aws_lb.{{.NodeID}}.arn
  port              = {{or .ListenerPort "80"}}
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.{{.NodeID}}_tg.arn
  }
}`,

  elbec2: `resource "aws_lb_target_group_attachment" "{{.NodeID}}" {
  target_group_arn = aws_lb_target_group.{{.ALBNodeID}}_tg.arn
  target_id        = aws_instance.{{.EC2NodeID}}.id
  port             = {{or .TargetPort "80"}}
}`,

  subnet: `resource "aws_subnet" "{{.NodeID}}" {
  vpc_id     = "{{.ParentVpcId}}"
  cidr_block = "{{or .CIDR "TODO: provide CIDR block"}}"

  {{- if .AvailabilityZone }}
  availability_zone = "{{.AvailabilityZone}}"
  {{- else }}
  # availability_zone = "TODO: set availability zone if required"
  {{- end }}

  {{- if .MapPublicIpOnLaunch }}
  map_public_ip_on_launch = {{if eq .MapPublicIpOnLaunch "yes"}}true{{else}}false{{end}}
  {{- else }}
  # map_public_ip_on_launch = false
  {{- end }}

  tags = {
    Name   = "{{or .Name "TODO: set Subnet Name"}}"
    NodeID = "{{.NodeID}}"
    {{- if .Tags }}
    Extra  = "{{.Tags}}"
    {{- end }}
  }
}`,
};
