package models

// SGConfig defines the configuration of a Security Group in AWS.
type SGConfig struct {
	Name        string `json:"Name"`                  // The name of the Security Group
	Description string `json:"Description,omitempty"` // A description of the Security Group
	VpcID       string `json:"VpcID,omitempty"`       // The ID of the VPC where this Security Group exists

	// IngressRules are inbound traffic rules that control what traffic is allowed to reach resources.
	IngressRules []SGRule `json:"IngressRules,omitempty"`

	// EgressRules are outbound traffic rules that control what traffic resources can send out.
	EgressRules []SGRule `json:"EgressRules,omitempty"`
	NodeID      string   `json:"NodeID"`
}

// SGRule defines an individual ingress or egress rule for a Security Group.
type SGRule struct {
	CidrIPv4 string `json:"CidrIPv4"` // IPv4 CIDR block (e.g., "0.0.0.0/0")
	CidrIPv6 string `json:"CidrIPv6"` // IPv6 CIDR block (e.g., "::/0")
	FromPort int    `json:"FromPort"` // Start of the allowed port range
	ToPort   int    `json:"ToPort"`   // End of the allowed port range
	Protocol string `json:"Protocol"` // Protocol (e.g., "tcp", "udp", "-1" for all)
}

func (sg *SGConfig) SetNodeId(id string) {
	sg.NodeID = id
}
