/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/susaas/ui/onboarding/model/models"
    ],
    function (UIComponent, models) {
        "use strict";
        return UIComponent.extend("sap.susaas.ui.onboarding.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                UIComponent.prototype.init.apply(this, arguments);

                // Workaround: If metadata cannot be retrieved, reload the page to re-authenticate
                // https://www.npmjs.com/package/@sap/approuter#session-handling
                this.getModel().attachMetadataFailed({}, () => window.open(window.location.href, "_self") );
                
                this.getRouter().initialize();
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);