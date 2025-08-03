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
