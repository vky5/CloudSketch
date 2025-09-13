package models

// SubnetConfig represents the Terraform config for Subnet
type SubnetConfig struct {
	NodeID             string `json:"NodeID"`                        // Injected for tracking
	UUID               string `json:"UUID"`                          // Internal Terraform block label
	ParentVpcId        string `json:"ParentVpcId"`                   // Reference to parent VPC
	Name               string `json:"Name"`                          // Subnet name (required)
	CIDR               string `json:"CIDR"`                          // CIDR block (required)
	AvailabilityZone   string `json:"AvailabilityZone,omitempty"`    // Optional availability zone
	MapPublicIpOnLaunch string `json:"MapPublicIpOnLaunch,omitempty"` // Auto-assign Public IP ("yes"/"no")
	Tags               string `json:"Tags,omitempty"`                // Optional tags
}

// SetNodeId implements NodeIdentifiable interface
func (s *SubnetConfig) SetNodeId(id string) {
	s.NodeID = id
}
