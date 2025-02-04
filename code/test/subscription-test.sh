#!/bin/bash

# Configuration Variables
SUBACCOUNT_GUID=""
APPLICATION_NAME="susaas-dev-tfe-saas-dev-test"
PLAN_NAME="default"
POLL_INTERVAL=10
TIMEOUT=90

# Login
btp_login() {
  echo "Logging into BTP..."
  if ! btp login --url "https://cli.btp.cloud.sap" \
                 --user "$BTP_USERNAME" \
                 --password "$BTP_PASSWORD" \
                 --subdomain "$BTP_SUBDOMAIN"; then
    echo "Error: BTP login failed."
    exit 1
  fi
  echo "Successfully logged into BTP."
}

# Create subaccount and get GUID
create_subaccount() {
  local DISPLAY_NAME="ci-susaas-$(date +%s)"
  local REGION="eu10"
  local SUBDOMAIN="ci-susaas-$(date +%s)"

  SUBACCOUNT_GUID=$(btp --format json create accounts/subaccount \
                        --display-name "$DISPLAY_NAME" \
                        --region "$REGION" \
                        --subdomain "$SUBDOMAIN" | jq -r '.guid')

  [[ -z "$SUBACCOUNT_GUID" ]] && { echo "Error: Failed to create subaccount."; exit 1; }
  echo "Subaccount created with GUID: $SUBACCOUNT_GUID"
}

# Check subaccount status
check_subaccount_status() {
  local START_TIME=$(date +%s)
  while :; do
    STATUS=$(btp --format json get accounts/subaccount "$SUBACCOUNT_GUID" | jq -r '.state')
    [[ "$STATUS" == "OK" ]] && { echo "Subaccount is ready."; break; }
    [[ $(($(date +%s) - START_TIME)) -ge $TIMEOUT ]] && { echo "Error: Subaccount status check timed out."; exit 1; }
    echo "Current status is $STATUS. Checking again in $POLL_INTERVAL seconds..."
    sleep "$POLL_INTERVAL"
  done
}

# Subscribe to application
subscribe_to_application() {
  JOB_ID=$(btp --format json subscribe accounts/subaccount \
               --to-app "$APPLICATION_NAME" \
               --plan "$PLAN_NAME" \
               -sa "$SUBACCOUNT_GUID" | jq -r '.jobId')

  [[ -z "$JOB_ID" ]] && { echo "Error: Failed to subscribe to the application."; exit 1; }
  echo "Subscription initiated with Job ID: $JOB_ID"
  check_subscription_status
}

# Check subscription status
check_subscription_status() {
  local START_TIME=$(date +%s)
  while :; do
    STATUS=$(btp --format json get accounts/subscription \
                 -sa "$SUBACCOUNT_GUID" \
                 --of-app "$APPLICATION_NAME" \
                 --plan "$PLAN_NAME" | jq -r '.state')

    case "$STATUS" in
      "SUBSCRIBED") echo "Successfully subscribed to the application."; break ;;
      "ERROR") echo "Error: Subscription failed."; exit 1 ;;
      *) echo "Current status is $STATUS. Checking again in $POLL_INTERVAL seconds..." ;;
    esac

    [[ $(($(date +%s) - START_TIME)) -ge $TIMEOUT ]] && { echo "Error: Subscription status check timed out."; exit 1; }
    sleep "$POLL_INTERVAL"
  done
}

# Unsubscribe from application
unsubscribe_from_application() {
  echo "Initiating unsubscription from the application..."
  btp --format json unsubscribe accounts/subaccount \
      --from-app "$APPLICATION_NAME" \
      -sa "$SUBACCOUNT_GUID" --confirm
  check_unsubscribe_status
}

# Check unsubscription status
check_unsubscribe_status() {
  local START_TIME=$(date +%s)
  while :; do
    STATUS=$(btp --format json get accounts/subscription \
                 -sa "$SUBACCOUNT_GUID" \
                 --of-app "$APPLICATION_NAME" \
                 --plan "$PLAN_NAME" | jq -r '.state')

    [[ "$STATUS" == "NOT_SUBSCRIBED" ]] && { echo "Successfully unsubscribed from the application."; break; }
    [[ $(($(date +%s) - START_TIME)) -ge $TIMEOUT ]] && { echo "Error: Unsubscribe status check timed out."; exit 1; }
    echo "Current status is $STATUS. Checking again in $POLL_INTERVAL seconds..."
    sleep "$POLL_INTERVAL"
  done
}

# Delete subaccount
delete_subaccount() {
  echo "Removing the subaccount..."
  btp --format json delete accounts/subaccount "$SUBACCOUNT_GUID" --confirm
  check_subaccount_removal
}

# Check subaccount removal
check_subaccount_removal() {
  local START_TIME=$(date +%s)
  while :; do
    if ! btp --format json get accounts/subaccount "$SUBACCOUNT_GUID" &>/dev/null; then
      echo "Subaccount removed successfully."
      break
    fi
    [[ $(($(date +%s) - START_TIME)) -ge $TIMEOUT ]] && { echo "Error: Subaccount removal check timed out."; exit 1; }
    echo "Subaccount still exists. Checking again in $POLL_INTERVAL seconds..."
    sleep "$POLL_INTERVAL"
  done
}

# Validate OSB registration
validate_osb_registration() {
  local START_TIME=$(date +%s)
  while :; do
    RESPONSE=$(btp --format json list services/offering \
                   --subaccount "$SUBACCOUNT_GUID" \
                   --fields-filter "name eq 'susaas-api-$CF_SPACE-$CF_ORG'")
    SERVICE_OFFERING_ID=$(echo "$RESPONSE" | jq -r '.[0].id')
    IS_READY=$(echo "$RESPONSE" | jq -r '.[0].ready')

    [[ "$SERVICE_OFFERING_ID" != "null" && "$IS_READY" == "true" ]] && { echo "Service broker registration is successful."; return 0; }
    [[ $(($(date +%s) - START_TIME)) -ge $TIMEOUT ]] && { echo "Error: Service Broker registration check timed out."; exit 1; }
    echo "Service Broker is not yet registered. Checking again in $POLL_INTERVAL seconds..."
    sleep "$POLL_INTERVAL"
  done
}

# Validate Common DB entity
validate_common_db_entity() {
  local SERVICE_NAME="susaas-uaa"
  local SERVICE_KEY_NAME="ci-key"
  local APP_NAME="susaas-srv-$CF_SPACE"

  echo "Creating service key for service $SERVICE_NAME..."
  cf create-service-key "$CF_SPACE-$SERVICE_NAME" "$SERVICE_KEY_NAME" -w

  echo "Retrieving service key GUID..."
  SERVICE_KEY_GUID=$(cf service-key "$CF_SPACE-$SERVICE_NAME" "$SERVICE_KEY_NAME" --guid | tr -d '[:space:]')
  [[ -z "$SERVICE_KEY_GUID" ]] && { echo "Error: Failed to retrieve service key GUID."; exit 1; }

  echo "Fetching subdomain for subaccount GUID $SUBACCOUNT_GUID..."
  SUBDOMAIN=$(btp --format json get accounts/subaccount "$SUBACCOUNT_GUID" | jq -r '.subdomain')
  [[ -z "$SUBDOMAIN" || "$SUBDOMAIN" == "null" ]] && { echo "Error: Failed to retrieve subdomain."; exit 1; }

  echo "Fetching credentials for service key GUID $SERVICE_KEY_GUID..."
  CREDS=$(cf curl "/v3/service_credential_bindings/$SERVICE_KEY_GUID/details")
  CLIENT_ID=$(echo "$CREDS" | jq -r '.credentials.clientid')
  CLIENT_SECRET=$(echo "$CREDS" | jq -r '.credentials.clientsecret')
  OAUTH_URL=$(echo "$CREDS" | jq -r '.credentials.url' | sed "s/^[^.]*\./$SUBDOMAIN./")
  [[ -z "$CLIENT_ID" || -z "$CLIENT_SECRET" || -z "$OAUTH_URL" ]] && { echo "Error: Failed to retrieve credentials."; exit 1; }

  echo "Fetching OAuth token..."
  TOKEN=$(curl -s "$OAUTH_URL/oauth/token" \
               --header 'Content-Type: application/x-www-form-urlencoded' \
               -u "$CLIENT_ID:$CLIENT_SECRET" \
               --data-urlencode 'grant_type=client_credentials' \
               --data-urlencode 'response_type=token' | jq -r '.access_token')
  [[ -z "$TOKEN" || "$TOKEN" == "null" ]] && { echo "Error: Failed to retrieve OAuth token."; exit 1; }

  echo "Fetching GUID for app $APP_NAME..."
  APP_GUID=$(cf curl "/v3/apps?names=$APP_NAME" | jq -r '.resources[0].guid')
  [[ -z "$APP_GUID" || "$APP_GUID" == "null" ]] && { echo "Error: Failed to retrieve GUID for app $APP_NAME."; exit 1; }

  echo "Fetching route for app $APP_NAME..."
  APP_ROUTE=$(cf curl "/v3/apps/$APP_GUID/routes" | jq -r '.resources[0].url')
  APP_URL="https://$APP_ROUTE"

  echo "Validating Common DB entity..."
  RESPONSE_BODY=$(curl -s -X GET "$APP_URL/catalog/AdminService/SharedEntity" \
                       --header "Authorization: Bearer $TOKEN" \
                       --header "Content-Type: application/json")
  ERROR_PRESENT=$(echo "$RESPONSE_BODY" | jq '.error // empty')
  [[ -n "$ERROR_PRESENT" ]] && { echo "Error: Received error code $(echo "$RESPONSE_BODY" | jq -r '.error.code') with message: $(echo "$RESPONSE_BODY" | jq -r '.error.message')"; exit 1; }
}

# Main script execution
btp_login
create_subaccount
check_subaccount_status
subscribe_to_application
validate_osb_registration
validate_common_db_entity
unsubscribe_from_application
delete_subaccount
