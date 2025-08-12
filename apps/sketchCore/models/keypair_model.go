package models

type KeyPairConfig struct {
	KeyName   string `json:"Name"`      // to set the Name type to keyname
	PublicKey string `json:"PublicKey"` // to set the PublicKey
	NodeID    string `json:"NodeID"`
}

func (kp *KeyPairConfig) SetNodeId(id string) {
	kp.NodeID = id
}
