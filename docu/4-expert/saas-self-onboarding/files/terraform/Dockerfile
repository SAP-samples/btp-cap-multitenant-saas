FROM --platform=linux/amd64 hashicorp/terraform:latest

ENV ARCH=linux-amd64
ENV TOOLS_URL=tools.hana.ondemand.com
ENV BTP_CLI_VERSION="2.38.0"

################################
# Install Requirements
################################

RUN apk update && apk upgrade && apk add --no-cache curl

################################
# Download BTP CLI
################################

RUN curl --fail --silent --location --cookie eula_3_1_agreed="$TOOLS_URL/developer-license-3_1.txt" \
    --url "https://$TOOLS_URL/additional/btp-cli-$ARCH-$BTP_CLI_VERSION.tar.gz" \
    | tar -xzf - --strip-components 1 "$ARCH/btp"

RUN mv btp /usr/local/bin/

################################
# Copy Terraform Config Files
################################

WORKDIR /app
COPY . .