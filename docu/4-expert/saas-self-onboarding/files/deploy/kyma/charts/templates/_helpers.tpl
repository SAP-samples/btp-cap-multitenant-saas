{{/*
Check for mandatory configuration options
*/}}
{{- define "cap.expect" -}}
{{-   $root := first . -}}
{{-   $vars := rest . -}}
{{-   range $path := $vars -}}
{{-     $var := $root.Values -}}
{{-     $segments := regexSplit "\\." $path -1 -}}
{{-     $context := (dict "var" $var) -}}
{{-     range $segment := $segments -}}
{{-       $var := (get $context "var") -}}
{{-       $var := get $var $segment -}}
{{-       if empty $var -}}
{{-         fail (join "" (list "Expect .Values." $path)) -}}
{{-       end -}}
{{-       $context := set $context "var" $var -}}
{{-     end -}}
{{-   end -}}
{{- end -}}

{{/*
Labels for a component
*/}}
{{- define "cap.labels" -}}
helm.sh/revision: {{ .Release.Revision | quote }}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end }}
{{- end -}}

{{/*
Labels to select a component
*/}}
{{- define "cap.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Image
*/}}
{{- define "cap.image" -}}
    {{- if .image.tag -}}
{{ .image.repository }}:{{ .image.tag }}
    {{- else -}}
{{ .image.repository }}
    {{- end -}}
{{- end -}}

{{/*
Image Pull Policy
*/}}
{{- define "cap.imagePullPolicy" -}}
    {{- if and (.image.tag) (ne .image.tag "latest") -}}
IfNotPresent
    {{- else -}}
Always
    {{- end -}}
{{- end -}}

{{/*
Image Pull Secrets
*/}}
{{- define "cap.imagePullSecrets" -}}
    {{- if (and .Values.global.imagePullSecret .Values.global.imagePullSecret.name) }}
imagePullSecrets:
- name: {{ .Values.global.imagePullSecret.name | quote }}
    {{- end -}}
{{- end -}}

{{/*
Service Instance NEW
ternary dict ($.Files.Get $.service.config | fromJson)
*/}}
{{- define "cap.service-instance" -}}
{{- $key := .Template.Name | lower | regexFind "[a-zA-Z0-9_-]+.yaml" | replace ".yaml" "" | replace "-" "_" }}
{{- $service := get .Values $key }}
{{- if $service }}
{{- if or (not (hasKey $service "enabled")) $service.enabled }}
{{- $name := $key | replace "_" "-" }}
{{- $serviceParameters := $service.parameters | default (dict) }}
{{- $configParameters := (dict) }}
{{- if $service.config }}
    {{- $configString := $.Files.Get $service.config }}
    {{- if not $configString }}
        {{- fail (print "Config file " $service.config " not found") }}
    {{- end }}
    {{- $_ := merge $configParameters (fromJson $configString) }}
{{- end }}
{{- $defaultParameters := $.defaultParameters | default dict }}
{{- $parameters := (dict) }}
{{- if or ( not (hasKey $ "useDefaults") )  ( not $.useDefaults ) }}
  {{- $parameters = merge $serviceParameters $configParameters $defaultParameters }}
{{- else }}
  {{- $parameters = mergeOverwrite $serviceParameters $configParameters $defaultParameters }}
{{- end }}
apiVersion: services.cloud.sap.com/v1
kind: ServiceInstance
metadata:
  name: {{ include "cap.service-instance.serviceInstanceName" (dict "root" . "name" $name "service" $service) }}
  namespace: {{ .Release.Namespace }}
  labels: {{- include "cap.labels" (merge (dict "name" $name) .) | nindent 4 }}
spec:
  serviceOfferingName: {{ $service.serviceOfferingName }}
  servicePlanName: {{ $service.servicePlanName }}
  externalName: {{ .Release.Namespace }}-{{ include "cap.service-instance.serviceInstanceName" (dict "root" . "name" $name "service" $service) }}
  parameters:
{{ toYaml $parameters | indent 4 }}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
    Service Instance from helm chart
*/}}
{{- define "cap.service-instance.serviceInstanceName" -}}
  {{- if .service.fullnameOverride }}
    {{- if gt (len .service.fullnameOverride) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" .service.fullnameOverride) }}
    {{- end }}
    {{- include "template-value" ( dict "value" .service.fullnameOverride "context" .root ) }}
  {{- else }}
    {{- $name := .name }}
    {{- if not (hasPrefix .root.Release.Name $name)}}
      {{- $name = printf "%s-%s" .root.Release.Name $name }}
    {{- end }}
    {{- if gt (len $name) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" $name) }}
    {{- end }}
    {{- $name }}
  {{- end }}
{{- end }}

{{/*
    Render Value Helper
*/}}
{{ define "template-value" }}
  {{- if kindIs "string" .value }}
    {{- tpl .value .context }}
  {{- else }}
    {{- tpl (.value | toYaml) .context }}     
  {{- end }}
{{- end }}