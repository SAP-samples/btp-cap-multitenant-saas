# Kyma Deployment

# Advanced Deployment (Full)
helm template \
./charts/sustainable-saas \
-f ./charts/sustainable-saas/values-private.yaml \
-f ./charts/sustainable-saas/values-apim-private.yaml \
-f ./charts/sustainable-saas/values-ias.yaml > helm-template.yaml

# Advanced Deployment (IAS)
helm template \
./charts/sustainable-saas \
-f ./charts/sustainable-saas/values-private.yaml \
-f ./charts/sustainable-saas/values-ias.yaml > helm-template.yaml

# Full Deployment (incl. ANF)
helm template \
./charts/sustainable-saas \
-f ./charts/sustainable-saas/values-private.yaml \
-f ./charts/sustainable-saas/values-anf.yaml > helm-template.yaml

# Basic Deployment
helm template \
./charts/sustainable-saas \
-f ./charts/sustainable-saas/values-private.yaml > helm-template.yaml