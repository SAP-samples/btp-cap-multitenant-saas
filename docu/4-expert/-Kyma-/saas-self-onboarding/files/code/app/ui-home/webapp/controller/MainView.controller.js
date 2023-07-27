sap.ui.define([
    "./BaseController",
    "sap/m/library"
],function (Controller, mobileLibrary) {
        "use strict";

        const URLHelper = mobileLibrary.URLHelper;

        return Controller.extend("sap.susaas.ui.home.controller.MainView", {
            onPressLoginRegister: function(){
                //window.open(window.location.protocol + "//" + window.location.hostname +'/sapsusaasgateway/redirect', "_self")
                URLHelper.redirect('/sapsusaasgateway/redirect', false);
            }
        });
    }
);