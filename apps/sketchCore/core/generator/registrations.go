package generator

import (
	"github.com/vky5/cloudsketch/core/terraform"
	"github.com/vky5/cloudsketch/models"
)

// Trying to match NodeMetaData type in registry.go
type GeneratorRegistration struct {
	NodeType       string // used by client to tell which template they need
	DisplayName    string
	Category       string // This is to tell what kind of 
	RequiredFields []string // fields that are required (Not using in anyway rnn)
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
		NodeType: "sg", 
		DisplayName: "Security Group",
		Category: "Resource",
		RequiredFields: []string{"Name"},
		Generator: TemplateGenerator[*models.SGConfig]{
			TemplatePath: "templates/sg.tmpl",
		},
	},
}
