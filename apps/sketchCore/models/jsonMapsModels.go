package models

import "encoding/json"

// takes in general interface in form of JSON from body and converst it to EC2Config struct
func MapToStruct[T any](props map[string]any) (T, error) {
	var result T
	jsonData, err := json.Marshal(props)
	if err != nil {
		return result, err
	}

	// because func sign of unMarshal is Unmarshal(jsonData, v any) // and v is supposed to be overwriten
	if err := json.Unmarshal(jsonData, &result); err != nil {
		return result, err
	}

	return result, nil
}

/*
// we aare using BindJson for json coming from the frontend it automatically sets nodeId and other property
// because the structure of node is gonna be like this
```
{
  "type": "ec2",
  "nodeID": "ec2-abc123",
  "Data": {
    "Name": "myInstance",
    "AMI": "ami-123",
    "InstanceType": "t2.micro"
  }
}
```
node model has nodeId tye and data. When we bind, it converts to

```
node.Type == "ec2"
node.NodeID == "ec2-abc123"
node.Properties == map[string]any{
    "Name": "myInstance",
    "AMI": "ami-123",
    "InstanceType": "t2.micro",
    "SecurityGroups": []any{"sg-1", "sg-2"},
    "KeyName": "my-key",
}
```

and we do this

var node models.Node
if err := c.BindJSON(&node); err != nil {
    // handle error
}

// Now convert node.Data → EC2Config
ec2Config, err := models.MapToEC2Config(node.Data, node.NodeID)

bindJson converts JSON to properties that's why we first convert it to json then
unMarshal it. But even then there is a chance it

BindJson works only with request body because it is from gin package

*/
