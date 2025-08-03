package terraform

import (
	"fmt"

	models "github.com/vky5/cloudsketch/models"
)

// every BlockGenerator has this generate func which takes in the generic Node type
// and it returns the terraform block string for given Node.
type BlockGenerator interface {
	Generate(node models.Node) (string, error)
}

// NodeMetadata stores info about each registered node type.
type NodeMetadata struct {
	Type           string
	DisplayName    string
	Category       string
	RequiredFields []string
	Generator      BlockGenerator
}

// registry maps node type (e.g., "ec2") to its metadata and generator.
var registry = make(map[string]NodeMetadata)

// register to add new node types to the registry
func Register(meta NodeMetadata) {
	if _, exists := registry[meta.Type]; exists {
		panic(fmt.Sprintf("Node type %s already registered", meta.Type))
	}
	registry[meta.Type] = meta
}

// GetGenerator returns the BlockGenerator for given node type (example ec2 getter for generator)
func GetGenerator(nodeType string) (BlockGenerator, bool) {
	meta, exists := registry[nodeType]
	return meta.Generator, exists
}

// utility func for getting list of all registered node types and their info
func GetAllMetaData() []NodeMetadata {
	var all []NodeMetadata
	for _, meta := range registry {
		all = append(all, meta)
	}
	return all
}

/*
We are using the Registry Pattern

Each of the resource will have different type of

we define different generator for different nodes and we register them corresponding to keys like ec2 for ec2 generator that uses ec2.tmpl to generate terraform
register it once using init() once and all other in the beginning and when we get the task to generate we just pick up
the right egenrarator func and generate
*/
