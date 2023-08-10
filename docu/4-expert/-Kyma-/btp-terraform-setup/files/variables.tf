

variable "name" {
  type        = string
  description = "The account name."

  validation {
    condition     = can(regex("^[a-zA-Z0-9_\\-]{1,200}", var.name))
    error_message = "Provide a valid project account name."
  }
}


variable "globacct" {
  type        = string
  description = "The Global Account subdomain."
}


variable "username" {
  type        = string
  description = "Global Administrator e-mail address."
}


variable "password" {
  type        = string
  description = "Global Administrator password."
}


variable "stage" {
  type        = string
  description = "The stage/tier the account will be used for."
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.stage)
    error_message = "Select a valid stage for the project account."
  }
}


variable "region" {
  type        = string
  description = "The region where the project account shall be created in."
}


variable "shootname" {
  type        = string
  description = "The Kyma Cluster shootname which the project is deployed to."
}


variable "namespace" {
  type        = string
  description = "The Kyma Cluster namespace which the project is deployed to."
  default = "default"
}


variable "ias_host" {
  type        = string
  description = "The host of the customers SAP IAS tenant for central user management."
}


variable "subaccount_admins" {
  type        = list(string)
  description = "The Subaccount Admin(s)."

  validation {
    condition     = can([for s in var.subaccount_admins : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)])
    error_message = "Provide a valid subaccount administrator."
  }
}

variable "saas_admins" {
  type        = list(string)
  description = "The SaaS Admin(s)."

  validation {
    condition     = can([for s in var.saas_admins : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)])
    error_message = "Provide a valid SaaS administrator."
  }
}


variable "saas_members" {
  type        = list(string)
  description = "The SaaS Member(s)."

  validation {
    condition     = can([for s in var.saas_members : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)])
    error_message = "Provide a valid SaaS member."
  }
}


variable "saas_extends" {
  type        = list(string)
  description = "The SaaS Extension Developer(s)."

  validation {
    condition     = can([for s in var.saas_extends : regex("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$", s)])
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
