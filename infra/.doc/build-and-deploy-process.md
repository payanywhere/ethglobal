# Build and Deployment Process

This document explains how the build and deployment process works for the `payanywhere` project using **Terraform**, **Google Cloud Build**, and **Cloud Run**.

It assumes the repository is already configured following the setup in [`infrastructure-deployment-guide.md`](./infraestracture-deployment-guide.md).

## 1. Overview

The project uses a **monorepo** structure with a single branch (`main`) and automated build pipelines managed by **Terraform** and **Cloud Build**.

Terraform defines and maintains:
- All **Cloud Build triggers**
- All **Cloud Run services**
- Infrastructure components (buckets, secrets, IAM, etc.)

| Component | Location | Build File | Trigger |
|------------|-----------|------------|----------|
| Infrastructure | `/infra` | `infra/cloudBuild.yaml` | `deploy-infra-dev` |
| Backend | `/back` | `back/cloudBuild.yaml` | `deploy-back-dev` |
| Frontend | `/front` | `front/cloudBuild.yaml` | `deploy-front-dev` |

All builds run in the same GCP project (`payanywhere`) but operate on isolated resources defined through Terraform.

## 2. Deployment Flow

Whenever code is pushed to the `main` branch:

1. **GitHub → Cloud Build Trigger**  
   Terraform-created triggers detect which folder changed and start the corresponding Cloud Build job.

2. **Cloud Build execution**
   - Runs the YAML from `/infra/`, `/back/`, or `/front/`.
   - Each pipeline runs in an isolated container.
   - Logs are stored under **Cloud Build → History**.

3. **Service Account Authentication**  
   Builds use a Service Account key stored in **Secret Manager** and injected as `GOOGLE_APPLICATION_CREDENTIALS`.

4. **Pipeline types**
   - **Infrastructure (`infra`)** → runs Terraform (`init`, `validate`, `plan`, `apply`).
   - **Backend (`back`)** → builds and deploys the backend Docker image to Cloud Run.
   - **Frontend (`front`)** → builds and deploys the frontend Docker image to Cloud Run.

5. **Completion**
   - On success, Cloud Run automatically serves the new revision.
   - On failure, logs remain available for troubleshooting.

## 3. Rollbacks and Versioning

- **Cloud Run** keeps historical revisions of every deployment.  
  Roll back by selecting a previous revision and redeploying.  
- **Terraform** state files are versioned in GCS; reverting to an earlier commit restores the corresponding infrastructure.

## 4. Typical Workflow

1. Modify code or Terraform configs.
2. Commit and push to `main`.
3. Cloud Build runs the appropriate pipeline automatically.
4. Verify the result in:
   - **Cloud Build → History**
   - **Cloud Run → Revisions**

## 5. Monitoring

| Tool | Purpose |
|------|----------|
| **Cloud Build → History** | Logs and build results |
| **Artifact Registry** | Stores container images |
| **Cloud Run** | Hosts backend and frontend |
| **Cloud Storage** | Stores Terraform state files |
| **Secret Manager** | Stores Service Account keys |

## 6. Key Points

- **Fully automated:** Each push to `main` triggers Terraform and Cloud Run deployments.  
- **Managed by Terraform:** Triggers, services, IAM roles, and resources are defined as code.  
- **Reproducible:** Same commit = same deployment.  
- **Environment isolation:** Each environment uses its own bucket, secrets, and variables.  
- **No manual steps:** Even Cloud Build triggers and Cloud Run services are declarative.

Note: Domain mapping for Cloud Run custom domains still requires a one-time manual command as described in the Infrastructure Deployment Guide.
