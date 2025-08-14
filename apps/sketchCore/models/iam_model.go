package models

type IAMConfig struct {
	Name            string   `json:"Name"`
	Services        []string `json:"Services"`
	ManagedPolicies []string `json:"ManagedPolicies"`
	CustomPolicies  []string `json:"CustomPolicies,omitempty"`
	NodeID          string   `json:"NodeID"`
}

func (sg *IAMConfig) SetNodeId(id string) {
	sg.NodeID = id
}
