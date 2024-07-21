provider "google" {
  credentials = file("${var.gcp_credentials}")
  project     = var.gcp_project_id
  zone        = "${var.gcp_zone}"
}

# IP ADDRESS
resource "google_compute_address" "ip_address" {
  name = "${var.app_name}-${terraform.workspace}"
}

# NETWORK
data "google_compute_network" "default" {
  name = "default"
}

# FIREWALL RULE
resource "google_compute_firewall" "allow_http" {
  name    = "allow-http-${terraform.workspace}"
  network = data.google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]

  target_tags = ["allow-http-${terraform.workspace}"]
}

# OS IMAGE
data "google_compute_image" "cos_image" {
  family  = "cos-113-lts"
  project = "cos-cloud"
}

# COMPUTE ENGINE INSTANCE
resource "google_compute_instance" "instance" {
  name         = "${var.vm_instance_name_prefix}-${terraform.workspace}"
  machine_type = var.gcp_machine_type
  zone         = "${var.gcp_zone}"

  tags = google_compute_firewall.allow_http.target_tags

  boot_disk {
    initialize_params {
      image = data.google_compute_image.cos_image.self_link
    }
  }

  network_interface {
    network = data.google_compute_network.default.name

    access_config {
      nat_ip = google_compute_address.ip_address.address
    }
  }

  service_account {
    scopes = ["storage-ro"]
  }
}