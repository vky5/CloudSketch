package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/vky5/cloudsketch/core/terraform"
	"github.com/vky5/cloudsketch/models"
)

// the paylaod from frontend
type GenerateRequest struct {
	NodeID string
	Type   string
	Data   map[string]any
}

// Response format
type GenerateResponse struct {
	Terraform string `json:"terraform"` // Terraform block
}

func GenerateTerraform(c *gin.Context) {
	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON input"})
		return
	}

	// Find generator for the node type
	generator, exists := terraform.GetGenerator(req.Type)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unknown node type"})
		return
	}

	// Wrap into models.Node struct
	node := models.Node{
		Type:   req.Type,
		Data:   req.Data,
		NodeID: req.NodeID,
	}

	// Generate Terraform block
	tfBlock, err := generator.Generate(node) // we separate the node.Data in the Generate func defined in templateGenerator
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Terraform"})
		return
	}

	// Return the generated block
	c.JSON(http.StatusOK, GenerateResponse{
		Terraform: tfBlock,
	})

}
