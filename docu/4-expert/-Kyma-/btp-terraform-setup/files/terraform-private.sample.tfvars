# If you comment out the variables, the default values are taken defined in the variables.tf file

name     = "susaas" # Subaccount name/subdomain = "${name}-{stage}" 
stage    = "dev" # Subaccount subdomain = "${name}-{stage}"

globacct = "sap-demo" # Global Account subdomain
username = "global.admin@example.org" # Global Account Administrator e-mail
password = "abcd1234!?#+" # Global Account Administrator password
region   = "eu10" # Kyma Cluster region
shootname = "a1b2c3" # Kyma Cluster shootname
namespace = "default" # Kyma Cluster namespace
ias_host = "sap-demo.accounts.ondemand.com" 

# Do not include the Global Admin used above
subaccount_admins  = ["subaccount.admin@example.org"]

app_name = "susaas"
api_name = "susaas-api"
saas_admins  = ["saas.admin@example.org"]
saas_members  = ["saas.member@example.org"]
saas_extends  = ["saas.extend@example.org"]