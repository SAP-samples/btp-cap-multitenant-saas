

variable "project" {
  type        = string
  nullable    = false
  description = "The name of your project."

  validation {
    condition     = can(regex("^[a-zA-Z0-9_\\-]{1,200}", var.project))
    error_message = "Provide a valid project name."
  }
}


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


variable "username" {
  type        = string
  nullable    = false
  description = "Global Administrator e-mail address."
}


variable "password" {
  type        = string
  nullable    = false
  description = "Global Administrator password."
}


variable "region" {
  type        = string
  nullable    = false
  description = "The region where the project account shall be created in."
}


variable "shootname" {
  type        = string
  nullable    = false
  description = "The Kyma Cluster shootname which the project is deployed to."
}


variable "namespace" {
  type        = string
  description = "The Kyma Cluster namespace which the project is deployed to."
  default     = "default"
}


variable "ias_host" {
  type        = string
  nullable    = false
  description = "The host of the customers SAP IAS tenant for central user management."
}


variable "btp_cli" {
  type        = bool
  default     = true
  description = "Defines whether the SAP BTP CLI commands will run in a null resource."
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
  nullable    = false

  validation {
    condition     = can([for s in var.saas_admins : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)])
    error_message = "Provide a valid SaaS administrator."
  }
}


variable "saas_members" {
  type        = list(string)
  default     = null
  description = "The SaaS Member(s)."

  validation {
    condition = (var.saas_members == null || can([for s in var.saas_members : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)]))    
    error_message = "Provide a valid SaaS member."
  }
}


variable "saas_extends" {
  type        = list(string)
  default     = null
  description = "The SaaS Extension Developer(s)."

  validation {
    condition = (var.saas_extends == null || can([for s in var.saas_extends : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)]))    
    error_message = "Provide a valid SaaS extension developer."
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
