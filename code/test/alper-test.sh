#!/bin/bash

validate_osb_registration() {
  local BROKER_NAME="susaas-api-$CF_SPACE-$CF_ORG"
  local MAX_ATTEMPTS=3
  local ATTEMPT=0
  local INTERVAL=5  # Time in seconds between attempts
  local TIMEOUT=30   # Total timeout in seconds
  local START_TIME=$(date +%s)

  echo "Validating OSB registration for $CF_APP_NAME..."

  while (( ATTEMPT < MAX_ATTEMPTS )); do
    RESPONSE=$(btp --format json list services/offering --subaccount "$SUBACCOUNT_GUID" --fields-filter "name eq 'susaas-api-$CF_SPACE-$CF_ORG'")
    
    # Check if the response contains a valid offering
    SERVICE_OFFERING_ID=$(echo "$RESPONSE" | jq -r '.[0].id')
    IS_READY=$(echo "$RESPONSE" | jq -r '.[0].ready')
    SERVICE_OFFERING_NAME=$(echo "$RESPONSE" | jq -r '.[0].metadata.displayName')

    if [[ "$SERVICE_OFFERING_ID" != "null" && "$IS_READY" == "true" ]]; then
      echo "Service broker registration is successful. Offering Name: $SERVICE_OFFERING_NAME"
      return 0  # Exit function on success
    fi

    # Calculate elapsed time
    local CURRENT_TIME=$(date +%s)
    local ELAPSED_TIME=$(( CURRENT_TIME - START_TIME ))

    if (( ELAPSED_TIME >= TIMEOUT )); then
      echo "Error: OSB registration validation timed out after $TIMEOUT seconds."
      exit 1
    fi

    echo "Attempt $(( ATTEMPT + 1 )) failed. Retrying in $INTERVAL seconds..."
    sleep "$INTERVAL"
    (( ATTEMPT++ ))
  done

  echo "Error: Service broker registration failed after $MAX_ATTEMPTS attempts."
  exit 1
}
validate_osb_registration