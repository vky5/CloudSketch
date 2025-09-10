package generator

import (
	"github.com/vky5/cloudsketch/core/terraform"
	"github.com/vky5/cloudsketch/models"
)

// Trying to match NodeMetaData type in registry.go
type GeneratorRegistration struct {
	NodeType       string // used by client to tell which template they need
	DisplayName    string
	Category       string                   // This is to tell what kind of
	RequiredFields []string                 // fields that are required (Not using in anyway rnn)
	Generator      terraform.BlockGenerator // a func which generates the
}

var generators = []GeneratorRegistration{
	{
		NodeType:       "ec2",
		DisplayName:    "EC2 Instance",
		Category:       "Compute",
		RequiredFields: []string{"Name", "AMI", "InstanceType"},
		Generator: TemplateGenerator[*models.EC2Config]{ // we are just defining a struct which implements Generate() func similar to BlockGenerator
			TemplatePath: "templates/ec2.tmpl",
		},
	},
	{
		NodeType:       "securitygroup",
		DisplayName:    "Security Group",
		Category:       "Resource",
		RequiredFields: []string{"Name", "NodeID"},
		Generator: TemplateGenerator[*models.SGConfig]{
			TemplatePath: "templates/sg.tmpl",
		},
	},
	{
		NodeType:       "keypair",
		DisplayName:    "Key Pair",
		Category:       "Resource",
		RequiredFields: []string{"Name", "PublicKey", "NodeID"},
		Generator: TemplateGenerator[*models.KeyPairConfig]{
			TemplatePath: "templates/kp.tmpl",
		},
	}, {
		NodeType:       "s3",
		DisplayName:    "S3 Bucket",
		Category:       "Storage",
		RequiredFields: []string{"BucketName", "NodeID"},
		Generator: TemplateGenerator[*models.S3Config]{
			TemplatePath: "templates/s3.tmpl",
		},
	}, {
		NodeType:       "iam",
		DisplayName:    "IAM",
		Category:       "Resource",
		RequiredFields: []string{"Name", "NodeID", "Services", "ManagedPolicies"},
		Generator: TemplateGenerator[*models.IAMConfig]{
			TemplatePath: "templates/iam.tmpl",
		},
	}, {
		NodeType:       "instanceprofile",
		DisplayName:    "Instance Profile",
		Category:       "Resource",
		RequiredFields: []string{"Name", "NodeID", "ParentRoleName"},
		Generator: TemplateGenerator[*models.InstanceProfileConfig]{
			TemplatePath: "templates/instance_profile.tmpl",
		},
	}, {
		NodeType:       "rds",
		DisplayName:    "RDS",
		Category:       "Database",
		RequiredFields: []string{"Name", "TagName", "NodeID"},
		Generator: TemplateGenerator[*models.RDSConfig]{
			TemplatePath: "templates/rds.tmpl",
		},
	}, {
		NodeType:       "ebs",
		DisplayName:    "Elastic Block Storage",
		Category:       "Storage",
		RequiredFields: []string{"Name", "VolumeType", "Size"},
		Generator: TemplateGenerator[*models.EBSConfig]{
			TemplatePath: "templates/ebs.tmpl",
		},
	}, {
		NodeType:       "ec2ebs",
		DisplayName:    "Attach EBS Volume to EC2",
		Category:       "Connection",
		RequiredFields: []string{"NodeID", "VolumeID", "DeviceName", "EC2NodeID"},
		Generator: TemplateGenerator[*models.AttachEBSConfig]{
			TemplatePath: "templates/attach_ebs.tmpl",
		},
	}, {
		NodeType:       "vpc",
		DisplayName:    "VPC",
		Category:       "VPC",
		RequiredFields: []string{"NodeID", "Name"},
		Generator: TemplateGenerator[*models.VPCConfig]{
			TemplatePath: "templates/vpc.tmpl",
		},
	},
}
