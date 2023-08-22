FROM --platform=linux/amd64 alpine:3

ENV ARCH=linux-amd64
ENV TOOLS_URL=tools.hana.ondemand.com
ENV BTP_CLI_VERSION="2.38.0"
ENV TERRAFORM_VERSION="1.5.5"

ENV USERNAME=user
ENV HOME_FOLDER /home/$USERNAME

################################
# Install Requirements
################################

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "$HOME_FOLDER" \
    "$USERNAME" \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
               bash \
               curl \
               sudo \
               unzip \
               wget \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

################################
# Download BTP CLI
################################

RUN curl --fail --silent --location --cookie eula_3_1_agreed="$TOOLS_URL/developer-license-3_1.txt" \
    --url "https://$TOOLS_URL/additional/btp-cli-$ARCH-$BTP_CLI_VERSION.tar.gz" \
    | tar -xzf - --strip-components 1 "$ARCH/btp"

RUN mv btp /usr/local/bin/

################################
# Download Terraform
################################

RUN wget "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip"
RUN unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip

RUN mv terraform /usr/local/bin/

################################
# Copy Terraform Config
################################

USER $USERNAME
WORKDIR $HOME_FOLDER

COPY --chown=$USERNAME:$USERNAME main.tf $HOME_FOLDER/
COPY --chown=$USERNAME:$USERNAME provider.tf $HOME_FOLDER/
COPY --chown=$USERNAME:$USERNAME variables.tf $HOME_FOLDER/
COPY --chown=$USERNAME:$USERNAME outputs.tf $HOME_FOLDER/

CMD ["sh"]