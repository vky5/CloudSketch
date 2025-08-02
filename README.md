# CloudSketch

| Node Type       | Key Fields (`node.data`)                                      |
| --------------- | ------------------------------------------------------------- |
| EC2 Instance    | `ami`, `instance_type`, `key_name`, `security_groups`, `tags` |
| Lambda Function | `function_name`, `runtime`, `handler`, `memory_size`          |
| S3 Bucket       | `bucket_name`, `versioning`, `public_access`                  |
| EBS Volume      | `size`, `volume_type`, `availability_zone`                    |
| RDS Instance    | `engine`, `instance_class`, `username`, `password`            |
| VPC             | `cidr_block`, `enable_dns_support`, `tags`                    |
| Load Balancer   | `type`, `listeners`, `target_groups`                          |
| Security Group  | `name`, `inbound_rules`, `outbound_rules`                     |
| IAM Role        | `role_name`, `policies`, `assume_role_policy`                 |

