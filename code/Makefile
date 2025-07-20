IMAGE_PREFIX ?= sap-demo
RELEASE ?= susaas
# Paths
CODE_DIR := .
GEN_DIR := $(CODE_DIR)/gen
APP_DIR := $(CODE_DIR)/app

# Tools
PACK := pack build
DOCKER := docker build
PUSH := docker push
CDS := npx -p @sap/cds-dk@8.9.4 cds build -in $(CODE_DIR) --profile production

# ---------- General ----------
install:
	cd $(CODE_DIR) && npm install --include=dev

build: cds-build ui-build

cds-build:
	$(CDS)

# ---------- UI ----------
ui-build: ui-admin ui-public

ui-admin: ui-admin-projects ui-admin-users

ui-admin-projects:
	cd $(APP_DIR)/ui-admin-projects && npm run build
	cp -r $(APP_DIR)/ui-admin-projects/dist $(APP_DIR)/ui-admin-projects/build

ui-admin-users:
	cd $(APP_DIR)/ui-admin-users && npm run build
	cp -r $(APP_DIR)/ui-admin-users/dist $(APP_DIR)/ui-admin-users/build

ui-public: ui-public-assessments ui-public-flp ui-public-projects

ui-public-assessments:
	cd $(APP_DIR)/ui-public-assessments && npm run build
	cp -r $(APP_DIR)/ui-public-assessments/dist $(APP_DIR)/ui-public-assessments/build

ui-public-flp:
	cd $(APP_DIR)/ui-public-flp && npm run build
	cp -r $(APP_DIR)/ui-public-flp/dist $(APP_DIR)/ui-public-flp/build

ui-public-projects:
	cd $(APP_DIR)/ui-public-projects && npm run build
	cp -r $(APP_DIR)/ui-public-projects/dist $(APP_DIR)/ui-public-projects/build

# ---------- HTML5 Deployer ----------
deployer-run:
	node $(CODE_DIR)/node_modules/@sap/html5-app-deployer/index.js

deployer-hybrid:
	cds bind --exec --profile hybrid:html5 make deployer-run

# ---------- Build Images ----------
pack: pack-srv pack-db-com pack-router pack-html5-deployer pack-api pack-broker

pack-srv:
	$(PACK) $(IMAGE_PREFIX)/susaas-srv --path $(GEN_DIR)/srv --builder paketobuildpacks/builder-jammy-base --buildpack paketo-buildpacks/nodejs -e BP_LAUNCHPOINT=./node_modules/@sap/cds/bin/serve.js

pack-db-com:
	$(PACK) $(IMAGE_PREFIX)/susaas-db-com --path $(GEN_DIR)/db-com --builder paketobuildpacks/builder-jammy-base --buildpack paketo-buildpacks/nodejs -e BP_LAUNCHPOINT=./node_modules/@sap/hdi-deploy/deploy.js

pack-api:
	$(PACK) $(IMAGE_PREFIX)/susaas-api --path $(GEN_DIR)/api --builder paketobuildpacks/builder-jammy-base --buildpack paketo-buildpacks/nodejs -e BP_LAUNCHPOINT=./node_modules/@sap/cds/bin/serve.js

pack-broker:
	$(PACK) $(IMAGE_PREFIX)/susaas-broker --path $(CODE_DIR)/broker --builder paketobuildpacks/builder-jammy-base --buildpack paketo-buildpacks/nodejs -e BP_LAUNCHPOINT=./start.js

pack-router:
	$(DOCKER) -t $(IMAGE_PREFIX)/susaas-router $(CODE_DIR)/router

pack-html5-deployer:
	$(DOCKER) -t $(IMAGE_PREFIX)/susaas-html5-deployer $(APP_DIR)

# ---------- Push Images ----------
push-all: push-srv push-db-com push-router push-html5-deployer push-api push-broker

push-srv:
	$(PUSH) $(IMAGE_PREFIX)/susaas-srv

push-db-com:
	$(PUSH) $(IMAGE_PREFIX)/susaas-db-com

push-router:
	$(PUSH) $(IMAGE_PREFIX)/susaas-router

push-api:
	$(PUSH) $(IMAGE_PREFIX)/susaas-api

push-broker:
	$(PUSH) $(IMAGE_PREFIX)/susaas-broker

push-html5-deployer:
	$(PUSH) $(IMAGE_PREFIX)/susaas-html5-deployer
