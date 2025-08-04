package models

// Node represents a generic node sent from frontend
type Node struct {
	Type   string         `json:"type"`   // e.g., "ec2", "rds", etc.
	NodeID string         `json:"nodeID"` // Unique uuid each node have
	Data   map[string]any `json:"Data"`   // Actual config fields for each resource... diferent
}

// defining a generic type with SetNodeId() func to be used here
type NodeIdentifable interface {
	SetNodeId(string)
}
