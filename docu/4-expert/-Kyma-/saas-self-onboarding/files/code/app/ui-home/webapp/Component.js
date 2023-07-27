/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/susaas/ui/home/model/models"
    ],
    function (UIComponent, models) {
        "use strict";

        return UIComponent.extend("sap.susaas.ui.home.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {
                UIComponent.prototype.init.apply(this, arguments);
                
                this.getRouter().initialize();
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);