package generator

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"

	"github.com/vky5/cloudsketch/models"
)

type TemplateGenerator[T models.NodeIdentifable] struct { // T can be of any time as long it has the SetNodeId Func
	TemplatePath string
}

// this is all thanks to implicit typing. unlike in ts we need to use implements or in java go checks if all the func are satisfied and if it does, that can be passed as NodeIdentifable. It can be used to limit that any type that is being passed as 
// The generic type must have this

// Generic template for terraform generation
func (g TemplateGenerator[T]) Generate(node models.Node) (string, error) {
	// converting generic map in Node.Data to map that satisfies the template being passed
	config, err := models.MapToStruct[T](node.Data)
	if err != nil {
		return "", fmt.Errorf("error mapping properties to EC2Config: %w", err)
	}

	// injecting the NodeId (not doing it in MapToStruct)
	config.SetNodeId(node.NodeID)

	// Load template from file
	absPath, err := filepath.Abs(g.TemplatePath)
	if err != nil {
		return "", fmt.Errorf("failed to resolve template path: %w", err)
	}

	tmpl, err := template.ParseFiles(absPath)
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}

	// execute the template using config (meaing filling in the data into templates)
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, config); err != nil {
		return "", fmt.Errorf("failed to render template: %w", err)
	}

	return buf.String(), nil
}


/*
Question?? How is Generator able to take EC2Generator as its type??

Reason is simple implcit typing....

In EC2Generator we typed earlier was empty interface but later we defined generat func to it
this makes it equialent to BlockGenerator which only requires this method...I

Any type that has all the methods required by an interface automatically implements it.

// EC2Generator implements BlockGenerator interface after we define Generate func
type EC2Generator struct{}

func (g EC2Generator) Generate(node models.Node) (string, error) {

*/
