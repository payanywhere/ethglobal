![](https://img.shields.io/badge/Terraform-informational?style=flat&logo=terraform&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/Google_Cloud-informational?style=flat&logo=googlecloud&logoColor=white&color=6aa6f8)

# PayAnyWhere Infrastructure

## Overview

The infrastructure layer provides:

* **Multi-environment setup** (development, test, production) managed with separate Terraform state buckets.
* Automated deployments for backend, frontend, and infrastructure changes via **Cloud Build triggers** managed by **Terraform**.
* Service Accounts, Artifact Registry, Pub/Sub topics, Cloud Run services, and Cloud Build triggers provisioned through Terraform.
* Remote state stored securely in GCS per environment.
* **DNS Management:** Cloud DNS managed via Terraform, linking _payanywhere.com.ar_ and _api.payanywhere.com.ar_ to Cloud Run services.

## Structure

```bash
infra/
├── cloudBuild.yaml          # Cloud Build pipeline for infrastructure
├── envs/                    # Environment variable files (.tfvars) for dev/test/prod
├── main.tf                  # Core configuration and environment loader
├── variables.tf             # Common variable definitions
└── outputs.tf               # Shared outputs across environments
```

## Tech Stack

* **Infrastructure as Code:** [Terraform](https://www.terraform.io/)
* **Cloud Provider:** [Google Cloud Platform](https://cloud.google.com/)
* **CI/CD:** Google Cloud Build
* **Remote State:** Google Cloud Storage (GCS)

## Getting Started

### 1. Initialize Terraform

```bash
terraform init -backend-config="bucket=paw-tf-state-dev" -backend-config="prefix=terraform/state"
```

### 2. Validate Configuration

```bash
terraform validate
```

### 3. Plan Changes

```bash
terraform plan -var-file="./envs/dev.tfvars"
```

### 4. Apply Changes

```bash
terraform apply -var-file="./envs/dev.tfvars" -auto-approve
```

### 5. Destroy Environment

```bash
terraform destroy -var-file="./envs/dev.tfvars" -auto-approve
```

## Environments

| Environment | State Bucket             | Purpose                           |
| ----------- | ------------------------ | --------------------------------- |
| **dev**     | `gs://paw-tf-state-dev`  | Developer sandbox, fast iteration |
| **test**    | `gs://paw-tf-state-test` | Pre-production validation         |
| **prod**    | `gs://paw-tf-state-prod` | Production-grade deployment       |

Each environment has its own `.tfvars` file, service account, and Cloud Build trigger configuration.

## Cloud Build

The infrastructure is deployed automatically through a Cloud Build trigger managed by Terraform.
To run it manually, use:

```bash
gcloud builds submit --config infra/cloudBuild.yaml
```

This pipeline runs Terraform commands (`init`, `validate`, `plan`, and `apply`) inside a Cloud Build container using credentials from Secret Manager.

## Code Quality

Terraform formatting and validation use built-in commands:

```bash
terraform fmt -recursive
terraform validate
```

## Detailed Setup

Detailed setup and operational documentation are available in the `.doc/` folder:

* [Infrastructure Deployment Guide](./.doc/infraestracture-deployment-guide.md)
  *Step-by-step instructions for setting up Terraform, Service Accounts, and Cloud Build triggers.*

* [Build and Deployment Process](./.doc/build-and-deploy-process.md)
  *Explains what happens when a commit is pushed, how builds run, and how deployments are executed automatically.*

```
