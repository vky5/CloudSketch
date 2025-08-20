package models

// EBSConfig represents the Terraform config for EBS Volume
type EBSConfig struct {
	Name                string `json:"Name"`                          // Terraform resource name
	VolumeType          string `json:"VolumeType"`                    // e.g., gp2, gp3, io1
	Size                int    `json:"Size"`                          // Volume size in GB
	AvailabilityZone    string `json:"AvailabilityZone"`              // The AZ in which to create the volume
	SnapshotId          string `json:"SnapshotId,omitempty"`          // Optional snapshot to create volume from
	Iops                int    `json:"Iops,omitempty"`                // Only for io1/io2
	Throughput          int    `json:"Throughput,omitempty"`          // Only for gp3
	MultiAttachEnabled  bool   `json:"MultiAttachEnabled,omitempty"`  // Allow multiple attachments
	Encrypted           bool   `json:"Encrypted,omitempty"`           // Whether the volume is encrypted
	DeleteOnTermination bool   `json:"DeleteOnTermination,omitempty"` // Delete volume when instance terminates
	DeviceName          string `json:"DeviceName,omitempty"`          // e.g., /dev/sdh
	InstanceId          string `json:"InstanceId,omitempty"`          // For attachment
	TagName             string `json:"TagName,omitempty"`             // Optional tag for volume
	NodeID              string `json:"NodeID"`                        // Injected for tracking
}

func (e *EBSConfig) SetNodeId(id string) {
	e.NodeID = id
}
