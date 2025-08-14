package models

type InstanceProfileConfig struct {
	Name           string `json:"Name"`
	ParentRoleName string `json:"ParentRoleName"`
	NodeID         string `json:"NodeID"`
}

func (ip *InstanceProfileConfig) SetNodeId(id string) {
	ip.NodeID = id
}
