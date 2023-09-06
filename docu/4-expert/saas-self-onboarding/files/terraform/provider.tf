terraform {
  required_providers {
    btp = {
      source  = "sap/btp"
      version = "0.2.0-beta2"
    }
  }
  backend "pg" {}
}

# Please checkout documentation on how best to authenticate  
# against SAP BTP via the Terraform provider for SAP BTP
provider "btp" {
  globalaccount = var.globacct
  username = var.username
  password = var.password
  idp = var.platform_idp != null ? "${split(".", var.platform_idp)[0]}" : "sap.default"
  cli_server_url = "https://cpcli.cf.eu10.hana.ondemand.com"
}