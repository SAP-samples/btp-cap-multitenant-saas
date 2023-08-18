# If you comment out the variables, the default values are taken defined in the variables.tf file

### --------------------------------- ###
### SaaS Provider environment details ###
### --------------------------------- ###

globacct  = "sap-demo"                       # Global Account subdomain
username  = "global.admin@sap-demo.com"      # Global Account Administrator e-mail
password  = "abcd1234!?#+"                   # Global Account Administrator password
ias_host  = "sap-demo.accounts.ondemand.com" # Custom IdP used for Applications 
region    = "eu10"                           # SAP BTP Region of solution
btp_cli   = true                             # Execute BTP CLI commands 

# Kyma
shootname = "a1b2c3"                         # Kyma Cluster Shootname
namespace = "susaas"                         # Kyma Cluster Namespace

# Cloud Foundry
org       = "saas-provider"                  # Cloud Foundry Org
space     = "susaas"                         # Cloud Foundry Space


### ----------------------------- ###
### Subscriber Subaccount details ###
### ----------------------------- ###

# Subaccount "${project}-{tenant}" 
project = "susaas"
tenant  = "example-org"

# Additional Subaccount Administrator (optional)
subaccount_admins = ["admin@sap-demo.com"]  


### -------------------- ###
### Subscription details ###
### -------------------- ###

# Subscription and Service details
app_name = "susaas"
app_plan = "trial"
api_name = "susaas-api"
api_plan = "trial"

# User details 
saas_admins  = ["saas.admin@example.org"]
saas_members = ["saas.member@example.org"]
saas_extends = ["saas.extend@example.org"]
