package models

import "fmt"

type InstanceProfileConfig struct {
	Name           string `json:"Name"`
	ParentRoleName string `json:"ParentRoleName"`
	NodeID         string `json:"NodeID"`
}

func (ip *InstanceProfileConfig) SetNodeId(id string) {
	fmt.Print(*ip)
	ip.NodeID = id
}
