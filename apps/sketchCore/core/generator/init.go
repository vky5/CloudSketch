package generator

import "github.com/vky5/cloudsketch/core/terraform"

func init() { // this func gets automatically called when we import the generator package anywhere
	for _, gen := range generators {
		terraform.Register(terraform.NodeMetadata{
			Type:           gen.NodeType,
			DisplayName:    gen.DisplayName,
			Category:       gen.Category,
			RequiredFields: gen.RequiredFields,
			Generator:      gen.Generator,
		})
	}
}


// this will run the loop over all the generators and this will register all the generator func along with NodeType and other categories