package generator

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"

	"github.com/vky5/cloudsketch/core/terraform"
	"github.com/vky5/cloudsketch/models"
)

// Path to template file
const ec2Template = "templates/ec2.tmpl"

// EC2Generator implements BlockGenerator interface after we define Generate func
type EC2Generator struct{}

func (g EC2Generator) Generate(node models.Node) (string, error) {

	// Converting Generic Map in Node.Data to mapped EC2
	ec2Config, err := models.MapToStruct[models.EC2Config](node.Data)
	if err != nil {
		return "", fmt.Errorf("error mapping properties to EC2Config: %w", err)
	}

	// Injecting the NodeID (cant do it in MapToStruct)
	ec2Config.NodeID = node.NodeID

	// Load template from file
	absPath, err := filepath.Abs(ec2Template)
	if err != nil {
		return "", fmt.Errorf("failed to resolve template path: %w", err)
	}

	tmpl, err := template.ParseFiles(absPath)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	
	// Execute the template using ec2Config
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, ec2Config); err != nil {
		return "", fmt.Errorf("failed to render template: %w", err)
	}

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

/*
Question?? How is Generator able to take EC2Generator as its type??

Reason is simple implcit typing....

In EC2Generator we typed earlier was empty interface but later we defined generat func to it
this makes it equialent to BlockGenerator which only requires this method...I

Any type that has all the methods required by an interface automatically implements it.
*/
