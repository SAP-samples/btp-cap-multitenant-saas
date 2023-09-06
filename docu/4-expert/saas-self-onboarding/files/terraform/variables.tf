variable "tenant" {
  type        = string
  nullable    = false
  description = "The name of your subscriber tenant."

  validation {
    condition     = can(regex("^[a-zA-Z0-9_\\-]{1,200}", var.tenant))
    error_message = "Provide a valid subscriber tenant name."
  }
}


variable "globacct" {
  type        = string
  nullable    = false
  description = "The Global Account subdomain."
}

variable "parent_dir" {
  type        = string
  description = "The Subacccount parent directory."
  nullable    = true
  default     = null
}

variable "platform_idp" {
  type        = string
  nullable    = true
  description = "Global Account Platform IdP."
  default     = "sap.default"
}


variable "application_idp" {
  type        = string
  nullable    = false
  description = "Custom Application IdP."
  default     = "sap.default"
}


variable "username" {
  type        = string
  nullable    = false
  sensitive = true
  description = "Global Administrator e-mail address."
}


variable "password" {
  type        = string
  nullable    = false
  sensitive   = true
  description = "Global Administrator password."
}


variable "region" {
  type        = string
  description = "The region where the project account shall be created in."
  nullable    = false
}


variable "shootname" {
  type        = string
  description = "The Kyma Cluster shootname which the project is deployed to."
  default     = null
  nullable    = true
}


variable "namespace" {
  type        = string
  description = "The Kyma Cluster namespace which the project is deployed to."
  default     = null
  nullable    = true
}


variable "org" {
  type        = string
  description = "The Cloud Foundry Organization which the project is deployed to."
  default     = null
  nullable    = true
}


variable "space" {
  type        = string
  description = "The Cloud Foundry Space which the project is deployed to."
  default     = null
  nullable    = true
}

variable "btp_cli" {
  type        = bool
  default     = true
  description = "Defines whether the SAP BTP CLI commands will run in a null resource."
}

variable "viewer_role" {
  type        = bool
  default     = false
  description = "Defines whether the Subaccount Viewer role is assigned to SaaS Admins."
}

variable "subaccount_admins" {
  type        = list(string)
  default     = null
  description = "The Subaccount Admin(s)."

  validation {
    condition = (var.subaccount_admins == null || can([for s in var.subaccount_admins : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)]))
    error_message = "Provide a valid subaccount administrator."
  }
}

variable "saas_admins" {
  type        = list(string)
  description = "The SaaS Admin(s)."
  default     = null

  validation {
    condition     = (var.saas_admins == null || can([for s in var.saas_admins : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)]))
    error_message = "Provide a valid SaaS administrator."
  }
}

variable "app_name" {
  type        = string
  description = "The name of the SaaS application to be subscribed."
  default     = "susaas"
}


variable "api_name" {
  type        = string
  description = "The name of the SaaS API Service Broker."
  default     = "susaas-api"
}


variable "app_plan" {
  type        = string
  description = "The service plan of the SaaS subscription."
  default     = "trial"
}


variable "api_plan" {
  type        = string
  description = "The service plan of the API Service Broker."
  default     = "trial"
}
