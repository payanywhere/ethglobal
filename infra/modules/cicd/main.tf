resource "google_cloudbuild_trigger" "back" {
  name        = "${var.project_id}-back"
  description = "Trigger to deploy backend service"
  project     = var.project_id
  location    = var.region

  repository_event_config {
    repository = var.repo_resource_path
    push {
      branch = "^main$"
    }
  }

  included_files = ["back/**"]
  ignored_files  = ["front/**", "infra/**"]

  filename = "back/cloudbuild.yaml"

  substitutions = {
    _MONGO_URI    = var.mongo_uri
    _SERVICE_NAME = "back-service"
  }
}

resource "google_cloudbuild_trigger" "front" {
  name        = "${var.project_id}-front"
  description = "Trigger to deploy frontend service"
  project     = var.project_id
  location    = var.region

  repository_event_config {
    repository = var.repo_resource_path
    push {
      branch = "^main$"
    }
  }

  included_files = ["front/**"]
  ignored_files  = ["back/**", "infra/**"]

  filename = "front/cloudbuild.yaml"

  substitutions = {
    _SERVICE_NAME        = "front-service"
    _NEXT_PUBLIC_API_URL = "https://${var.domain_name}"
  }
}

output "cloudbuild_triggers" {
  description = "Cloud Build triggers for frontend and backend"
  value = {
    backend  = google_cloudbuild_trigger.back.name
    frontend = google_cloudbuild_trigger.front.name
  }
}
