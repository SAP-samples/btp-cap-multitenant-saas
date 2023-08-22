terraform {
  required_providers {
    btp = {
      source  = "sap/btp"
      version = "0.2.0-beta2"
    }
  }
}

# Please checkout documentation on how best to authenticate  
# against SAP BTP via the Terraform provider for SAP BTP
provider "btp" {
  globalaccount = var.globacct
  username = var.username
  password = var.password
  cli_server_url = "https://cpcli.cf.eu10.hana.ondemand.com"
}