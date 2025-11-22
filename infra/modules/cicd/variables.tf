variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "repo_resource_path" {
  type        = string
  description = "Full resource path of the Cloud Build connected repository (2nd gen)."
}

variable "mongo_uri" {
  type        = string
  description = "MongoDB connection string for backend service."
}

variable "domain_name" {
  type        = string
  description = "Domain Name."
}
