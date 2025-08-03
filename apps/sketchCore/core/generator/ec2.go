package generator

import (
	"bytes"
	"fmt"

	"github.com/vky5/cloudsketch/core/terraform"
	"github.com/vky5/cloudsketch/models"
)

type EC2Generator struct{}

func (g EC2Generator) Generate(node models.Node) (string, error) {
	ec2Config, err := models.MapToStruct[models.EC2Config](node.Data)
	if err != nil {
		return "", fmt.Errorf("Error mapping properties to EC2Config: %w", err)
	}

	// Injecting the NodeID
	ec2Config.NodeID = node.NodeID

	// Parse and execute the Terraform templates
	// tmpl, err := template.New("ec2").Parse()

	var buf bytes.Buffer

	return buf.String(), nil
}

func init() {
	terraform.Register(terraform.NodeMetadata{
		Type:        "ec2",
		DisplayName: "EC2 Instance",
		Category:    "Compute",
		RequiredFields: []string{
			"Name", "AMI", "InstanceType", "SecurityGroups",
		},
		Generator: EC2Generator{},
	})
}


