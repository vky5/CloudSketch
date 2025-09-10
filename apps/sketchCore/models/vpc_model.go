package models

type VPCConfig struct {
	Name      string `json:"Name"`
	CIDR      string `json:"CIDR"`
	EnableDNS string `json:"EnableDNS"`
	NodeID    string `json:"NodeID"`
}

func (vpc *VPCConfig) SetNodeId(id string) {
	vpc.NodeID = id
}



