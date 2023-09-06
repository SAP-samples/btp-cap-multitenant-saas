sap.ui.define([
    "./BaseController",
    "sap/m/library"
],function (Controller, mobileLibrary) {
        "use strict";

        const URLHelper = mobileLibrary.URLHelper;

        return Controller.extend("sap.susaas.ui.home.controller.MainView", {
            onPressLoginRegister: function(){
                URLHelper.redirect('/sapsusaasobduionboarding/', false);
            }
        });
    }
);