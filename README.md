0# CloudSketch

## To Run Frontend
```bash
cd apps/web
pnpm install
pnpm run start
```

.env file
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080


# Clerk Credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=


#Database
MONGODB_PASSWD=

MONGODB_URI=
```

## To run backend
```bash
cd apps/sketchCore
go run ./cmd
```


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

# Tech stack
- xyflow 
- terraform
- nextjs
- s3