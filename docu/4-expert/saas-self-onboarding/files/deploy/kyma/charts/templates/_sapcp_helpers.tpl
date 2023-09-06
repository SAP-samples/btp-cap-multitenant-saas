
{{/*
SAPCP Service Bindings: volume mounts
*/}}
{{- define "cap.sapcp.bindingsVolumeMounts" -}}
    {{- $ := . -}}
    {{- range $key, $binding := .bindings -}}
    {{- if ( or ( not (hasKey $binding "enabled")) $binding.enabled ) }}
- name: {{ $key | replace "_" "-" }}-secret
  mountPath: /bindings/{{ $key }}
  readOnly: true
    {{- end }}
    {{- end }}
{{- end }}


{{/*
SAPCP Service Bindings: volumes
*/}}
{{- define "cap.sapcp.bindingsVolumes" -}}
    {{- $ := . -}}
    {{ range $bindingName, $binding := .bindings -}}
    {{- if ( or ( not (hasKey $binding "enabled")) $binding.enabled ) }}
        {{- $secret := include "cap.sapcp.bindingSecretName" (dict "root" $.root "name" $.name "bindingName" $bindingName "binding" $binding) -}}
- name: {{ $bindingName | replace "_" "-" }}-secret
  secret:
    secretName: {{ $secret | quote }}
    {{- end }}
    {{- end -}}
{{- end -}}


{{/*
Binding Secret Name
*/}}
{{- define "cap.sapcp.bindingName" -}}
{{ print $.root.Release.Name "-" $.name "-" $.bindingName | replace "_" "-" }}
{{- end -}}

{{/*
SAPCP Service Bindings: bindings
*/}}
{{- define "cap.sapcp.bindings" -}}
{{- $ := . -}}
{{- range $name, $params := .bindings }}
{{- if ( or ( not (hasKey $params "enabled")) $params.enabled ) }}
{{- if not $params.fromSecret }}
---
apiVersion: services.cloud.sap.com/v1
kind: ServiceBinding
metadata:
  namespace: {{ $.Release.Namespace }}
  name: {{ include "cap.sapcp.bindingName" (dict "root" $.root "name" $.name "bindingName" $name) }}
  labels: {{- include "cap.labels" $ | nindent 4 }}
spec:
  serviceInstanceName: {{include "cap.sapcp.serviceInstanceName" (dict "binding" $params "release" $.Release.Name) }}
  {{- if $params.externalName }}
  externalName: {{ $params.externalName }}
  {{- end }}
  {{- if $params.secretName }}
  secretName: {{ $params.secretName }}
  {{- end }}
  {{- if $params.parameters }}
  parameters: {{ $params.parameters | toYaml | nindent 4 }}
  {{- end }}
  {{- if $params.parametersFrom }}
  parametersFrom: {{ $params.parametersFrom | toYaml | nindent 4 }}
  {{- end }}
  {{- if $params.credentialsRotationPolicy }}
  credentialsRotationPolicy: {{ $params.credentialsRotationPolicy | toYaml | nindent 4 }}
  {{- end }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Binding Secret Name
*/}}
{{- define "cap.sapcp.bindingSecretName" -}}
{{- $secretName := include "cap.sapcp.bindingName" . }}
{{- if .binding.fromSecret }}
{{- $secretName = .binding.fromSecret}}
{{- else if .binding.secretName }}
{{- $secretName = .binding.secretName }}
{{- end }}
{{- $secretName }}
{{- end }}

{{/*
    Service Instance from helm chart
*/}}
{{- define "cap.sapcp.serviceInstanceName" -}}
  {{- if .binding.serviceInstanceFullname }}
    {{- if gt (len .binding.serviceInstanceFullname) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" .binding.serviceInstanceFullname) }}
    {{- end }}
    {{- .binding.serviceInstanceFullname }}
  {{- else }}
    {{- $name := .binding.serviceInstanceName }}
    {{- if not (hasPrefix .release $name)}}
      {{- $name = printf "%s-%s" .release $name }}
    {{- end }}
    {{- if gt (len $name) 63 }}
      {{- fail (printf "name exceeds 63 characters: '%s'" $name) }}
    {{- end }}
    {{- $name }}
  {{- end }}
{{- end }}