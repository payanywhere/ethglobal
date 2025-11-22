terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project     = var.project_id
  region      = var.region
  credentials = base64decode(var.google_credentials)
}

resource "google_project_service" "enabled_apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "dns.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
    "sqladmin.googleapis.com",
    "aiplatform.googleapis.com",
    "pubsub.googleapis.com",
    "artifactregistry.googleapis.com",
    "serviceusage.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "domains.googleapis.com",
    "developerconnect.googleapis.com"
  ])
  project = var.project_id
  service = each.key
}

resource "google_dns_managed_zone" "payanywhere_zone" {
  name        = "payanywhere-zone"
  dns_name    = "${var.domain_name}."
  description = "DNS zone for PayAnyWhere services"
  depends_on  = [google_project_service.enabled_apis]
}

resource "google_dns_record_set" "front_record" {
  name         = "${var.domain_name}."
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.payanywhere_zone.name
  rrdatas      = ["216.239.32.21", "216.239.34.21", "216.239.36.21", "216.239.38.21"]
  depends_on   = [google_project_service.enabled_apis]
}

resource "google_dns_record_set" "api_record" {
  name         = "api.${var.domain_name}."
  type         = "CNAME"
  ttl          = 300
  managed_zone = google_dns_managed_zone.payanywhere_zone.name
  rrdatas      = [var.back_service_url]
  depends_on   = [google_project_service.enabled_apis]
}

resource "google_dns_managed_zone" "payanywhere_run_place_zone" {
  name        = "payanywhere-run-place-zone"
  dns_name    = "payanywhere.run.place."
  description = "DNS zone for PayAnyWhere run.place domain"
  depends_on  = [google_project_service.enabled_apis]
}

resource "google_dns_record_set" "payanywhere_run_place_front" {
  name         = "payanywhere.run.place."
  type         = "A"
  ttl          = 300
  managed_zone = google_dns_managed_zone.payanywhere_run_place_zone.name
  rrdatas      = ["216.239.32.21", "216.239.34.21", "216.239.36.21", "216.239.38.21"]
  depends_on   = [google_project_service.enabled_apis]
}

resource "google_dns_record_set" "payanywhere_run_place_api" {
  name         = "api.payanywhere.run.place."
  type         = "CNAME"
  ttl          = 300
  managed_zone = google_dns_managed_zone.payanywhere_run_place_zone.name
  rrdatas      = [var.back_service_url]
  depends_on   = [google_project_service.enabled_apis]
}

resource "google_artifact_registry_repository" "back" {
  location      = var.region
  repository_id = "back"
  description   = "Docker repository for backend service"
  format        = "DOCKER"
  depends_on    = [google_project_service.enabled_apis]
}

resource "google_artifact_registry_repository" "front" {
  location      = var.region
  repository_id = "front"
  description   = "Docker repository for frontend service"
  format        = "DOCKER"
  depends_on    = [google_project_service.enabled_apis]
}

/*
module "cicd" {
  source             = "./modules/cicd"
  project_id         = var.project_id
  region             = var.region
  repo_resource_path = "projects/payanywhere/locations/us-central1/connections/payanywhere-repo/repositories/payanywhere-ethglobal_temp"
  mongo_uri          = var.mongo_uri
  domain_name        = var.domain_name
}
*/
