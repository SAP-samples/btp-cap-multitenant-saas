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

# Main script execution
create_subaccount
check_subaccount_status
subscribe_to_application
unsubscribe_from_application
delete_subaccount

