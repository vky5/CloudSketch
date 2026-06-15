# CloudSketch

An interactive web application for designing and sketching AWS cloud architectures visually, which compiles directly to Terraform.

## Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed.

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Backend URL (if utilizing a separate API for auth/database operations)
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

   # Clerk Authentication Credentials
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   # Database connection (MongoDB)
   MONGODB_URI=
   MONGODB_PASSWD=
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```text
├── public/                 # Next.js static assets
├── src/                    # Next.js Application Source
│   ├── app/                # Page routing & API endpoints
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
├── eslint.config.mjs       # Linting rules
├── next.config.ts          # Next.js configuration
├── package.json            # Scripts & dependencies
├── postcss.config.mjs      # CSS postprocessing
├── PROJECT_OVERVIEW.md     # Detailed project architectural overview
└── tsconfig.json           # TS configuration
```

## Tech Stack
- Next.js (App Router, TypeScript)
- xyflow (React Flow)
- Tailwind CSS
- Zustand
- Monaco Editor (for live Terraform editing)
- MongoDB