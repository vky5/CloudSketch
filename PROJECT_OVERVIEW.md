# CloudSketch Project Overview

**CloudSketch** is an interactive, visual cloud infrastructure design tool that allows developers to design and sketch AWS cloud architectures on a web-based canvas, validating connections dynamically and compiling the visual diagrams directly into **Terraform configuration blocks** in real-time.

---

## 🚀 Key Features

*   **Interactive Visual Canvas**: Drag, drop, position, and connect AWS resources on an interactive grid powered by [xyflow (React Flow)](https://xyflow.com/).
*   **Hierarchical Container Nesting**: 
    *   **Subnets within VPCs**: Subnets are constrained inside their parent VPC boundaries with collision/overlap prevention.
    *   **Auto-Binding Subnets**: Dragging and dropping compute/database nodes (e.g., EC2, RDS) directly inside a Subnet node automatically detects the drop and binds the resource's `SubnetID` config in the state. Dragging them out clears it.
*   **Dynamic Connection Validation**: Restricts connection lines based on cloud architecture rules (e.g., attaching EBS volume to an EC2 instance) with custom connection logic.
*   **Real-time Terraform Compilation**:
    *   **Template Evaluator**: Executes a custom template parser (`templateEvaluator.ts`) on the client side using static template strings (`awsTemplates.ts`) to render clean, valid HCL on the fly with zero latency.
*   **Interactive Code Editor**: Side-panel visualizer showing live-generated Terraform code synced with the canvas diagram state.

---

## 🛠️ Architecture & Tech Stack

*   **Framework**: Next.js (App Router, TypeScript)
*   **State Management**: Zustand (`useDiagramStore` for canvas state, `useTerraformStore` for generated code, `useUIPanelStore` for sidebar/editor toggles)
*   **Canvas Library**: `@xyflow/react` (xyflow)
*   **Authentication & Database**: Clerk Authentication, MongoDB database support.
*   **HTTP Client**: Axios

---

## 📁 Repository Directory Structure

```text
cloudsketch/
├── public/                 # Next.js static public assets
├── src/                    # Next.js Application Source
│   ├── app/                # App router routes & APIs (globals.css, layout, page, api/generate)
│   ├── components/         # React canvas & node component interfaces
│   ├── config/             # AWS Nodes, schemas, and resource config
│   ├── data/               # Static dataset definitions
│   ├── lib/                # Template compiler logic (`templateEvaluator.ts`)
│   ├── models/             # Schema definitions
│   ├── registry/           # Node mappings and template paths (`nodeRegistry.ts`)
│   ├── store/              # Zustand global state management
│   ├── templates/aws/      # Terraform `.tf.tmpl` template files
│   └── utils/              # Canvas sync and helper files
├── components.json         # UI component configs
├── eslint.config.mjs
├── next.config.ts
├── package.json            # Core Next.js configuration
├── postcss.config.mjs
├── PROJECT_OVERVIEW.md     # This documentation
├── README.md               # Quickstart guide
└── tsconfig.json           # TS configuration
```

---

## 📦 Supported Resource Types & Fields

Below are the currently supported cloud resources, their categorization, and core fields generated in Terraform:

| Resource Type | Canvas Category | Key Data Fields | Terraform Template File |
| :--- | :--- | :--- | :--- |
| **EC2 Instance** | Compute | `AMI`, `InstanceType`, `KeyName`, `SecurityGroups`, `SubnetID`, `Tags` | `src/templates/aws/ec2.tf.tmpl` |
| **S3 Bucket** | Storage | `BucketName`, `Versioning`, `PublicAccess` | `src/templates/aws/s3.tf.tmpl` |
| **RDS Instance** | Database | `Engine`, `InstanceClass`, `Username`, `Password`, `SubnetID` | `src/templates/aws/rds.tf.tmpl` |
| **Elastic Block Storage (EBS)** | Storage | `VolumeType`, `Size`, `AvailabilityZone` | `src/templates/aws/ebs.tf.tmpl` |
| **VPC** | Networking | `CIDRBlock`, `EnableDnsSupport`, `Tags` | `src/templates/aws/vpc.tf.tmpl` |
| **Subnet** | Networking | `CIDRBlock`, `ParentVpcId`, `AvailabilityZone`, `Tags` | `src/templates/aws/subnet.tf.tmpl` |
| **Security Group** | Resource / Security | `Name`, `InboundRules`, `OutboundRules` | `src/templates/aws/sg.tf.tmpl` |
| **Key Pair** | Resource / Security | `Name`, `PublicKey` | `src/templates/aws/kp.tf.tmpl` |
| **IAM Role** | Identity | `RoleName`, `Policies`, `AssumeRolePolicy` | `src/templates/aws/iam.tf.tmpl` |
| **Instance Profile** | Identity | `Name`, `ParentRoleName` | `src/templates/aws/instance_profile.tf.tmpl` |
| **EBS Attachment** | Connection | `VolumeID`, `EC2NodeID`, `DeviceName` | `src/templates/aws/attach_ebs.tf.tmpl` |

---

## ⚙️ Running Locally

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Clerk Credentials (For Auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database Connection (MongoDB)
MONGODB_URI=
MONGODB_PASSWD=
```

### 3. Start the Next.js Development Server
```bash
pnpm dev
```
The interface runs at [http://localhost:3000](http://localhost:3000).
