package models

// RDSConfig represents the Terraform config for AWS RDS
type RDSConfig struct {
	Name             string   `json:"Name"`                       // Terraform resource name
	AllocatedStorage int      `json:"AllocatedStorage,omitempty"` // Default 20
	StorageType      string   `json:"StorageType,omitempty"`      // Default "gp2"
	Engine           string   `json:"Engine,omitempty"`           // e.g., postgres
	EngineVersion    string   `json:"EngineVersion,omitempty"`    // Default "15.3"
	InstanceClass    string   `json:"InstanceClass,omitempty"`    // Default "db.t3.micro"
	DBName           string   `json:"DBName,omitempty"`           // Initial database name
	Username         string   `json:"Username,omitempty"`         // DB username
	Password         string   `json:"Password,omitempty"`         // DB password
	SecurityGroups   []string `json:"SecurityGroups,omitempty"`   // Security group *names* (expanded in template)
	SubnetGroupName  string   `json:"SubnetGroupName,omitempty"`  // Optional subnet group
	TagName          string   `json:"TagName"`                    // AWS tag: Name
	NodeID           string   `json:"NodeID"`                     // Injected for tracking
}

// So it can be used with NodeIdentifiable
func (r *RDSConfig) SetNodeId(id string) {
	r.NodeID = id
}
