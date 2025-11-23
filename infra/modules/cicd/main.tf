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
    _MONGO_URI     = var.mongo_uri
    _SERVICE_NAME  = "back-service"
    _RPC_PROVIDER  = var.rpc_provider
    _PRIVATE_KEY   = var.private_key
    _PORT          = tostring(var.port)
    _APP_ENV       = var.next_public_environment
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
    _SERVICE_NAME                    = "front-service"
    _NEXT_PUBLIC_API_URL             = var.next_public_api_url
    _NEXT_PUBLIC_BASE_URL            = var.next_public_base_url
    _NEXT_PUBLIC_ENVIRONMENT         = var.next_public_environment
    _MP_PUBLIC_KEY                   = var.mp_public_key
    _MP_ACCESS_TOKEN                 = var.mp_access_token
    _NEXT_PUBLIC_DYNAMIC_ENV_ID      = var.next_public_dynamic_env_id
    _CDP_API_KEY_APPID               = var.cdp_api_key_appid
    _CDP_API_KEY_SECRET              = var.cdp_api_key_secret
    _CDP_WALLET_SECRET               = var.cdp_wallet_secret
    _PAYANYWHERE_FEE_COMPOSER_ADDRESS = var.payanywhere_fee_composer_address
    _APP_ENV                         = var.next_public_environment
    _BACKEND_API_URL                 = var.next_public_api_url
  }
}

output "cloudbuild_triggers" {
  description = "Cloud Build triggers for frontend and backend"
  value = {
    backend  = google_cloudbuild_trigger.back.name
    frontend = google_cloudbuild_trigger.front.name
  }
}
