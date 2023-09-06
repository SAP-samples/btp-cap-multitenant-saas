
locals {
  cloudFoundry = var.space != null && var.org != null 
  kyma = var.namespace != null  && var.shootname != null 
}


check "health_check_runtimes" {
  assert {
    condition = (local.kyma || local.cloudFoundry) 
    error_message = "No runtime details configured - Check Variables!"
  }
  assert {
    condition = !(local.cloudFoundry && local.kyma)
    error_message = "Two runtimes configured - Deployment to Kyma!"
  }
}


###
# Get Global Account details
###
data "btp_globalaccount" "project" {}


###
# Get Subaccount details
###
data "btp_subaccount" "project" {
  id = btp_subaccount.project.id
}


###
# Setup Subaccount
###
resource "btp_subaccount" "project" {
  name      = lower(var.tenant)
  subdomain = lower(var.tenant)
  region    = lower(var.region)
  parent_id = var.parent_dir
}


###
# Setup Trust configuration
###
resource "btp_subaccount_trust_configuration" "project" {
  subaccount_id     = btp_subaccount.project.id
  identity_provider = var.application_idp
}


###
# Configure SAP IAS Settings
# (solved with BTP CLI as not supported by Terraform provider yet)
###
resource "null_resource" "ias_config" {
  count = var.btp_cli == true ? 1 : 0

  provisioner "local-exec" {
    command     = <<EOT
        idp_param=""
        if [ -n "${var.platform_idp}" ]; then
          idp_prefix=$(echo "${var.platform_idp}" | cut -d '.' -f 1)
          idp_param="--idp $idp_prefix"
        fi
        btp login --user '${var.username}' --password '${var.password}' --subdomain '${var.globacct}' $idp_param --url https://cpcli.cf.eu10.hana.ondemand.com 
        btp update security/trust sap.custom --subaccount ${btp_subaccount.project.id} --auto-create-shadow-users false
        btp update security/trust sap.default --subaccount ${btp_subaccount.project.id} --available-for-user-logon false
    EOT
  }
  depends_on = [
    btp_subaccount_trust_configuration.project
  ]
}


###
# Setup Subscription
###
resource "btp_subaccount_subscription" "project" {
  subaccount_id = btp_subaccount.project.id
  app_name      = local.kyma ? "${var.app_name}-${var.namespace}-${var.shootname}" : "${var.app_name}-${var.space}-${var.org}"
  plan_name     = var.app_plan
}


###
# Setup Subaccount Admins
# (additional Subaccount Admins if required)
###
resource "btp_subaccount_role_collection_assignment" "subaccount_admins" {
  for_each             = var.subaccount_admins != null ? { for user in var.subaccount_admins : user => user } : {}
  subaccount_id        = btp_subaccount.project.id
  origin               = var.platform_idp != null ?  "${split(".", var.platform_idp)[0]}-platform" : "sap.default"
  role_collection_name = "Subaccount Administrator"
  user_name            = each.value
}


###
# Setup Subaccount Viewers
###
resource "btp_subaccount_role_collection_assignment" "subaccount_viewers" {
  for_each             = var.viewer_role == true ? { for user in var.saas_admins : user => user } : {}
  subaccount_id        = btp_subaccount.project.id
  origin               = var.platform_idp != null ? "${split(".", var.platform_idp)[0]}-platform" : "sap.default"
  role_collection_name = "Subaccount Viewer"
  user_name            = each.value
}


###
# Setup SaaS Admins
###
resource "btp_subaccount_role_collection_assignment" "saas_admins" {
  for_each             = var.saas_admins != null ? { for user in var.saas_admins : user => user } : {}
  subaccount_id        = btp_subaccount.project.id
  origin               = "sap.custom"
  role_collection_name = local.kyma ? "Susaas Administrator (${var.app_name}-${var.namespace})" : "Susaas Administrator (${var.space})"
  user_name            = each.value
  depends_on = [
    btp_subaccount_subscription.project,
    btp_subaccount_trust_configuration.project
  ]
}


###
# Delay to await successful subscription
###
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
  offering_name = local.kyma ? "${var.api_name}-${var.namespace}-${var.shootname}" : "${var.api_name}-${var.space}-${var.org}" 
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
