package models

// EC2Properties represents the Terraform config for EC2
type EC2Config struct {
	Name           string   `json:"Name"`               // Terraform resource name
	AMI            string   `json:"AMI"`                // AMI ID
	InstanceType   string   `json:"InstanceType"`       // e.g., t2.micro
	SecurityGroups []string `json:"SecurityGroups"`     // SG IDs
	KeyName        string   `json:"KeyName,omitempty"`  // Optional SSH key
	SubnetID       string   `json:"SubnetID,omitempty"` // Optional subnet
	TagName        string   `json:"TagName"`            // AWS instance tag
	NodeID         string   `json:"NodeID"`             // Injected for tracking
}

// since EC2Config has now declared SetNodeId it can be passed to the NodeIdentifable type 
// That doesnt care about extra fields it has
func (e *EC2Config) SetNodeId(id string) {
	e.NodeID = id
}
