# Self-Registration, Onboarding Automation and One-Domain Concept

docker build --rm --tag sap-demo/terraform:latest .
docker push sap-demo/terraform:latest

cf push terraform -o sap-demo/terraform:latest -u=process --task 
cf run-task terraform -c  'cd /home/user && terraform init && terraform apply -auto-approve \
      -var="globacct=sap-demo" \
      -var="ias_host=sap-demo.accounts.ondemand.com" \
      -var="region=eu10" \
      -var="shootname=a1b2c3" \
      -var="namespace=susaas" \
      -var="app_name=susaas" \
      -var="app_plan=trial" \
      -var="api_name=susaas-api" \
      -var="api_plan=trial" \
      -var="password=password" \
      -var="username=global.admin@example.org" \
      -var="project=susaas" \
      -var="tenant=example-org" \
      -var="subaccount_admins=[\"account.admin@example.org\"]" \
      -var="saas_admins=[\"saas.admin@example.org\"]" \