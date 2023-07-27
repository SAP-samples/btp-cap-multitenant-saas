sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/services/Container"
],function (UIComponent) {
    "use strict";

    return UIComponent.extend("sap.susaas.ui.public.flp.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            this.getModel().getMetaModel().requestObject("/").then( function () {
                sap.ushell.bootstrap("local").then(function () {
                    sap.ushell.Container.createRenderer('fiori2', true).then(
                        function(oRenderer){ 
                            oRenderer.placeAt("content") 
                        }
                    );
                });
            }.bind(this),
            // Workaround: If metadata cannot be retrieved, reload the page to re-authenticate
            // https://www.npmjs.com/package/@sap/approuter#session-handling
            () => window.open(window.location.href, "_self") );
        }
    });
});