package generator

import (
	"github.com/vky5/cloudsketch/core/terraform"
	"github.com/vky5/cloudsketch/models"
)

type GeneratorRegistration struct {
	NodeType       string
	DisplayName    string
	Category       string
	RequiredFields []string
	Generator      terraform.BlockGenerator
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
}
