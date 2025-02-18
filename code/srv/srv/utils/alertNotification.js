const xsenv = require('@sap/xsenv');
const { OAuthAuthentication, AlertNotificationClient, Severity, Category } = require('@sap_oss/alert-notification-client');
const { Region, Platform } = require('@sap_oss/alert-notification-client/dist/utils/region.js');
const cds = require('@sap/cds')
let anf = new Object();
const Logger = cds.log("notification")
if (cds.env.profiles.find(p => p.includes("hybrid") || p.includes("production"))) {
    try {
        anf = xsenv.getServices({ anf: { label: 'alert-notification' } }).anf;
    } catch (error) {
        Logger.log("Alert Notification Binding is missing, therefore CAP will not interact with Alert Notification Service");
    }
}

class AlertNotification {
    constructor() {
        this.bindingExists = this.checkBinding();
        this.bindingExists && (this.oAuthAuthentication = new OAuthAuthentication({
            username: anf.client_id,
            password: anf.client_secret,
            oAuthTokenUrl: anf.oauth_url.split('?')[0]
        }))
    }

    async checkBinding() {
        try {
            xsenv.getServices({ anf: { label: 'alert-notification' } });
            return true;
        } catch (error) {
            return false
        }
    }

    async sendEvent(event) {
        try {
            const client = new AlertNotificationClient({
                authentication: this.oAuthAuthentication,
                region: new Region(Platform.CF, anf.url),
            });
            switch (event.type) {
                case 'GENERIC':
                    return await this.processEventTypeGeneric(client, event.data);
                default:
                    return await this.processEventDefault(client, event.data);
            }
        } catch (error) {
            Logger.error(`Error: An error occured initializing Alert Notification Client`)
            Logger.error(`Error: ${error.message}`)
        };
    }

    async processEventTypeGeneric(client, data) {
        try {
            const cur_time = Math.floor(+new Date() / 1000);
            return await client.sendEvent({
                body: 'Generic event from ' + process.env["APPLICATION_NAME"] + ' application. DETAILS: ' + JSON.stringify(data.body).replace(/[{}]|,/g, "\\"),
                subject: data.subject,
                eventType: data.eventType,
                severity: Severity[data.severity],
                category: Category[data.category],
                resource: {
                    resourceName: process.env["APPLICATION_NAME"],
                    resourceType: 'deployment',
                    resourceInstance: '1'
                },
                eventTimestamp: cur_time,
                priority: 1
            });
        } catch (error) {
            Logger.error(`Error: An error occurred sending an Alert Notification Event`);
            Logger.error(`Error: ${error.message}`)
        }
    }

    async processEventDefault(client, data) { return }
}

module.exports = AlertNotification