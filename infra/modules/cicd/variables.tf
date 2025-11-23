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

# Frontend Environment Variables
variable "next_public_environment" {
  type        = string
  description = "Next.js public environment identifier."
  default     = "production"
}

variable "next_public_api_url" {
  type        = string
  description = "Next.js public API URL for frontend."
}

variable "next_public_base_url" {
  type        = string
  description = "Next.js public base URL for frontend."
}

variable "mp_public_key" {
  type        = string
  description = "MercadoPago public key."
  sensitive   = true
}

variable "mp_access_token" {
  type        = string
  description = "MercadoPago access token."
  sensitive   = true
}

variable "next_public_dynamic_env_id" {
  type        = string
  description = "Dynamic environment ID for frontend."
  sensitive   = true
}

variable "cdp_api_key_appid" {
  type        = string
  description = "Coinbase Developer Platform API key app ID."
  sensitive   = true
}

variable "cdp_api_key_secret" {
  type        = string
  description = "Coinbase Developer Platform API key secret."
  sensitive   = true
}

variable "cdp_wallet_secret" {
  type        = string
  description = "Coinbase Developer Platform wallet secret."
  sensitive   = true
}

variable "payanywhere_fee_composer_address" {
  type        = string
  description = "PayAnyWhere Fee Composer Contract address (Polygon)."
}

# Backend Environment Variables
variable "rpc_provider" {
  type        = string
  description = "RPC provider URL for blockchain interactions."
  sensitive   = true
}

variable "private_key" {
  type        = string
  description = "Private key for blockchain transactions."
  sensitive   = true
}

variable "port" {
  type        = number
  description = "Backend service port."
  default     = 3000
}