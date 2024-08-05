{{/******************************************************************************************************************************
hana service - hdi-shared
*/}}

{{- define "hanaHdiContainerEnabled" -}}
true
{{- end -}}

{{- define "hanaHdiContainerOffering" -}}
hana
{{- end -}}

{{- define "hanaHdiContainerPlan" -}}
hdi-shared
{{- end -}}

{{- define "hanaHdiContainerInstance" -}}
{{ .Values.services.hanaHdiContainer.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.hanaHdiContainer.shortName) }}
{{- end -}}

{{- define "hanaHdiContainerBinding" -}}
{{ .Values.services.hanaHdiContainer.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.hanaHdiContainer.shortName) }}
{{- end -}}

{{- define "hanaHdiContainerInstanceParameters" -}}
{{- end -}}

{{- define "hanaHdiContainerBindingParameters" -}}
{{- end -}}

{{- define "hanaHdiContainerSecret" -}}
{{- if eq .Values.services.hanaHdiContainer.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.hanaHdiContainer.shortName }}-bind-btp
{{- else if eq .Values.services.hanaHdiContainer.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.hanaHdiContainer.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
destination service
*/}}

{{- define "destinationEnabled" -}}
true
{{- end -}}

{{- define "destinationOffering" -}}
destination
{{- end -}}

{{- define "destinationPlan" -}}
lite
{{- end -}}

{{- define "destinationInstance" -}}
{{ .Values.services.destination.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.destination.shortName) }}
{{- end -}}

{{- define "destinationBinding" -}}
{{ .Values.services.destination.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.destination.shortName) }}
{{- end -}}

{{- define "destinationInstanceParameters" -}}
HTML5Runtime_enabled: false
init_data:
  instance:
    destinations:
      - Authentication: NoAuthentication
        Description: Northwind
        Name: NORTHWIND
        ProxyType: Internet
        Type: HTTP
        URL: https://services.odata.org/v4/Northwind/Northwind.svc
    existing_destinations_policy: update
version: 1.0.0
{{- end -}}

{{- define "destinationBindingParameters" -}}
{{- end -}}

{{- define "destinationSecret" -}}
{{- if eq .Values.services.destination.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.destination.shortName }}-bind-btp
{{- else if eq .Values.services.destination.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.destination.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
html5 repository service (host)
*/}}

{{- define "html5RepoHostEnabled" -}}
true
{{- end -}}

{{- define "html5RepoHostOffering" -}}
html5-apps-repo
{{- end -}}

{{- define "html5RepoHostPlan" -}}
app-host
{{- end -}}

{{- define "html5RepoHostInstance" -}}
{{ .Values.services.html5RepoHost.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.html5RepoHost.shortName) }}
{{- end -}}

{{- define "html5RepoHostBinding" -}}
{{ .Values.services.html5RepoHost.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.html5RepoHost.shortName) }}
{{- end -}}

{{- define "html5RepoHostInstanceParameters" -}}
{{- end -}}

{{- define "html5RepoHostBindingParameters" -}}
{{- end -}}

{{- define "html5RepoHostSecret" -}}
{{- if eq .Values.services.html5RepoHost.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.html5RepoHost.shortName }}-bind-btp
{{- else if eq .Values.services.html5RepoHost.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.html5RepoHost.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
html5 repository service (runtime)
*/}}

{{- define "html5RepoRuntimeEnabled" -}}
true
{{- end -}}

{{- define "html5RepoRuntimeOffering" -}}
html5-apps-repo
{{- end -}}

{{- define "html5RepoRuntimePlan" -}}
app-runtime
{{- end -}}

{{- define "html5RepoRuntimeInstance" -}}
{{ .Values.services.html5RepoRuntime.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.html5RepoRuntime.shortName) }}
{{- end -}}

{{- define "html5RepoRuntimeBinding" -}}
{{ .Values.services.html5RepoRuntime.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.html5RepoRuntime.shortName) }}
{{- end -}}

{{- define "html5RepoRuntimeInstanceParameters" -}}
{{- end -}}

{{- define "html5RepoRuntimeBindingParameters" -}}
{{- end -}}

{{- define "html5RepoRuntimeSecret" -}}
{{- if eq .Values.services.html5RepoRuntime.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.html5RepoRuntime.shortName }}-bind-btp
{{- else if eq .Values.services.html5RepoRuntime.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.html5RepoRuntime.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
saas registry service
*/}}

{{- define "saasRegistryEnabled" -}}
true
{{- end -}}

{{- define "saasRegistryOffering" -}}
saas-registry
{{- end -}}

{{- define "saasRegistryPlan" -}}
application
{{- end -}}

{{- define "saasRegistryInstance" -}}
{{ .Values.services.saasRegistry.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.saasRegistry.shortName) }}
{{- end -}}

{{- define "saasRegistryBinding" -}}
{{ .Values.services.saasRegistry.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.saasRegistry.shortName) }}
{{- end -}}

{{- define "saasRegistryInstanceParameters" -}}
appName: {{.Values.app.name}}
appPlans:
  - description: Sustainable SaaS default plan
    name: default
  - description: Sustainable SaaS trial plan
    name: trial
  - description: Sustainable SaaS premium plan
    name: premium
appUrls:
  getDependencies: "https://{{.Values.btp.provider.subdomain}}.{{.Values.app.domains.primary}}/-/cds/saas-provisioning/dependencies"
  # NOTE: this should forward the call to the operators subscription server
  onSubscription: "https://{{.Values.app.subscriptionServerDomain}}/provision/tenants/{tenantId}"
  callbackTimeoutMillis: {{.Values.services.saasRegistry.callbackTimeoutMillis}}
  onSubscriptionAsync: true
  onUnSubscriptionAsync: true
category: CAP
description: Sustainable SaaS ({{.Values.app.name}})
displayName: Sustainable SaaS ({{.Values.app.name}})
propagateParams: true
xsappname: {{.Values.app.name}}
{{- end -}}

{{- define "saasRegistryBindingParameters" -}}
{{- end -}}

{{- define "saasRegistrySecret" -}}
{{- if eq .Values.services.saasRegistry.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.saasRegistry.shortName }}-bind-btp
{{- else if eq .Values.services.saasRegistry.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.saasRegistry.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
service manager service (subaccount-admin)
*/}}

{{- define "serviceManagerAdminEnabled" -}}
true
{{- end -}}

{{- define "serviceManagerAdminOffering" -}}
service-manager
{{- end -}}

{{- define "serviceManagerAdminPlan" -}}
subaccount-admin
{{- end -}}

{{- define "serviceManagerAdminInstance" -}}
{{ .Values.services.serviceManagerAdmin.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.serviceManagerAdmin.shortName) }}
{{- end -}}

{{- define "serviceManagerAdminBinding" -}}
{{ .Values.services.serviceManagerAdmin.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.serviceManagerAdmin.shortName) }}
{{- end -}}

{{- define "serviceManagerAdminInstanceParameters" -}}
{{- end -}}

{{- define "serviceManagerAdminBindingParameters" -}}
{{- end -}}

{{- define "serviceManagerAdminSecret" -}}
{{- if eq .Values.services.serviceManagerAdmin.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.serviceManagerAdmin.shortName }}-bind-btp
{{- else if eq .Values.services.serviceManagerAdmin.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.serviceManagerAdmin.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
service manager service (container)
*/}}

{{- define "serviceManagerContainerEnabled" -}}
true
{{- end -}}

{{- define "serviceManagerContainerOffering" -}}
service-manager
{{- end -}}

{{- define "serviceManagerContainerPlan" -}}
container
{{- end -}}

{{- define "serviceManagerContainerInstance" -}}
{{ .Values.services.serviceManagerContainer.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.serviceManagerContainer.shortName) }}
{{- end -}}

{{- define "serviceManagerContainerBinding" -}}
{{ .Values.services.serviceManagerContainer.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.serviceManagerContainer.shortName) }}
{{- end -}}

{{- define "serviceManagerContainerInstanceParameters" -}}
acquireTimeoutMillis: max
polling_timeout_seconds: 480
{{- end -}}

{{- define "serviceManagerContainerBindingParameters" -}}
{{- end -}}

{{- define "serviceManagerContainerSecret" -}}
{{- if eq .Values.services.serviceManagerContainer.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.serviceManagerContainer.shortName }}-bind-btp
{{- else if eq .Values.services.serviceManagerContainer.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.serviceManagerContainer.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
xsuaa service
*/}}

{{- define "xsuaaEnabled" -}}
true
{{- end -}}

{{- define "xsuaaOffering" -}}
xsuaa
{{- end -}}

{{- define "xsuaaPlan" -}}
application
{{- end -}}

{{- define "xsuaaInstance" -}}
{{ .Values.services.xsuaa.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.xsuaa.shortName) }}
{{- end -}}

{{- define "xsuaaBinding" -}}
{{ .Values.services.xsuaa.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.xsuaa.shortName) }}
{{- end -}}

{{- define "xsuaaInstanceParameters" -}}
xsappname: {{.Values.app.name}}
tenant-mode: shared
oauth2-configuration:
  credential-types:
    - "binding-secret"
    - "x509"
  token-validity: 900
  redirect-uris:
  - "https://*{{.Values.app.domains.primary}}/**"
  {{- if .Values.app.domains.secondary }}
  {{- range .Values.app.domains.secondary }}
  - "https://*{{.}}/**"
  {{- end }}
  {{- end }}
attributes: []
authorities:
  - $XSAPPNAME.mtcallback
  - $XSAPPNAME.mtdeployment
  - $XSAPPNAME.MtxDiagnose
  - $XSAPPNAME.cds.ExtensionDeveloper
  - $XSAPPNAME.cds.Subscriber
  - $XSAPPNAME.cds.UIFlexDeveloper
foreign-scope-references:
  - xs_authorization.read
  - xs_authorization.write
  - xs_user.read
  - xs_user.write
  - xs_idp.read
  - xs_idp.write
role-collections:
  - description: Member Access
    name: Susaas Member (susaas)
    role-template-references:
      - $XSAPPNAME.Member
      - $XSAPPNAME.Token_Exchange
  - description: Administrator Access
    name: Susaas Administrator (susaas)
    role-template-references:
      - $XSAPPNAME.Admin
      - $XSAPPNAME.SaaSAdmin
      - $XSAPPNAME.UserManagementAdmin
      - $XSAPPNAME.Token_Exchange
  - description: Extension Developer Access
    name: Susaas Extension Developer (susaas)
    role-template-references:
      - $XSAPPNAME.ExtensionDeveloper
      - $XSAPPNAME.Token_Exchange
role-templates:
  - description: UAA Token Exchange
    name: Token_Exchange
    scope-references:
      - uaa.user
  - description: Member
    name: Member
    scope-references:
      - $XSAPPNAME.Member
  - description: Administrator
    name: Admin
    scope-references:
      - $XSAPPNAME.Admin
      - xs_authorization.read
      - xs_authorization.write
      - xs_user.read
      - xs_user.write
      - xs_idp.read
      - xs_idp.write
  - description: SaaS Administrator
    name: SaaSAdmin
    scope-references:
      - $XSAPPNAME.mtcallback
      - $XSAPPNAME.mtdeployment
      - $XSAPPNAME.MtxDiagnose
  - description: Extension Developer
    name: ExtensionDeveloper
    scope-references:
      - $XSAPPNAME.cds.ExtensionDeveloper
  - default-role-name: User and Role Administrator
    description: Manage authorizations, trusted identity providers, and users.
    name: UserManagementAdmin
    scope-references:
      - xs_authorization.read
      - xs_authorization.write
      - xs_user.read
      - xs_user.write
      - xs_idp.read
      - xs_idp.write
  - default-role-name: User and Role Auditor
    description: Read-only access for authorizations, trusted identity providers, and users.
    name: UserManagementAuditor
    scope-references:
      - xs_authorization.read
      - xs_user.read
      - xs_idp.read
scopes:
  - name: "$XSAPPNAME.Callback"
    description: "With this scope set, the callbacks for tenant onboarding, offboarding and getDependencies can be called"
    grant-as-authority-to-apps:
      - "$XSAPPNAME(application,sap-provisioning,tenant-onboarding)"
  - name: "$XSAPPNAME.MtxDiagnose"
    description: "Diagnose MTX"
  - name: "$XSAPPNAME.mtdeployment"
    description: "Deploy applications"
  - name: "$XSAPPNAME.mtcallback"
    description: "Subscribe to applications"
    grant-as-authority-to-apps:
      - "$XSAPPNAME(application,sap-provisioning,tenant-onboarding)"
  - description: UAA
    name: uaa.user
  - description: Member
    name: $XSAPPNAME.Member
  - description: Administrator
    name: $XSAPPNAME.Admin
  - description: Develop Extensions
    name: $XSAPPNAME.cds.ExtensionDeveloper
{{- end -}}

{{- define "xsuaaBindingParameters" -}}
{{- end -}}

{{- define "xsuaaSecret" -}}
{{- if eq .Values.services.xsuaa.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.xsuaa.shortName }}-bind-btp
{{- else if eq .Values.services.xsuaa.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.xsuaa.shortName }}-bind-sec
{{- end -}}
{{- end -}}


{{/******************************************************************************************************************************
xsuaa api service
*/}}

{{- define "xsuaaApiEnabled" -}}
true
{{- end -}}

{{- define "xsuaaApiOffering" -}}
xsuaa
{{- end -}}

{{- define "xsuaaApiPlan" -}}
broker
{{- end -}}

{{- define "xsuaaApiInstance" -}}
{{ .Values.services.xsuaaApi.instanceName | default (printf "%s-%s" .Values.app.name .Values.services.xsuaaApi.shortName) }}
{{- end -}}

{{- define "xsuaaApiBinding" -}}
{{ .Values.services.xsuaaApi.bindingName | default (printf "%s-%s" .Values.app.name .Values.services.xsuaaApi.shortName) }}
{{- end -}}

{{- define "xsuaaApiInstanceParameters" -}}
xsappname: {{.Values.app.name}}-api
scopes:
  - description: Default Plan
    name: $XSAPPNAME.plan_default
  - description: Trial Plan
    name: $XSAPPNAME.trial_default
  - description: Premium Plan
    name: $XSAPPNAME.plan_premium
{{- end -}}

{{- define "xsuaaApiBindingParameters" -}}
{{- end -}}

{{- define "xsuaaApiSecret" -}}
{{- if eq .Values.services.xsuaaApi.provider "btp-operator" -}}
    {{ .Values.app.name }}-{{ .Values.services.xsuaaApi.shortName }}-bind-btp
{{- else if eq .Values.services.xsuaaApi.provider "secret" -}}
    {{ .Values.app.name }}-{{ .Values.services.xsuaaApi.shortName }}-bind-sec
{{- end -}}
{{- end -}}
