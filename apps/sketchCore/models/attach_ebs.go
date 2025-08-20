package models

// AttachEBSConfig represents the Terraform configuration for attaching an existing EBS volume to an EC2 instance
type AttachEBSConfig struct {
	EC2NodeID    string `json:"EC2NodeID"`             // UUID of the EC2 instance to attach to
	VolumeID     string `json:"VolumeID"`              // ID of the existing EBS volume
	DeviceName   string `json:"DeviceName,omitempty"`  // Device name on the instance (e.g., /dev/sdf)
	ForceDetach  bool   `json:"ForceDetach,omitempty"` // Optional: forcibly detach if already attached
	NodeID       string `json:"NodeID"`                // Internal tracking ID for CloudSketch
}

// SetNodeID sets the internal NodeID for tracking
func (a *AttachEBSConfig) SetNodeId(id string) {
	a.NodeID = id
}
