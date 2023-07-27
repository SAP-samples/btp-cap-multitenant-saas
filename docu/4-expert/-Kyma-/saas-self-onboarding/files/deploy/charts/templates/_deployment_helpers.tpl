{{/*
Add custom env variables 
*/}}
{{- define "cap.env" -}}
    {{- if . -}}
        {{- range $name, $value := . }}
- name: {{ $name | quote }}
  value: {{ $value | quote }}
        {{- end -}}
    {{- end -}}
{{- end -}}

{{/*
Get list of deployment names
*/}}
{{- define "cap.deploymentNames" -}}
{{- $defaultDeployments := (list "router") -}}
  {{- if .mtx -}}
{{-   $_ := (append $defaultDeployments "mtx") -}}
  {{- end -}}
{{ .deploymentNames | default $defaultDeployments | join ";" }}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.

*/}}
{{- define "cap.deploymentHost" -}}
{{- if .deployment.expose.host }}
{{- .deployment.expose.host }}
{{- else }}
{{- $name := (include "cap.fullname" .) }}
{{- if hasPrefix $name .Release.Namespace }}
{{- .Release.Namespace }}
{{- else }}
{{- printf "%s-%s" $name .Release.Namespace | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "cap.fullname" -}}
{{- if .deployment.fullnameOverride }}
{{- .deployment.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .name .deployment.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Get FQDN of a deployment
*/}}
{{- define "cap.deploymentHostFull" -}}
{{ include "cap.deploymentHost" $ }}.{{ $.Values.global.domain }}
{{- end -}}