package models

type S3Config struct {
	BucketName   string `json:"BucketName"`
	NodeID       string `json:"NodeID"`
}

func (s3 *S3Config) SetNodeId(id string) {
	s3.NodeID = id
}
