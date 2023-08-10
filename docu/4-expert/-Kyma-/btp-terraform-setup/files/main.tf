
###
data "btp_globalaccount" "project" {}
###

###
# Setup Subaccount
###
resource "btp_subaccount" "project" {
  name      = "${var.name}-${var.stage}"
  subdomain = lower(replace("${var.name}-${var.stage}", " ", "-"))
  region    = lower(var.region)
}


###
# Setup Trust configuration
###
resource "btp_subaccount_trust_configuration" "project" {
  subaccount_id     = btp_subaccount.project.id
  identity_provider = var.ias_host
}

###
# Setup Subscription
###
resource "btp_subaccount_subscription" "project" {
  subaccount_id = btp_subaccount.project.id
  app_name      = "${var.app_name}-${var.namespace}-${var.shootname}"
  plan_name     = var.app_plan
}

###
# Setup Subaccount Admins
###
resource "btp_subaccount_role_collection_assignment" "subaccount_admins" {
  for_each             = { for user in var.subaccount_admins : user => user }
  subaccount_id        = btp_subaccount.project.id
  origin               = "sap.default"
  role_collection_name = "Subaccount Administrator"
  user_name            = each.value
}


###
# Setup Subaccount Viewers
###
resource "btp_subaccount_role_collection_assignment" "subaccount_viewers" {
  for_each             = { for user in var.saas_admins : user => user }
  subaccount_id        = btp_subaccount.project.id
  origin               = "${split(".", var.ias_host)[0]}-platform"
  role_collection_name = "Subaccount Viewer"
  user_name            = each.value
}


###
# Setup SaaS Admins
###
resource "btp_subaccount_role_collection_assignment" "saas_admins" {
  for_each             = { for user in var.saas_admins : user => user }
  subaccount_id        = btp_subaccount.project.id
  origin               = "sap.custom"
  role_collection_name = "Susaas Administrator (${var.app_name}-${var.namespace})"
  user_name            = each.value
  depends_on = [
    btp_subaccount_subscription.project,
    btp_subaccount_trust_configuration.project
  ]
}

###
# Setup SaaS Members
###
resource "btp_subaccount_role_collection_assignment" "saas_members" {
  for_each             = { for user in var.saas_members : user => user }
  subaccount_id        = btp_subaccount.project.id
  origin               = "sap.custom"
  role_collection_name = "Susaas Member (${var.app_name}-${var.namespace})"
  user_name            = each.value
  depends_on = [
    btp_subaccount_subscription.project,
    btp_subaccount_trust_configuration.project
  ]
}

###
# Setup SaaS Extension Developers
###
resource "btp_subaccount_role_collection_assignment" "saas_extends" {
  for_each             = { for user in var.saas_extends : user => user }
  subaccount_id        = btp_subaccount.project.id
  origin               = "sap.custom"
  role_collection_name = "Susaas Extension Developer (${var.app_name}-${var.namespace})"
  user_name            = each.value
  depends_on = [
    btp_subaccount_subscription.project,
    btp_subaccount_trust_configuration.project
  ]
}


resource "null_resource" "delay" {
  provisioner "local-exec" {
    command = "sleep 30"
  }
  depends_on = [
    btp_subaccount_subscription.project
  ]
}



###
# Get Service Plan of API Service Broker
###
data "btp_subaccount_service_plan" "project" {
  subaccount_id = btp_subaccount.project.id
  name          = var.api_plan
  offering_name = "${var.api_name}-${var.namespace}-${var.shootname}"
  depends_on = [
    null_resource.delay
  ]
}


###
# Setup API Service Instance
###
resource "btp_subaccount_service_instance" "project" {
  subaccount_id  = btp_subaccount.project.id
  serviceplan_id = data.btp_subaccount_service_plan.project.id
  name           = var.app_name
  depends_on = [
    null_resource.delay
  ]
}


###
# Setup Binding for API Service Instance
###
resource "btp_subaccount_service_binding" "project" {
  subaccount_id       = btp_subaccount.project.id
  service_instance_id = btp_subaccount_service_instance.project.id
  name                = "default"
  depends_on = [
    btp_subaccount_service_instance.project
  ]
}


###
# Get Subaccount details
###
data "btp_subaccount" "project" {
  id = btp_subaccount.project.id
}


###
# Configure SAP IAS Settings
###
resource "null_resource" "ias_config" {
  provisioner "local-exec" {
    command     = <<EOT
        btp login --user '${var.username}' --password '${var.password}' --subdomain '${var.globacct}'  --url https://cpcli.cf.eu10.hana.ondemand.com
        btp update security/trust sap.custom --subaccount ${btp_subaccount.project.id} --auto-create-shadow-users false
        btp update security/trust sap.default --subaccount ${btp_subaccount.project.id} --available-for-user-logon false
    EOT
    interpreter = ["/bin/bash", "-c"]
  }
  depends_on = [
    btp_subaccount_trust_configuration.project
  ]
}
