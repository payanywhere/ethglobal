output "project_id" {
  value       = var.project_id
  description = "The active GCP project ID used by Terraform."
}

output "env" {
  value       = var.env
  description = "Deployment environment (dev, test, prod)."
}

output "region" {
  value       = var.region
  description = "Default GCP region for all resources."
}

output "service_account" {
  value       = var.sa_email
  description = "Terraform Service Account email for this environment."
}

output "state_bucket" {
  value       = var.bucket_name
  description = "Name of the remote GCS bucket storing Terraform state."
}

output "dns_zone_name" {
  description = "DNS managed zone name."
  value       = google_dns_managed_zone.payanywhere_zone.name
}

output "front_cname_record" {
  description = "Frontend DNS record name."
  value       = google_dns_record_set.front_record.name
}

output "api_cname_record" {
  description = "Backend DNS record name."
  value       = google_dns_record_set.api_record.name
}

output "repo_resource_path" {
  description = "Full Cloud Build v2 repository resource path."
  value       = var.repo_resource_path
}

output "mongo_uri" {
  description = "MongoDB connection URI used by backend service."
  value       = var.mongo_uri
  sensitive   = true
}
