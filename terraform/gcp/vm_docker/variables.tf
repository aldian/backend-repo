### GENERAL
variable "app_name" {
  type = string
}

### GCP
variable "gcp_project_id" {
  type = string
}

variable "gcp_zone" {
  type = string
}

variable "gcp_machine_type" {
  type = string
}

variable "vm_instance_name_prefix" {
  type = string
}

variable "gcp_credentials" {
  type = string
}