terraform {
  backend "gcs" {
    prefix = "/state/backend-repo"
  }

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}