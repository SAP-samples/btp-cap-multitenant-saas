# Schema Docs

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                     | Pattern | Type            | Deprecated | Definition                                    | Title/Description                                                                                      |
| -------------------------------------------- | ------- | --------------- | ---------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| - [global](#global )                         | No      | object          | No         | -                                             | Helm global values                                                                                     |
| - [nameOverride](#nameOverride )             | No      | string          | No         | -                                             | Chart name override                                                                                    |
| - [fullnameOverride](#fullnameOverride )     | No      | string          | No         | -                                             | Override for the \`.fullname\` helper function.                                                        |
| - [replicaCount](#replicaCount )             | No      | integer         | No         | -                                             | Replica count                                                                                          |
| - [port](#port )                             | No      | integer         | No         | -                                             | Port                                                                                                   |
| - [serviceAccountName](#serviceAccountName ) | No      | string          | No         | Same as [name](#global_imagePullSecret_name ) | Service Account name                                                                                   |
| + [image](#image )                           | No      | object          | No         | -                                             | Image configuration                                                                                    |
| - [imagePullSecret](#imagePullSecret )       | No      | object          | No         | -                                             | Image Pull Secret configuration                                                                        |
| - [additionalVolumes](#additionalVolumes )   | No      | array of object | No         | -                                             | Additional Pod volumes                                                                                 |
| - [ha](#ha )                                 | No      | object          | No         | -                                             | High Availability configuration                                                                        |
| + [resources](#resources )                   | No      | object          | No         | -                                             | Pod resources configuration                                                                            |
| - [health_check](#health_check )             | No      | object          | No         | -                                             | Health-check configuration                                                                             |
| - [startupTimeout](#startupTimeout )         | No      | integer         | No         | -                                             | Initial timeout in seconds, during which the app must start giving the response to the liveness-probe. |
| - [env](#env )                               | No      | Combination     | No         | -                                             | Key-value map of environment variables, which should be added to the Pod spec.                         |
| - [envSecretNames](#envSecretNames )         | No      | array           | No         | -                                             | List of Kubernetes Secret names, used as sources for the Pod's environment variables.                  |
| - [expose](#expose )                         | No      | object          | No         | -                                             | -                                                                                                      |
| - [bindings](#bindings )                     | No      | object          | No         | -                                             | Service Binding configuration                                                                          |

## <a name="global"></a>1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `global`

**Title:** Helm global values

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                          |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

**Description:** For more information, see https://helm.sh/docs/chart_template_guide/subcharts_and_globals/#global-chart-values

| Property                                                | Pattern | Type   | Deprecated | Definition | Title/Description               |
| ------------------------------------------------------- | ------- | ------ | ---------- | ---------- | ------------------------------- |
| - [imagePullSecret](#global_imagePullSecret )           | No      | object | No         | -          | Image Pull Secret configuration |
| - [image](#global_image )                               | No      | object | No         | -          | Image configuration             |
| - [additionalProperties](#global_additionalProperties ) | No      | object | No         | -          | -                               |

### <a name="global_imagePullSecret"></a>1.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `imagePullSecret`

**Title:** Image Pull Secret configuration

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                          |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

**Description:** For more information, see https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/

| Property                                                                | Pattern | Type   | Deprecated | Definition                      | Title/Description |
| ----------------------------------------------------------------------- | ------- | ------ | ---------- | ------------------------------- | ----------------- |
| - [name](#global_imagePullSecret_name )                                 | No      | string | No         | In #/definitions/KubernetesName | Secret name       |
| - [dockerconfigjson](#global_imagePullSecret_dockerconfigjson )         | No      | string | No         | -                               | Secret content    |
| - [additionalProperties](#global_imagePullSecret_additionalProperties ) | No      | object | No         | -                               | -                 |

#### <a name="global_imagePullSecret_name"></a>1.1.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `name`

**Title:** Secret name

|                |                              |
| -------------- | ---------------------------- |
| **Type**       | `string`                     |
| **Defined in** | #/definitions/KubernetesName |

**Description:** Name of the Kubernetes Secret, used as an image pull secret (must be of type kubernetes.io/dockerconfigjson). Can't be used with the `dockerconfigjson` option.

| Restrictions                      |                                                                                                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$``` [Test](https://regex101.com/?regex=%5E%5Ba-z0-9%5D%28%5B-a-z0-9%5D%2A%5Ba-z0-9%5D%29%3F%28%5C.%5Ba-z0-9%5D%28%5B-a-z0-9%5D%2A%5Ba-z0-9%5D%29%3F%29%2A%24) |

#### <a name="global_imagePullSecret_dockerconfigjson"></a>1.1.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `dockerconfigjson`

**Title:** Secret content

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** The content for the dynamically generated Kubernetes Secret, which will be used as an image pull secret. Can't be used with the `name` option.

### <a name="global_image"></a>1.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `image`

**Title:** Image configuration

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                          |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

**Description:** Either name or repository is required.

| Property                                                      | Pattern | Type   | Deprecated | Definition                     | Title/Description                                                                                                       |
| ------------------------------------------------------------- | ------- | ------ | ---------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| - [tag](#global_image_tag )                                   | No      | string | No         | In #/definitions/ImageTag      | Image tag without the name (everything after the \`:\` sign, potentially including the \`@sha256\` section at the end). |
| - [registry](#global_image_registry )                         | No      | string | No         | In #/definitions/ImageRegistry | Image registry e.g. docker.io                                                                                           |
| - [additionalProperties](#global_image_additionalProperties ) | No      | object | No         | -                              | -                                                                                                                       |

#### <a name="global_image_tag"></a>1.2.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `tag`

|                |                        |
| -------------- | ---------------------- |
| **Type**       | `string`               |
| **Defined in** | #/definitions/ImageTag |

**Description:** Image tag without the name (everything after the `:` sign, potentially including the `@sha256` section at the end).

| Restrictions                      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^((?:(?:[a-zA-Z0-9]\|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])(?:(?:\.(?:[a-zA-Z0-9]\|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]))+)?(?::[0-9]+)?/)?[a-z0-9]+(?:(?:(?:[._]\|__\|[-]*)[a-z0-9]+)+)?(?:(?:/[a-z0-9]+(?:(?:(?:[._]\|__\|[-]*)[a-z0-9]+)+)?)+)?)(?::([\w][\w.-]{0,127}))?(?:@([A-Za-z][A-Za-z0-9]*(?:[-_+.][A-Za-z][A-Za-z0-9]*)*[:][[:xdigit:]]{32,}))?$``` [Test](https://regex101.com/?regex=%5E%28%28%3F%3A%28%3F%3A%5Ba-zA-Z0-9%5D%7C%5Ba-zA-Z0-9%5D%5Ba-zA-Z0-9-%5D%2A%5Ba-zA-Z0-9%5D%29%28%3F%3A%28%3F%3A%5C.%28%3F%3A%5Ba-zA-Z0-9%5D%7C%5Ba-zA-Z0-9%5D%5Ba-zA-Z0-9-%5D%2A%5Ba-zA-Z0-9%5D%29%29%2B%29%3F%28%3F%3A%3A%5B0-9%5D%2B%29%3F%2F%29%3F%5Ba-z0-9%5D%2B%28%3F%3A%28%3F%3A%28%3F%3A%5B._%5D%7C__%7C%5B-%5D%2A%29%5Ba-z0-9%5D%2B%29%2B%29%3F%28%3F%3A%28%3F%3A%2F%5Ba-z0-9%5D%2B%28%3F%3A%28%3F%3A%28%3F%3A%5B._%5D%7C__%7C%5B-%5D%2A%29%5Ba-z0-9%5D%2B%29%2B%29%3F%29%2B%29%3F%29%28%3F%3A%3A%28%5B%5Cw%5D%5B%5Cw.-%5D%7B0%2C127%7D%29%29%3F%28%3F%3A%40%28%5BA-Za-z%5D%5BA-Za-z0-9%5D%2A%28%3F%3A%5B-_%2B.%5D%5BA-Za-z%5D%5BA-Za-z0-9%5D%2A%29%2A%5B%3A%5D%5B%5B%3Axdigit%3A%5D%5D%7B32%2C%7D%29%29%3F%24) |

#### <a name="global_image_registry"></a>1.2.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `registry`

|                |                             |
| -------------- | --------------------------- |
| **Type**       | `string`                    |
| **Defined in** | #/definitions/ImageRegistry |

**Description:** Image registry e.g. docker.io

| Restrictions                      |                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[\w-./]+$``` [Test](https://regex101.com/?regex=%5E%5B%5Cw-.%2F%5D%2B%24) |

## <a name="nameOverride"></a>2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `nameOverride`

**Title:** Chart name override

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Will be used instead of the `.Chart.Name`, e.g. when generating the Deployment name.

| Restrictions                      |                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```[0-9a-z][0-9a-z-.]*``` [Test](https://regex101.com/?regex=%5B0-9a-z%5D%5B0-9a-z-.%5D%2A) |

## <a name="fullnameOverride"></a>3. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `fullnameOverride`

**Title:** Override for the `.fullname` helper function.

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Will be used as an override for the `.fullname` helper function (i.e. `.Release.Name-.Chart.Name`).

| Restrictions                      |                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```[0-9a-z][0-9a-z-.]*``` [Test](https://regex101.com/?regex=%5B0-9a-z%5D%5B0-9a-z-.%5D%2A) |

## <a name="replicaCount"></a>4. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `replicaCount`

**Title:** Replica count

|             |           |
| ----------- | --------- |
| **Type**    | `integer` |
| **Default** | `1`       |

**Description:** Number of desired pods within the Deployment.

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 1 |

## <a name="port"></a>5. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `port`

**Title:** Port

|             |           |
| ----------- | --------- |
| **Type**    | `integer` |
| **Default** | `8080`    |

**Description:** Application's exposed port.

| Restrictions |            |
| ------------ | ---------- |
| **Minimum**  | &ge; 1     |
| **Maximum**  | &le; 65535 |

## <a name="serviceAccountName"></a>6. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `serviceAccountName`

**Title:** Service Account name

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Default**            | `"default"`                          |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of the Service Account assigned to pods.

## <a name="image"></a>7. ![Required](https://img.shields.io/badge/Required-blue) Property `image`

**Title:** Image configuration

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                           | Pattern | Type   | Deprecated | Definition                                  | Title/Description                                                                                                       |
| ---------------------------------- | ------- | ------ | ---------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| + [repository](#image_repository ) | No      | string | No         | -                                           | Repository of the image                                                                                                 |
| - [tag](#image_tag )               | No      | string | No         | Same as [tag](#global_image_tag )           | Image tag without the name (everything after the \`:\` sign, potentially including the \`@sha256\` section at the end). |
| - [registry](#image_registry )     | No      | string | No         | Same as [registry](#global_image_registry ) | Image registry e.g. docker.io                                                                                           |

### <a name="image_repository"></a>7.1. ![Required](https://img.shields.io/badge/Required-blue) Property `repository`

**Title:** Repository of the image

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Should also include the image name (i.e. everything before the `:` sign).

| Restrictions                      |                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[\w-./:]*[@sha256]*$``` [Test](https://regex101.com/?regex=%5E%5B%5Cw-.%2F%3A%5D%2A%5B%40sha256%5D%2A%24) |

### <a name="image_tag"></a>7.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `tag`

|                        |                          |
| ---------------------- | ------------------------ |
| **Type**               | `string`                 |
| **Same definition as** | [tag](#global_image_tag) |

**Description:** Image tag without the name (everything after the `:` sign, potentially including the `@sha256` section at the end).

### <a name="image_registry"></a>7.3. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `registry`

|                        |                                    |
| ---------------------- | ---------------------------------- |
| **Type**               | `string`                           |
| **Same definition as** | [registry](#global_image_registry) |

**Description:** Image registry e.g. docker.io

## <a name="imagePullSecret"></a>8. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `imagePullSecret`

**Title:** Image Pull Secret configuration

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** For more information, see https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/

| Property                                                 | Pattern | Type   | Deprecated | Definition                                    | Title/Description |
| -------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | ----------------- |
| - [name](#imagePullSecret_name )                         | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Secret name       |
| - [dockerconfigjson](#imagePullSecret_dockerconfigjson ) | No      | string | No         | -                                             | Secret content    |

### <a name="imagePullSecret_name"></a>8.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `name`

**Title:** Secret name

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of the Kubernetes Secret, used as an image pull secret (must be of type kubernetes.io/dockerconfigjson). Can't be used with the `dockerconfigjson` option.

### <a name="imagePullSecret_dockerconfigjson"></a>8.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `dockerconfigjson`

**Title:** Secret content

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** The content for the dynamically generated Kubernetes Secret, which will be used as an image pull secret. Can't be used with the `name` option.

## <a name="additionalVolumes"></a>9. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `additionalVolumes`

**Title:** Additional Pod volumes

|             |                   |
| ----------- | ----------------- |
| **Type**    | `array of object` |
| **Default** | `[]`              |

**Description:** List of volumes, which should be mounted into Pods

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [Additional volume configuration](#additionalVolumes_items) | -           |

### <a name="autogenerated_heading_2"></a>9.1. items

**Title:** Additional volume configuration

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                          |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

| Property                                                                 | Pattern | Type   | Deprecated | Definition                                    | Title/Description          |
| ------------------------------------------------------------------------ | ------- | ------ | ---------- | --------------------------------------------- | -------------------------- |
| + [name](#additionalVolumes_items_name )                                 | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of the volume         |
| + [volumeMount](#additionalVolumes_items_volumeMount )                   | No      | object | No         | -                                             | Volume mount configuration |
| - [additionalProperties](#additionalVolumes_items_additionalProperties ) | No      | object | No         | -                                             | -                          |

#### <a name="additionalVolumes_items_name"></a>9.1.1. Property `name`

**Title:** Name of the volume

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

#### <a name="additionalVolumes_items_volumeMount"></a>9.1.2. Property `volumeMount`

**Title:** Volume mount configuration

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                                                     | Pattern | Type             | Deprecated | Definition | Title/Description                                                                                                                                                                                           |
| ---------------------------------------------------------------------------- | ------- | ---------------- | ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| + [mountPath](#additionalVolumes_items_volumeMount_mountPath )               | No      | string           | No         | -          | Path within a Pod, where the volume should be mounted.                                                                                                                                                      |
| - [mountPropagation](#additionalVolumes_items_volumeMount_mountPropagation ) | No      | enum (of string) | No         | -          | Mount propagation allows for sharing volumes mounted by a container to other containers in the same pod, or even to other pods on the same node.                                                            |
| - [readOnly](#additionalVolumes_items_volumeMount_readOnly )                 | No      | boolean          | No         | -          | Whether mounted volume should be in read-only mode.                                                                                                                                                         |
| - [subPath](#additionalVolumes_items_volumeMount_subPath )                   | No      | string           | No         | -          | Sub-path inside the referenced volume instead of its root.                                                                                                                                                  |
| - [subPathExpr](#additionalVolumes_items_volumeMount_subPathExpr )           | No      | string           | No         | -          | Similar to the \`subPath\`, but can be constructed using the downward API environment variables. For more info, see https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath-expanded-environment |

##### <a name="additionalVolumes_items_volumeMount_mountPath"></a>9.1.2.1. Property `mountPath`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Path within a Pod, where the volume should be mounted.

| Restrictions                      |                                                                         |
| --------------------------------- | ----------------------------------------------------------------------- |
| **Must match regular expression** | ```^[^:]*$``` [Test](https://regex101.com/?regex=%5E%5B%5E%3A%5D%2A%24) |

##### <a name="additionalVolumes_items_volumeMount_mountPropagation"></a>9.1.2.2. Property `mountPropagation`

|          |                    |
| -------- | ------------------ |
| **Type** | `enum (of string)` |

**Description:** Mount propagation allows for sharing volumes mounted by a container to other containers in the same pod, or even to other pods on the same node.

Must be one of:
* "None"
* "HostToContainer"

##### <a name="additionalVolumes_items_volumeMount_readOnly"></a>9.1.2.3. Property `readOnly`

|          |           |
| -------- | --------- |
| **Type** | `boolean` |

**Description:** Whether mounted volume should be in read-only mode.

##### <a name="additionalVolumes_items_volumeMount_subPath"></a>9.1.2.4. Property `subPath`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Sub-path inside the referenced volume instead of its root.

##### <a name="additionalVolumes_items_volumeMount_subPathExpr"></a>9.1.2.5. Property `subPathExpr`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Similar to the `subPath`, but can be constructed using the downward API environment variables. For more info, see https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath-expanded-environment

## <a name="ha"></a>10. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `ha`

**Title:** High Availability configuration

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                  | Pattern | Type    | Deprecated | Definition | Title/Description                                                                                                       |
| ------------------------- | ------- | ------- | ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| - [enabled](#ha_enabled ) | No      | boolean | No         | -          | Enables additional high-availability related configuration, like Pod Disruption Budget and Topology Spread Constraints. |

### <a name="ha_enabled"></a>10.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `enabled`

|             |           |
| ----------- | --------- |
| **Type**    | `boolean` |
| **Default** | `true`    |

**Description:** Enables additional high-availability related configuration, like Pod Disruption Budget and Topology Spread Constraints.

## <a name="resources"></a>11. ![Required](https://img.shields.io/badge/Required-blue) Property `resources`

**Title:** Pod resources configuration

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                           | Pattern | Type   | Deprecated | Definition | Title/Description                                                                                  |
| ---------------------------------- | ------- | ------ | ---------- | ---------- | -------------------------------------------------------------------------------------------------- |
| + [requests](#resources_requests ) | No      | object | No         | -          | Minimal required resources for the application to operate, that will be reserved for each replica. |
| + [limits](#resources_limits )     | No      | object | No         | -          | -                                                                                                  |

### <a name="resources_requests"></a>11.1. ![Required](https://img.shields.io/badge/Required-blue) Property `requests`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Minimal required resources for the application to operate, that will be reserved for each replica.

| Property                                                      | Pattern | Type             | Deprecated | Definition | Title/Description                                                                                                                                                                 |
| ------------------------------------------------------------- | ------- | ---------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| + [cpu](#resources_requests_cpu )                             | No      | string or number | No         | -          | CPU resource units, as described here https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-cpu                                               |
| - [ephemeral-storage](#resources_requests_ephemeral-storage ) | No      | string           | No         | -          | Size of the local ephemeral storage, measured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#local-ephemeral-storage |
| + [memory](#resources_requests_memory )                       | No      | string           | No         | -          | Amount of memory, mesaured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory                          |

#### <a name="resources_requests_cpu"></a>11.1.1. ![Required](https://img.shields.io/badge/Required-blue) Property `cpu`

|          |                    |
| -------- | ------------------ |
| **Type** | `string or number` |

**Description:** CPU resource units, as described here https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-cpu

#### <a name="resources_requests_ephemeral-storage"></a>11.1.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `ephemeral-storage`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Size of the local ephemeral storage, measured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#local-ephemeral-storage

#### <a name="resources_requests_memory"></a>11.1.3. ![Required](https://img.shields.io/badge/Required-blue) Property `memory`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Amount of memory, mesaured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory

### <a name="resources_limits"></a>11.2. ![Required](https://img.shields.io/badge/Required-blue) Property `limits`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                                    | Pattern | Type             | Deprecated | Definition | Title/Description                                                                                                                                                                 |
| ----------------------------------------------------------- | ------- | ---------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - [cpu](#resources_limits_cpu )                             | No      | string or number | No         | -          | CPU resource units, as described here https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-cpu                                               |
| - [ephemeral-storage](#resources_limits_ephemeral-storage ) | No      | string           | No         | -          | Size of the local ephemeral storage, measured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#local-ephemeral-storage |
| + [memory](#resources_limits_memory )                       | No      | string           | No         | -          | Amount of memory, mesaured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory                          |

#### <a name="resources_limits_cpu"></a>11.2.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `cpu`

|          |                    |
| -------- | ------------------ |
| **Type** | `string or number` |

**Description:** CPU resource units, as described here https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-cpu

#### <a name="resources_limits_ephemeral-storage"></a>11.2.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `ephemeral-storage`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Size of the local ephemeral storage, measured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#local-ephemeral-storage

#### <a name="resources_limits_memory"></a>11.2.3. ![Required](https://img.shields.io/badge/Required-blue) Property `memory`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Amount of memory, mesaured in bytes. For more info, see https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory

## <a name="health_check"></a>12. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `health_check`

**Title:** Health-check configuration

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                | Pattern | Type   | Deprecated | Definition | Title/Description              |
| --------------------------------------- | ------- | ------ | ---------- | ---------- | ------------------------------ |
| - [liveness](#health_check_liveness )   | No      | object | No         | -          | Liveness-probe configuration.  |
| - [readiness](#health_check_readiness ) | No      | object | No         | -          | Readiness-probe configuration. |

### <a name="health_check_liveness"></a>12.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `liveness`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Liveness-probe configuration.

| Property                               | Pattern | Type   | Deprecated | Definition | Title/Description                                            |
| -------------------------------------- | ------- | ------ | ---------- | ---------- | ------------------------------------------------------------ |
| - [path](#health_check_liveness_path ) | No      | string | No         | -          | HTTP path used by Kubernetes, to perform health-check calls. |

#### <a name="health_check_liveness_path"></a>12.1.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `path`

|             |              |
| ----------- | ------------ |
| **Type**    | `string`     |
| **Default** | `"/healthz"` |

**Description:** HTTP path used by Kubernetes, to perform health-check calls.

### <a name="health_check_readiness"></a>12.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `readiness`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Readiness-probe configuration.

| Property                                | Pattern | Type   | Deprecated | Definition | Title/Description                                            |
| --------------------------------------- | ------- | ------ | ---------- | ---------- | ------------------------------------------------------------ |
| - [path](#health_check_readiness_path ) | No      | string | No         | -          | HTTP path used by Kubernetes, to perform health-check calls. |

#### <a name="health_check_readiness_path"></a>12.2.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `path`

|             |              |
| ----------- | ------------ |
| **Type**    | `string`     |
| **Default** | `"/healthz"` |

**Description:** HTTP path used by Kubernetes, to perform health-check calls.

## <a name="startupTimeout"></a>13. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `startupTimeout`

|             |           |
| ----------- | --------- |
| **Type**    | `integer` |
| **Default** | `30`      |

**Description:** Initial timeout in seconds, during which the app must start giving the response to the liveness-probe.

| Restrictions |        |
| ------------ | ------ |
| **Minimum**  | &ge; 1 |

## <a name="env"></a>14. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `env`

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `combining`                                                                                                                       |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |
| **Default**               | `{}`                                                                                                                              |

**Description:** Key-value map of environment variables, which should be added to the Pod spec.

| Any of(Option)          |
| ----------------------- |
| [item 0](#env_anyOf_i0) |
| [item 1](#env_anyOf_i1) |

### <a name="env_anyOf_i0"></a>14.1. Property `None`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |
| **Default**               | `{}`                                                                                                     |

| Property                                                  | Pattern | Type        | Deprecated | Definition | Title/Description |
| --------------------------------------------------------- | ------- | ----------- | ---------- | ---------- | ----------------- |
| - [^[-._a-zA-Z][-._a-zA-Z0-9]*$](#env_anyOf_i0_pattern1 ) | Yes     | Combination | No         | -          | -                 |

#### <a name="env_anyOf_i0_pattern1"></a>14.1.1. Pattern Property `^[-._a-zA-Z][-._a-zA-Z0-9]*$`
> All properties whose name matches the regular expression
```^[-._a-zA-Z][-._a-zA-Z0-9]*$``` ([Test](https://regex101.com/?regex=%5E%5B-._a-zA-Z%5D%5B-._a-zA-Z0-9%5D%2A%24))
must respect the following conditions

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `combining`                                                                                                                       |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

| Any of(Option)                            |
| ----------------------------------------- |
| [item 0](#env_anyOf_i0_pattern1_anyOf_i0) |
| [item 1](#env_anyOf_i0_pattern1_anyOf_i1) |

##### <a name="env_anyOf_i0_pattern1_anyOf_i0"></a>14.1.1.1. Property `None`

|          |                     |
| -------- | ------------------- |
| **Type** | `integer or string` |

**Description:** Plain value of an environment variable.

##### <a name="env_anyOf_i0_pattern1_anyOf_i1"></a>14.1.1.2. Property `None`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** `valueFrom` configuration for the environment variable https://kubernetes.io/docs/tasks/inject-data-application/environment-variable-expose-pod-information/

| Property                                                                | Pattern | Type   | Deprecated | Definition | Title/Description                    |
| ----------------------------------------------------------------------- | ------- | ------ | ---------- | ---------- | ------------------------------------ |
| - [configMapKeyRef](#env_anyOf_i0_pattern1_anyOf_i1_configMapKeyRef )   | No      | object | No         | -          | Selects a key of a ConfigMap.        |
| - [secretKeyRef](#env_anyOf_i0_pattern1_anyOf_i1_secretKeyRef )         | No      | object | No         | -          | Selects a key of a Secret.           |
| - [resourceFieldRef](#env_anyOf_i0_pattern1_anyOf_i1_resourceFieldRef ) | No      | object | No         | -          | Selects a resource of the container. |
| - [fieldRef](#env_anyOf_i0_pattern1_anyOf_i1_fieldRef )                 | No      | object | No         | -          | Selects a field of the pod.          |

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_configMapKeyRef"></a>14.1.1.2.1. Property `configMapKeyRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a key of a ConfigMap.

| Property                                                        | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                |
| --------------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | ------------------------------------------------ |
| - [name](#env_anyOf_i0_pattern1_anyOf_i1_configMapKeyRef_name ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a ConfigMap.                             |
| - [key](#env_anyOf_i0_pattern1_anyOf_i1_configMapKeyRef_key )   | No      | string | No         | -                                             | Key in that ConfigMap, which value will be used. |

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_configMapKeyRef_name"></a>14.1.1.2.1.1. Property `name`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a ConfigMap.

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_configMapKeyRef_key"></a>14.1.1.2.1.2. Property `key`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Key in that ConfigMap, which value will be used.

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_secretKeyRef"></a>14.1.1.2.2. Property `secretKeyRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a key of a Secret.

| Property                                                     | Pattern | Type   | Deprecated | Definition                                    | Title/Description                             |
| ------------------------------------------------------------ | ------- | ------ | ---------- | --------------------------------------------- | --------------------------------------------- |
| - [name](#env_anyOf_i0_pattern1_anyOf_i1_secretKeyRef_name ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a Secret.                             |
| - [key](#env_anyOf_i0_pattern1_anyOf_i1_secretKeyRef_key )   | No      | string | No         | -                                             | Key in that Secret, which value will be used. |

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_secretKeyRef_name"></a>14.1.1.2.2.1. Property `name`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a Secret.

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_secretKeyRef_key"></a>14.1.1.2.2.2. Property `key`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Key in that Secret, which value will be used.

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_resourceFieldRef"></a>14.1.1.2.3. Property `resourceFieldRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a resource of the container.

| Property                                                                           | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                                                                                                                                               |
| ---------------------------------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - [containerName](#env_anyOf_i0_pattern1_anyOf_i1_resourceFieldRef_containerName ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a Container.                                                                                                                                                            |
| - [resource](#env_anyOf_i0_pattern1_anyOf_i1_resourceFieldRef_resource )           | No      | string | No         | -                                             | Only resources limits and requests (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported. |

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_resourceFieldRef_containerName"></a>14.1.1.2.3.1. Property `containerName`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a Container.

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_resourceFieldRef_resource"></a>14.1.1.2.3.2. Property `resource`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Only resources limits and requests (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported.

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_fieldRef"></a>14.1.1.2.4. Property `fieldRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a field of the pod.

| Property                                                           | Pattern | Type   | Deprecated | Definition | Title/Description                                                                                                                                                                                |
| ------------------------------------------------------------------ | ------- | ------ | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| - [fieldPath](#env_anyOf_i0_pattern1_anyOf_i1_fieldRef_fieldPath ) | No      | string | No         | -          | Supports metadata.name, metadata.namespace, \`metadata.labels['<KEY>']\`, \`metadata.annotations['<KEY>']\`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs. |

##### <a name="env_anyOf_i0_pattern1_anyOf_i1_fieldRef_fieldPath"></a>14.1.1.2.4.1. Property `fieldPath`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Supports metadata.name, metadata.namespace, `metadata.labels['<KEY>']`, `metadata.annotations['<KEY>']`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs.

### <a name="env_anyOf_i1"></a>14.2. Property `None`

|          |                   |
| -------- | ----------------- |
| **Type** | `array of object` |

| Each item of this array must be     | Description |
| ----------------------------------- | ----------- |
| [item 1 items](#env_anyOf_i1_items) | -           |

#### <a name="autogenerated_heading_3"></a>14.2.1. items

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                                    | Pattern | Type              | Deprecated | Definition | Title/Description                    |
| ----------------------------------------------------------- | ------- | ----------------- | ---------- | ---------- | ------------------------------------ |
| + [name](#env_anyOf_i1_items_name )                         | No      | string            | No         | -          | -                                    |
| - [value](#env_anyOf_i1_items_value )                       | No      | string or integer | No         | -          | -                                    |
| - [configMapKeyRef](#env_anyOf_i1_items_configMapKeyRef )   | No      | object            | No         | -          | Selects a key of a ConfigMap.        |
| - [secretKeyRef](#env_anyOf_i1_items_secretKeyRef )         | No      | object            | No         | -          | Selects a key of a Secret.           |
| - [resourceFieldRef](#env_anyOf_i1_items_resourceFieldRef ) | No      | object            | No         | -          | Selects a resource of the container. |
| - [fieldRef](#env_anyOf_i1_items_fieldRef )                 | No      | object            | No         | -          | Selects a field of the pod.          |

##### <a name="env_anyOf_i1_items_name"></a>14.2.1.1. Property `name`

|          |          |
| -------- | -------- |
| **Type** | `string` |

| Restrictions                      |                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[-._a-zA-Z][-._a-zA-Z0-9]*$``` [Test](https://regex101.com/?regex=%5E%5B-._a-zA-Z%5D%5B-._a-zA-Z0-9%5D%2A%24) |

##### <a name="env_anyOf_i1_items_value"></a>14.2.1.2. Property `value`

|          |                     |
| -------- | ------------------- |
| **Type** | `string or integer` |

##### <a name="env_anyOf_i1_items_configMapKeyRef"></a>14.2.1.3. Property `configMapKeyRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a key of a ConfigMap.

| Property                                            | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                |
| --------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | ------------------------------------------------ |
| - [name](#env_anyOf_i1_items_configMapKeyRef_name ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a ConfigMap.                             |
| - [key](#env_anyOf_i1_items_configMapKeyRef_key )   | No      | string | No         | -                                             | Key in that ConfigMap, which value will be used. |

##### <a name="env_anyOf_i1_items_configMapKeyRef_name"></a>14.2.1.3.1. Property `name`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a ConfigMap.

##### <a name="env_anyOf_i1_items_configMapKeyRef_key"></a>14.2.1.3.2. Property `key`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Key in that ConfigMap, which value will be used.

##### <a name="env_anyOf_i1_items_secretKeyRef"></a>14.2.1.4. Property `secretKeyRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a key of a Secret.

| Property                                         | Pattern | Type   | Deprecated | Definition                                    | Title/Description                             |
| ------------------------------------------------ | ------- | ------ | ---------- | --------------------------------------------- | --------------------------------------------- |
| - [name](#env_anyOf_i1_items_secretKeyRef_name ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a Secret.                             |
| - [key](#env_anyOf_i1_items_secretKeyRef_key )   | No      | string | No         | -                                             | Key in that Secret, which value will be used. |

##### <a name="env_anyOf_i1_items_secretKeyRef_name"></a>14.2.1.4.1. Property `name`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a Secret.

##### <a name="env_anyOf_i1_items_secretKeyRef_key"></a>14.2.1.4.2. Property `key`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Key in that Secret, which value will be used.

##### <a name="env_anyOf_i1_items_resourceFieldRef"></a>14.2.1.5. Property `resourceFieldRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a resource of the container.

| Property                                                               | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                                                                                                                                               |
| ---------------------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - [containerName](#env_anyOf_i1_items_resourceFieldRef_containerName ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a Container.                                                                                                                                                            |
| - [resource](#env_anyOf_i1_items_resourceFieldRef_resource )           | No      | string | No         | -                                             | Only resources limits and requests (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported. |

##### <a name="env_anyOf_i1_items_resourceFieldRef_containerName"></a>14.2.1.5.1. Property `containerName`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a Container.

##### <a name="env_anyOf_i1_items_resourceFieldRef_resource"></a>14.2.1.5.2. Property `resource`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Only resources limits and requests (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported.

##### <a name="env_anyOf_i1_items_fieldRef"></a>14.2.1.6. Property `fieldRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Selects a field of the pod.

| Property                                               | Pattern | Type   | Deprecated | Definition | Title/Description                                                                                                                                                                                |
| ------------------------------------------------------ | ------- | ------ | ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| - [fieldPath](#env_anyOf_i1_items_fieldRef_fieldPath ) | No      | string | No         | -          | Supports metadata.name, metadata.namespace, \`metadata.labels['<KEY>']\`, \`metadata.annotations['<KEY>']\`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs. |

##### <a name="env_anyOf_i1_items_fieldRef_fieldPath"></a>14.2.1.6.1. Property `fieldPath`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Supports metadata.name, metadata.namespace, `metadata.labels['<KEY>']`, `metadata.annotations['<KEY>']`, spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs.

## <a name="envSecretNames"></a>15. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `envSecretNames`

|             |         |
| ----------- | ------- |
| **Type**    | `array` |
| **Default** | `[]`    |

**Description:** List of Kubernetes Secret names, used as sources for the Pod's environment variables.

| Each item of this array must be         | Description |
| --------------------------------------- | ----------- |
| [KubernetesName](#envSecretNames_items) | -           |

### <a name="autogenerated_heading_4"></a>15.1. items

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

## <a name="expose"></a>16. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `expose`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                      | Pattern | Type    | Deprecated | Definition | Title/Description                                                                                                                        |
| ----------------------------- | ------- | ------- | ---------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| - [host](#expose_host )       | No      | string  | No         | -          | Specifies the service's dns name for inbound external traffic. If it doesn't contain a dot, the default cluster domain will be appended. |
| - [enabled](#expose_enabled ) | No      | boolean | No         | -          | Expose the application to the internet.                                                                                                  |

### <a name="expose_host"></a>16.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `host`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Specifies the service's dns name for inbound external traffic. If it doesn't contain a dot, the default cluster domain will be appended.

### <a name="expose_enabled"></a>16.2. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `enabled`

|             |           |
| ----------- | --------- |
| **Type**    | `boolean` |
| **Default** | `true`    |

**Description:** Expose the application to the internet.

## <a name="bindings"></a>17. ![Optional](https://img.shields.io/badge/Optional-yellow) Property `bindings`

**Title:** Service Binding configuration

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                              | Pattern | Type        | Deprecated | Definition | Title/Description |
| ----------------------------------------------------- | ------- | ----------- | ---------- | ---------- | ----------------- |
| - [^[-._a-zA-Z][-._a-zA-Z0-9]*$](#bindings_pattern1 ) | Yes     | Combination | No         | -          | -                 |

### <a name="bindings_pattern1"></a>17.1. ![Optional](https://img.shields.io/badge/Optional-yellow) Pattern Property `^[-._a-zA-Z][-._a-zA-Z0-9]*$`
> All properties whose name matches the regular expression
```^[-._a-zA-Z][-._a-zA-Z0-9]*$``` ([Test](https://regex101.com/?regex=%5E%5B-._a-zA-Z%5D%5B-._a-zA-Z0-9%5D%2A%24))
must respect the following conditions

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `combining`                                                                                                                       |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

| Any of(Option)                        |
| ------------------------------------- |
| [item 0](#bindings_pattern1_anyOf_i0) |
| [item 1](#bindings_pattern1_anyOf_i1) |

#### <a name="bindings_pattern1_anyOf_i0"></a>17.1.1. Property `None`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                                | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                                                                                                                                     |
| ------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| + [fromSecret](#bindings_pattern1_anyOf_i0_fromSecret ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a Kubernetes Secret, with the binding content, compliant to the SAP Kubernetes Service Binding spec |

##### <a name="bindings_pattern1_anyOf_i0_fromSecret"></a>17.1.1.1. Property `fromSecret`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a Kubernetes Secret, with the binding content, compliant to the SAP Kubernetes Service Binding spec

#### <a name="bindings_pattern1_anyOf_i1"></a>17.1.2. Property `None`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                                                              | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - [serviceInstanceName](#bindings_pattern1_anyOf_i1_serviceInstanceName )             | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a BTP Operator Service Instance, created by the \`service-instance\` Helm chart. Can't be used with the \`serviceInstanceFullname\` option.                                                      |
| - [serviceInstanceFullname](#bindings_pattern1_anyOf_i1_serviceInstanceFullname )     | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Full name of a BTP Operator Service Instance. Can't be used with the \`serviceInstanceName\` option.                                                                                                     |
| - [externalName](#bindings_pattern1_anyOf_i1_externalName )                           | No      | string | No         | -                                             | The name for the service binding in SAP BTP                                                                                                                                                              |
| - [secretName](#bindings_pattern1_anyOf_i1_secretName )                               | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | The name of the secret where the credentials are stored.                                                                                                                                                 |
| - [parameters](#bindings_pattern1_anyOf_i1_parameters )                               | No      | object | No         | -                                             | Some services support the provisioning of additional configuration parameters during the bind request. For the list of supported parameters, check the documentation of the particular service offering. |
| - [parametersFrom](#bindings_pattern1_anyOf_i1_parametersFrom )                       | No      | array  | No         | -                                             | List of sources to populate parameters.                                                                                                                                                                  |
| - [credentialsRotationPolicy](#bindings_pattern1_anyOf_i1_credentialsRotationPolicy ) | No      | object | No         | -                                             | Holds automatic credentials rotation configuration. For more details, see https://github.com/SAP/sap-btp-service-operator#spec-1                                                                         |

##### <a name="bindings_pattern1_anyOf_i1_serviceInstanceName"></a>17.1.2.1. Property `serviceInstanceName`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a BTP Operator Service Instance, created by the `service-instance` Helm chart. Can't be used with the `serviceInstanceFullname` option.

##### <a name="bindings_pattern1_anyOf_i1_serviceInstanceFullname"></a>17.1.2.2. Property `serviceInstanceFullname`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Full name of a BTP Operator Service Instance. Can't be used with the `serviceInstanceName` option.

##### <a name="bindings_pattern1_anyOf_i1_externalName"></a>17.1.2.3. Property `externalName`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** The name for the service binding in SAP BTP

##### <a name="bindings_pattern1_anyOf_i1_secretName"></a>17.1.2.4. Property `secretName`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** The name of the secret where the credentials are stored.

##### <a name="bindings_pattern1_anyOf_i1_parameters"></a>17.1.2.5. Property `parameters`

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                          |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

**Description:** Some services support the provisioning of additional configuration parameters during the bind request. For the list of supported parameters, check the documentation of the particular service offering.

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom"></a>17.1.2.6. Property `parametersFrom`

|          |         |
| -------- | ------- |
| **Type** | `array` |

**Description:** List of sources to populate parameters.

| Each item of this array must be                                          | Description |
| ------------------------------------------------------------------------ | ----------- |
| [parametersFrom items](#bindings_pattern1_anyOf_i1_parametersFrom_items) | -           |

##### <a name="autogenerated_heading_5"></a>17.1.2.6.1. items

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `combining`                                                                                                                       |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

| Any of(Option)                                                      |
| ------------------------------------------------------------------- |
| [item 0](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0) |
| [item 1](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1) |

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0"></a>17.1.2.6.1.1. Property `None`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Kubernetes Secret as a parameters source.

| Property                                                                                  | Pattern | Type   | Deprecated | Definition | Title/Description |
| ----------------------------------------------------------------------------------------- | ------- | ------ | ---------- | ---------- | ----------------- |
| - [secretKeyRef](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0_secretKeyRef ) | No      | object | No         | -          | -                 |

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0_secretKeyRef"></a>17.1.2.6.1.1.1. Property `secretKeyRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                                                               | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                                                                                                  |
| -------------------------------------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| + [name](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0_secretKeyRef_name ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a Secret.                                                                                                                  |
| + [key](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0_secretKeyRef_key )   | No      | string | No         | -                                             | Key in that Secret, which contains a string that represents the json to include in the set of parameters to be sent to the broker. |

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0_secretKeyRef_name"></a>17.1.2.6.1.1.1.1. Property `name`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a Secret.

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i0_secretKeyRef_key"></a>17.1.2.6.1.1.1.2. Property `key`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Key in that Secret, which contains a string that represents the json to include in the set of parameters to be sent to the broker.

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1"></a>17.1.2.6.1.2. Property `None`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

**Description:** Kubernetes Config Map as a parameters source.

| Property                                                                                        | Pattern | Type   | Deprecated | Definition | Title/Description |
| ----------------------------------------------------------------------------------------------- | ------- | ------ | ---------- | ---------- | ----------------- |
| - [configMapKeyRef](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1_configMapKeyRef ) | No      | object | No         | -          | -                 |

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1_configMapKeyRef"></a>17.1.2.6.1.2.1. Property `configMapKeyRef`

|                           |                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                 |
| **Additional properties** | [![Not allowed](https://img.shields.io/badge/Not%20allowed-red)](# "Additional Properties not allowed.") |

| Property                                                                                  | Pattern | Type   | Deprecated | Definition                                    | Title/Description                                                                                                                      |
| ----------------------------------------------------------------------------------------- | ------- | ------ | ---------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| + [name](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1_configMapKeyRef_name ) | No      | string | No         | Same as [name](#global_imagePullSecret_name ) | Name of a Config Map                                                                                                                   |
| + [key](#bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1_configMapKeyRef_key )   | No      | string | No         | -                                             | Key in that Config Map, which contains a string that represents the json to include in the set of parameters to be sent to the broker. |

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1_configMapKeyRef_name"></a>17.1.2.6.1.2.1.1. Property `name`

|                        |                                      |
| ---------------------- | ------------------------------------ |
| **Type**               | `string`                             |
| **Same definition as** | [name](#global_imagePullSecret_name) |

**Description:** Name of a Config Map

##### <a name="bindings_pattern1_anyOf_i1_parametersFrom_items_anyOf_i1_configMapKeyRef_key"></a>17.1.2.6.1.2.1.2. Property `key`

|          |          |
| -------- | -------- |
| **Type** | `string` |

**Description:** Key in that Config Map, which contains a string that represents the json to include in the set of parameters to be sent to the broker.

##### <a name="bindings_pattern1_anyOf_i1_credentialsRotationPolicy"></a>17.1.2.7. Property `credentialsRotationPolicy`

|                           |                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                                                                          |
| **Additional properties** | [![Any type: allowed](https://img.shields.io/badge/Any%20type-allowed-green)](# "Additional Properties of any type are allowed.") |

**Description:** Holds automatic credentials rotation configuration. For more details, see https://github.com/SAP/sap-btp-service-operator#spec-1

----------------------------------------------------------------------------------------------------------------------------
