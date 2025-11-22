# Infrastructure Deployment Guide

This document describes how to set up and deploy a multi-environment infrastructure (dev, test, prod) for the `payanywhere` project using **Terraform** and **Google Cloud Build**.

It assumes only basic familiarity with command lines. Every step is explained in order, from creating service accounts to verifying deployments.

> **Note:**  
> All commands in this guide are written for **Windows PowerShell**.  
> If you are using another shell:
>
> - **Linux / macOS (Bash):**  
>   Use `export VAR=value` and reference variables as `$VAR`.
> - **Windows CMD:**  
>   Use `set VAR=value` and reference as `%VAR%`.
> - **PowerShell:**  
>   Use `$env:VAR = "value"` and reference as `$env:VAR`.

## 1. Repository Structure

Your GitHub repository (`github.com/payanywhere/ethglobal`) should look like this:

```bash
/back           → Bun Typescript backend
/front          → React frontend
/infra          → Terraform configuration and pipelines
```

Each environment (dev, test, prod) uses the same **Google Cloud project** (`payanywhere`) but isolates resources using different variables, buckets, and secrets.

## 2. Required Tools

Before starting, install the following:

- [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install)
- [Terraform](https://developer.hashicorp.com/terraform/downloads)
- Git and a terminal (PowerShell, CMD, or Bash)

Ensure you are authenticated and have access to project `PayAnyWhere`:

```bash
gcloud auth login
gcloud projects list

# That must show something like this:
# PROJECT_ID            NAME             PROJECT_NUMBER
# payanywhere           PayAnyWhere      823735889607
```

You can change the default project setting by running:

```bash
gcloud config set project payanywhere
```

## 3. Connect GitHub

**Important:**
Google Cloud requires a one-time manual authorization of the **Cloud Build GitHub App** and the creation of a **connection host**.
These two steps cannot be automated through CLI or Terraform due to GitHub OAuth policies.
Once completed, all subsequent setup is managed via CLI or Terraform.

### Understanding GitHub Integrations in Cloud Build

Before continuing, it’s important to understand that Google Cloud currently supports **two generations of GitHub integrations**, and **they are not interchangeable**:

#### **First Generation (Legacy OAuth App)**

* Shown in the GCP Console as **“GitHub (legacy OAuth App)”**.
* Uses OAuth tokens for authentication.
* Appears under **Cloud Build → Triggers → Connect Repository** (old UI).
* Terraform uses the classic `google_cloudbuild_trigger` with a `github { owner, name, push { ... } }` block.
* Works with both public and private repositories.
* **Visible when:** you open *Cloud Build → Triggers → Connect Repository → GitHub (legacy OAuth App)*.
* **This integration is being deprecated**, but still works if you created your connection this way.

#### **Second Generation (GitHub App)**

* Shown in the GCP Console as **“GitHub (App)”**.
* Uses a **GitHub App installation** (no OAuth tokens).
* Repositories appear under **Cloud Build → Repository Connections** (new UI).
* Terraform must use `google_cloudbuild_trigger` with a `repository_event_config` block and the full Cloud Build resource path:
  `projects/<PROJECT_ID>/locations/<REGION>/connections/<CONNECTION_NAME>/repositories/<REPO_NAME>`.
* Recommended for all new configurations.
* **Visible when:** you open *Cloud Build → Repository Connections* and see entries like
  `projects/payanywhere/locations/us-central1/connections/payanywhere-repo/repositories/payanywhere-ethglobal_temp`.

> ⚠️ **Critical:**
>
> * If your repository is connected via **GitHub (App)** (2nd gen), your Terraform must use `repository_event_config`.
> * If your repository uses the **Legacy OAuth App**, your Terraform must use the old `github { ... }` block.
> * Mixing the wrong type causes `Error 400: Request contains an invalid argument`.

Follow these steps to authorize and create the GitHub connection host:

1. Open the following link in your browser to access your project’s repository connections:
   [https://console.cloud.google.com/cloud-build/repositories?project=823735889607](https://console.cloud.google.com/cloud-build/repositories?project=823735889607)

2. Click **“Create connection host”** and choose **GitHub (App)** as the connection type.

3. Select your GitHub account or organization (for example, `payanywhere`) and approve the **Cloud Build GitHub App** installation.

4. When the authorization completes, Google Cloud will create a connection host (for example, `payanywhere-repo`) under:
   **Cloud Build → Repository Connections**

5. The connection host region depends on what you selected during creation (usually `us-central1` or `global`).
   This region must match in every CLI command that uses `--region` later.

You can verify the connection host and its region with:

```bash
gcloud builds connections list --region=us-central1 --project=$env:PROJECT_ID
```

You should see something like:

```bash
NAME              INSTALLATION_STATE  DISABLED
payanywhere-repo  COMPLETE            Enabled
```

Once the host connection is visible, note both its **name** and **region**.
You will need these exact values when registering repositories and creating triggers.


## 4. Register the GitHub Repository

After confirming the connection host, register your repository.
Replace the values for `--connection` and `--region` with those from the previous step (for example, `payanywhere-repo` and `us-central1`).

```bash
$env:CONNECTION_NAME = "payanywhere-repo"
$env:REPO_NAME = "ethglobal"

gcloud services enable serviceusage.googleapis.com  cloudresourcemanager.googleapis.com `
  cloudbuild.googleapis.com  artifactregistry.googleapis.com  secretmanager.googleapis.com `
  --project $env:PROJECT_ID

gcloud builds repositories create $env:REPO_NAME `
  --connection=$env:CONNECTION_NAME `
  --region=us-central1 `
  --remote-uri="https://github.com/payanywhere/$env:REPO_NAME.git" `
  --project=$env:PROJECT_ID
```

Verify that the repository was registered correctly:

```bash
gcloud builds repositories list --connection=$env:CONNECTION_NAME --region=us-central1 --project=$env:PROJECT_ID
```

Expected output:

```bash
NAME                        REMOTE_URI
payanywhere-ethglobal  https://github.com/payanywhere/ethglobal.git
```

If this command succeeds, your repository is now linked to Google Cloud Build and ready for automated triggers.


### ✅ Summary: How to Recognize Which Integration You’re Using

| Aspect               | First Generation (Legacy OAuth)             | Second Generation (GitHub App)       |
| -------------------- | ------------------------------------------- | ------------------------------------ |
| **Console path**     | Cloud Build → Triggers → Connect Repository | Cloud Build → Repository Connections |
| **Auth type**        | OAuth token                                 | GitHub App installation              |
| **Terraform config** | `github { owner, name, push }`              | `repository_event_config`            |
| **Repo identifier**  | GitHub owner + repo name                    | Full Cloud Build resource path       |
| **API**              | Cloud Build v1                              | Cloud Build v2                       |
| **Status**           | Deprecated / Legacy                         | Recommended for new projects         |

## 5. Define Environment Variables

In **PowerShell**:

```bash
$env:PROJECT_ID = "payanywhere"
$env:SA_NAME = "paw-terraform-sa-dev"
$env:SA_EMAIL = "$($env:SA_NAME)@$($env:PROJECT_ID).iam.gserviceaccount.com"
```

These variables will be reused in multiple commands.

## 6. Enable Base APIs (one-time setup with your owner account)

> **Important:**
> Before the Service Account can enable or manage any APIs, two core APIs must be activated **manually once per project**:
>
> * `cloudresourcemanager.googleapis.com`
> * `serviceusage.googleapis.com`
>
> These cannot be enabled programmatically until they are active.

Run the following commands **once** using your personal account (with Project Owner permissions):

```bash
gcloud services enable serviceusage.googleapis.com cloudresourcemanager.googleapis.com --project $env:PROJECT_ID
```

After this, the Service Account will be able to activate and manage all other APIs automatically.

## 7. Create Service Accounts

Create one Service Account per environment.
They will allow Terraform and Cloud Build to deploy resources securely.

```bash
gcloud iam service-accounts create $env:SA_NAME --project $env:PROJECT_ID --display-name "Terraform SA DEV"
```

## 8. Assign Roles and Permissions

Each Service Account needs access to manage Compute, Networking, Cloud Run, Secrets, and more.

```bash
$roles = @(
  "roles/run.admin",
  "roles/iam.serviceAccountUser",
  "roles/storage.admin",
  "roles/secretmanager.admin",
  "roles/compute.networkAdmin",
  "roles/compute.loadBalancerAdmin",
  "roles/cloudsql.admin",
  "roles/aiplatform.admin",
  "roles/pubsub.admin",
  "roles/cloudbuild.builds.editor",
  "roles/dns.admin",
  "roles/serviceusage.serviceUsageAdmin",
  "roles/resourcemanager.projectIamAdmin",
  "roles/secretmanager.secretAccessor",
  "roles/editor",
  "roles/artifactregistry.admin"
)

if (-not $env:PROJECT_ID -or -not $env:SA_EMAIL) {
  Write-Error "Missing required environment variables: PROJECT_ID or SA_EMAIL"
  exit 1
}

foreach ($role in $roles) {
  Write-Host "Assigning $role to $env:SA_EMAIL..."
  gcloud projects add-iam-policy-binding $env:PROJECT_ID `
    --member "serviceAccount:$env:SA_EMAIL" `
    --role $role `
    --condition=None
}
```

These two additional roles are critical:

* **`serviceusage.serviceUsageAdmin`** → allows the Service Account to enable or disable any API.
* **`resourcemanager.projectIamAdmin`** → allows the Service Account to update IAM policies as needed.

Repeat for `test` and `prod`, changing only the Service Account name.

## 9. Create Remote State Buckets

Terraform stores its state files (records of deployed resources) in Google Cloud Storage.
Create a separate bucket for each environment:

```bash
gsutil mb -p $env:PROJECT_ID -l us-central1 gs://paw-tf-state-dev/
gsutil mb -p $env:PROJECT_ID -l us-central1 gs://paw-tf-state-test/
gsutil mb -p $env:PROJECT_ID -l us-central1 gs://paw-tf-state-prod/
```

## 10. Create and Store Service Account Keys

Terraform will authenticate using a key stored securely in **Secret Manager**.

```bash
gcloud iam service-accounts keys create sa-key-dev.json --iam-account=$env:SA_EMAIL --project=$env:PROJECT_ID
gcloud secrets create paw-terraform-sa-dev-key --project=$env:PROJECT_ID --data-file=sa-key-dev.json
Remove-Item sa-key-dev.json
```
Repeat for `test` and `prod` (rename the secret accordingly).

## 11. Terraform Configuration Files

Terraform files live under `/infra/`.
Before automating deployments, test locally to confirm Terraform works correctly.

> **Important:**
> Terraform does **not** use any local JSON key file.
> Credentials are stored securely in **Secret Manager** and must be injected dynamically when running Terraform.
> This is the same method used by Cloud Build, ensuring no local secrets are created.

### Retrieve credentials from Secret Manager

In **PowerShell**, fetch the secret directly and pass it inline to Terraform:

```bash
cd infra
$secret = gcloud secrets versions access latest --secret=paw-terraform-sa-dev-key --project $env:PROJECT_ID --format="get(payload.data)" | Out-String
terraform init -backend-config="bucket=paw-tf-state-dev" -backend-config="prefix=terraform/state"
terraform validate
terraform plan -var-file="./envs/dev.tfvars" -var "google_credentials=$secret"
terraform apply -var-file="./envs/dev.tfvars" -var "google_credentials=$secret" -auto-approve

cd ../back
gcloud builds submit --tag us-central1-docker.pkg.dev/payanywhere/back/back:latest

cd ../front
gcloud builds submit --tag us-central1-docker.pkg.dev/payanywhere/front/front:latest
```

This method authenticates Terraform using the **Service Account key stored in Secret Manager**, without ever creating or storing a JSON file locally.

To remove all resources:

```bash
terraform destroy -var-file="./envs/dev.tfvars" -var "google_credentials=$secret" -auto-approve
```

## 12. Configure Cloud DNS and Custom Domains

Terraform automatically provisions:

* A managed DNS zone (`payanywhere-zone`)
* DNS records for:

  * `payanywhere.com.ar` → frontend (landing)
  * `api.payanywhere.com.ar` → backend (API)
* Cloud Run domain mappings and managed SSL certificates

Only one manual action is required: delegate your domain to Google Cloud DNS.

1. Verify that the managed zone exists:

```bash
gcloud dns managed-zones list --project payanywhere
```

2. Retrieve the Google Cloud DNS nameservers:

```bash
gcloud dns record-sets list --zone payanywhere-zone --project payanywhere --type=NS
```

3. Log in to your registrar (for example **nic.ar**) and replace the current nameservers with the ones provided by Google Cloud:

```bash
ns-cloud-a1.googledomains.com
ns-cloud-a2.googledomains.com
ns-cloud-a3.googledomains.com
ns-cloud-a4.googledomains.com
```

After DNS propagation (typically within 5–10 minutes), confirm that the domain mappings and certificates are active:

```bash
gcloud run domain-mappings list --project payanywhere
```

Once active, your services will be accessible via HTTPS:

* **Frontend:** `https://payanywhere.com.ar`
* **Backend:** `https://api.payanywhere.com.ar`

## 13. Validate the Setup

After triggers are created:

1. Open **Cloud Build → Triggers** in the GCP Console.
2. Run each trigger manually (`Run Trigger`).
3. Check logs under **Cloud Build → History**.
4. Confirm that:

   * Terraform applies without error.
   * The state bucket updates.
   * Backend and Frontend services deploy successfully in Cloud Run.

