variable "project_id" {
  description = "The GCP project ID where resources will be deployed."
  type        = string
}

variable "region" {
  description = "The default GCP region used by Terraform-managed resources."
  type        = string
  default     = "us-central1"
}

variable "env" {
  description = "Deployment environment identifier (e.g., dev, test, prod)."
  type        = string
}

variable "bucket_name" {
  description = "Name of the GCS bucket used for Terraform remote state."
  type        = string
}

variable "sa_email" {
  description = "Terraform Service Account email for this environment."
  type        = string
}

variable "domain_name" {
  description = "Root domain name managed in Cloud DNS."
  type        = string
}

variable "front_service_url" {
  description = "Frontend Cloud Run service URL."
  type        = string
  default     = "ghs.googlehosted.com."
}

variable "back_service_url" {
  description = "Backend Cloud Run service URL."
  type        = string
  default     = "ghs.googlehosted.com."
}

variable "google_credentials" {
  description = "Base64-encoded Google Cloud credentials (from Secret Manager or environment)."
  type        = string
  sensitive   = true
}

# Cloud Build v2 repository path
variable "repo_resource_path" {
  type        = string
  description = "Full resource path of the Cloud Build connected repository (2nd gen)."
}

# MongoDB connection URI for backend service
variable "mongo_uri" {
  type        = string
  description = "MongoDB connection string for backend service."
}
