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
  btp login --url "https://cli.btp.cloud.sap" \
            --user "$BTP_USERNAME" \
            --password "$BTP_PASSWORD" \
            --subdomain "$BTP_SUBDOMAIN"
  
  if [[ $? -ne 0 ]]; then
    echo "Error: BTP login failed."
    exit 1
  fi

  echo "Successfully logged into BTP."
}

# Function to create a subaccount
create_subaccount() {
  local START_TIME=$(date +%s)
  local DISPLAY_NAME="ci-susaas-$START_TIME"
  local REGION="eu10"
  local SUBDOMAIN="ci-susaas-$START_TIME"
  local START_TIME=$(date +%s)
  
  RESPONSE=$(btp --format json create accounts/subaccount --display-name "$DISPLAY_NAME" --region "$REGION" --subdomain "$SUBDOMAIN")
  SUBACCOUNT_GUID=$(echo "$RESPONSE" | jq -r '.guid')

  if [[ -z "$SUBACCOUNT_GUID" ]]; then
    echo "Error: Failed to create subaccount."
    exit 1
  fi

  echo "Subaccount creation with GUID: $SUBACCOUNT_GUID"
}

# Function to check subaccount status
check_subaccount_status() {
  local START_TIME=$(date +%s)

  while true; do
    local CURRENT_TIME=$(date +%s)
    local ELAPSED_TIME=$(( CURRENT_TIME - START_TIME ))

    if (( ELAPSED_TIME >= TIMEOUT )); then
      echo "Error: Subaccount status check timed out after $TIMEOUT seconds."
      exit 1
    fi

    RESPONSE=$(btp --format json get accounts/subaccount "$SUBACCOUNT_GUID")
    STATUS=$(echo "$RESPONSE" | jq -r '.state')

    if [[ "$STATUS" == "OK" ]]; then
      echo "Subaccount is ready."
      break
    else
      echo "Current status is $STATUS. Checking again in $POLL_INTERVAL seconds..."
    fi

    sleep "$POLL_INTERVAL"
  done
}

# Function to subscribe to the application
subscribe_to_application() {
  RESPONSE=$(btp --format json subscribe accounts/subaccount --to-app "$APPLICATION_NAME" --plan "$PLAN_NAME" -sa "$SUBACCOUNT_GUID")
  JOB_ID=$(echo "$RESPONSE" | jq -r '.jobId')

  if [[ -z "$JOB_ID" ]]; then
    echo "Error: Failed to subscribe to the application."
    exit 1
  fi

  echo "Subscription initiated with Job ID: $JOB_ID"
  check_subscription_status
}

# Function to check subscription status
check_subscription_status() {
  local START_TIME=$(date +%s)

  while true; do
    local CURRENT_TIME=$(date +%s)
    local ELAPSED_TIME=$(( CURRENT_TIME - START_TIME ))

    if (( ELAPSED_TIME >= TIMEOUT )); then
      echo "Error: Subscription status check timed out after $TIMEOUT seconds."
      exit 1
    fi

    RESPONSE=$(btp --format json get accounts/subscription -sa "$SUBACCOUNT_GUID" --of-app "$APPLICATION_NAME" --plan "$PLAN_NAME")
    STATUS=$(echo "$RESPONSE" | jq -r '.state')

    if [[ "$STATUS" == "SUBSCRIBED" ]]; then
      echo "Successfully subscribed to the application."
      break
    elif [[ "$STATUS" == "ERROR" ]]; then
      echo "Error: Subscription failed."
      exit 1
    else
      echo "Current status is $STATUS. Checking again in $POLL_INTERVAL seconds..."
    fi

    sleep "$POLL_INTERVAL"
  done
}

# Function to unsubscribe from the application
unsubscribe_from_application() {
  echo "Initiating unsubscription from the application..."
  
  RESPONSE=$(btp --format json unsubscribe accounts/subaccount --from-app "$APPLICATION_NAME" -sa "$SUBACCOUNT_GUID" --confirm)
  
  # The unsubscribe process is asynchronous, so we don't have a job ID to check
  check_unsubscribe_status
}

# Function to check unsubscription status
check_unsubscribe_status() {
  local START_TIME=$(date +%s)

  while true; do
    local CURRENT_TIME=$(date +%s)
    local ELAPSED_TIME=$(( CURRENT_TIME - START_TIME ))

    if (( ELAPSED_TIME >= TIMEOUT )); then
      echo "Error: Unsubscribe status check timed out after $TIMEOUT seconds."
      exit 1
    fi

    RESPONSE=$(btp --format json get accounts/subscription -sa "$SUBACCOUNT_GUID" --of-app "$APPLICATION_NAME" --plan "$PLAN_NAME")
    STATUS=$(echo "$RESPONSE" | jq -r '.state')

    if [[ "$STATUS" == "NOT_SUBSCRIBED" ]]; then
      echo "Successfully unsubscribed from the application."
      break
    elif [[ "$STATUS" == "ERROR" ]]; then
      echo "Error: Unsubscription failed."
      exit 1
    else
      echo "Current status is $STATUS. Checking again in $POLL_INTERVAL seconds..."
    fi

    sleep "$POLL_INTERVAL"
  done
}
# Function to remove the subaccount
delete_subaccount() {
  echo "Removing the subaccount..."
  
  RESPONSE=$(btp --format json delete accounts/subaccount "$SUBACCOUNT_GUID" --confirm)
  
  echo "Subaccount deletion initiated. Checking status..."

  # Check the status of the subaccount deletion
  check_subaccount_removal
}

# Function to check if the subaccount has been removed
check_subaccount_removal() {
  local START_TIME=$(date +%s)

  while true; do
    local CURRENT_TIME=$(date +%s)
    local ELAPSED_TIME=$(( CURRENT_TIME - START_TIME ))

    if (( ELAPSED_TIME >= TIMEOUT )); then
      echo "Error: Subaccount removal check timed out after $TIMEOUT seconds."
      exit 1
    fi

    RESPONSE=$(btp --format json get accounts/subaccount "$SUBACCOUNT_GUID" 2>&1)

    if echo "$RESPONSE" | grep -q "404 Not Found"; then
      echo "Subaccount removed successfully."
      break
    else
      echo "Subaccount still exists. Checking again in $POLL_INTERVAL seconds..."
    fi

    sleep "$POLL_INTERVAL"
  done
}

# Function to validate if the service broker registration is successful, with retry logic
validate_osb_registration() {
  local BROKER_NAME="susaas-api-$CF_SPACE-$CF_ORG"
  local START_TIME=$(date +%s)

  echo "Validating OSB registration for $BROKER_NAME..."

  while true; do
    local CURRENT_TIME=$(date +%s)
    local ELAPSED_TIME=$(( CURRENT_TIME - START_TIME ))

    if (( ELAPSED_TIME >= TIMEOUT )); then
      echo "Error: Service Broker registration check timed out after $TIMEOUT seconds."
      exit 1
    fi

    RESPONSE=$(btp --format json list services/offering --subaccount "$SUBACCOUNT_GUID" --fields-filter "name eq 'susaas-api-$CF_SPACE-$CF_ORG'")
        # Check if the response contains a valid offering
    SERVICE_OFFERING_ID=$(echo "$RESPONSE" | jq -r '.[0].id')
    IS_READY=$(echo "$RESPONSE" | jq -r '.[0].ready')
    SERVICE_OFFERING_NAME=$(echo "$RESPONSE" | jq -r '.[0].metadata.displayName')

    if [[ "$SERVICE_OFFERING_ID" != "null" && "$IS_READY" == "true" ]]; then
      echo "Service broker registration is successful. Offering ID: $SERVICE_OFFERING_ID"
      return 0  # Exit function on success
    fi

    echo "Service Broker is not yet registered. Checking again in $POLL_INTERVAL seconds..."
    sleep "$POLL_INTERVAL"
  done
}

#!/bin/bash
validate_common_db_entity() {
  local SERVICE_NAME="susaas-uaa"
  local SERVICE_KEY_NAME="ci-key"
  local APP_NAME="susaas-srv-$CF_SPACE"
    
  echo "Creating service key for service $SERVICE_NAME..."
  cf create-service-key $CF_SPACE-$SERVICE_NAME $SERVICE_KEY_NAME -w
 
  echo "Retrieving service key GUID..."
  SERVICE_KEY_GUID=$(cf service-key $CF_SPACE-$SERVICE_NAME $SERVICE_KEY_NAME --guid | tr -d '[:space:]')  # Remove whitespace

  if [[ -z "$SERVICE_KEY_GUID" ]]; then
    echo "Error: Failed to retrieve service key GUID."
    exit 1
  fi

echo "Service key GUID:$SERVICE_KEY_GUID" 

echo "Fetching subdomain for subaccount GUID $SUBACCOUNT_GUID..."

SUBDOMAIN=$(btp --format json get accounts/subaccount $SUBACCOUNT_GUID | jq -r '.subdomain')

if [[ -z "$SUBDOMAIN" || "$SUBDOMAIN" == "null" ]]; then
  echo "Error: Failed to retrieve subdomain."
  exit 1
fi
echo "Subdomain:$SUBDOMAIN"

echo "Fetching credentials for service key GUID $SERVICE_KEY_GUID..."

CLIENT_ID=$(cf curl /v3/service_credential_bindings/$SERVICE_KEY_GUID/details | jq -r '.credentials.clientid')
CLIENT_SECRET=$(cf curl /v3/service_credential_bindings/$SERVICE_KEY_GUID/details | jq -r '.credentials.clientsecret')
OAUTH_URL=$(cf curl /v3/service_credential_bindings/$SERVICE_KEY_GUID/details | jq -r '.credentials.url' | sed "s/^[^.]*\./$SUBDOMAIN./")

if [[ -z "$CLIENT_ID" || -z "$CLIENT_SECRET" || -z "$OAUTH_URL" ]]; then
  echo "Error: Failed to retrieve credentials for service key."
  exit 1
fi

OAUTH_URL="https://$OAUTH_URL"
echo "Token URL:$OAUTH_URL"
echo "Credentials for service key retrieved successfully."

# Fetch the OAuth token
TOKEN=$(curl -s "$OAUTH_URL/oauth/token" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  -u "$CLIENT_ID:$CLIENT_SECRET" \
  --data-urlencode 'grant_type=client_credentials' \
  --data-urlencode 'response_type=token' | jq -r '.access_token')

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Error: Failed to retrieve OAuth token."
  exit 1
fi
echo "OAuth token retrieved successfully.."


# Fetch the Common DB entity with the token
echo "Fetching GUID for app $APP_NAME..."

APP_GUID=$(cf curl "/v3/apps?names=$APP_NAME" | jq -r '.resources[0].guid')

  if [[ -z "$APP_GUID" || "$APP_GUID" == "null" ]]; then
    echo "Error: Failed to retrieve GUID for app $APP_NAME."
    exit 1
  fi

  # Fetch the route for the app using the app GUID
  echo "Fetching route for app $APP_NAME..."
  APP_ROUTE=$(cf curl "/v3/apps/$APP_GUID/routes" | jq -r '.resources[0].url')
  APP_URL="https://$APP_ROUTE"
  echo "App URL has been retrieved:$APP_URL"
  RESPONSE_BODY=$(curl -s -X GET "$APP_URL/catalog/AdminService/SharedEntity" \
    --header "Authorization: Bearer $TOKEN" \
    --header "Content-Type: application/json")
 
  ERROR_PRESENT=$(echo "$RESPONSE_BODY" | jq '.error // empty')
  # If there is an error, extract and display the error details
  if [[ -n "$ERROR_PRESENT" ]]; then
    ERROR_CODE=$(echo "$RESPONSE_BODY" | jq -r '.error.code')
    ERROR_MESSAGE=$(echo "$RESPONSE_BODY" | jq -r '.error.message')
    echo "Error: Received error code $ERROR_CODE with message: $ERROR_MESSAGE"
    exit 1
  fi
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