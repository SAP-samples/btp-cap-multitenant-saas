{{- define "domainPatterns" -}}
    {{- if .Values.app.domains.secondary -}}
        {{- $doms := list .Values.app.domains.primary -}}
        {{- range .Values.app.domains.secondary -}}
            {{- $doms = append $doms . -}}
        {{- end -}}
        {{- if gt (len $doms) 1 -}}
            {{- join "|" $doms | printf "(%s)" -}}
        {{- else -}}
            {{- first $doms -}}
        {{- end -}}
    {{- else -}}
        {{- printf "%s" .Values.app.domains.primary -}}
    {{- end -}}
{{- end -}}

{{- define "secretData" -}}
    {{- $data := dict -}}
    {{- range $k,$v := . -}}
        {{- $_ := set $data $k ($v | mustToJson | trimAll "\"" | b64enc) -}}
    {{- end -}}
    {{ toYaml $data }}
{{- end -}}

{{- define "capApplicationVersionName" -}}
{{ printf "cav-%s-%d" .Values.app.name (default .Values.app.version .Release.Revision)}}
{{- end -}}

{{- define "apiSvcName" -}}
{{ include "capApplicationVersionName" . }}-srv-svc.{{ .Release.Namespace }}.svc.cluster.local
{{- end -}}