sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    'sap/m/library'
],function (Controller, JSONModel, MessageToast, mobileLibrary) {
        "use strict";
        const URLHelper = mobileLibrary.URLHelper;

        return Controller.extend("sap.susaas.ui.onboarding.controller.MainView", {

            onInit: function () {
                this.oView = this.getView();
                this.oModel = this.getOwnerComponent().getModel();

                this.getView().setModel(new JSONModel({
                    aTenants: [],
                    bHasTenant: false,
                    oStatus: {
                        sProcess: null, 
                        sStatus: null // currently not used
                    }
                }), 'viewModel');

                this._updateStatus();
            },

            onPressAccessTenant: function(){
                //window.open(window.location.protocol + "//" + window.location.hostname +'/sapsusaasgateway/redirect', "_self")
                URLHelper.redirect('/sapsusaasgateway/redirect', false);
            },

            onPressAccessPlatform: function(){
                URLHelper.redirect("https://emea.cockpit.btp.cloud.sap/cockpit/?idp=" + this.getModel('viewModel').getProperty('/aTenants/0/platformIdpUrl'), true);
            },

            onPressOnboarding: function(){
                this.oModel.callFunction("/onboardTenant", {
                    method: "GET",
                    success: function() { 
                        console.log(`Onboarding started...`);
                        MessageToast.show('Onboarding started');
                        this._updateStatus();
                    }.bind(this),
                    error: function(oError){ 
                        console.error(`Error during Onboarding - ${oError}`);
                        MessageToast.show('Onboarding failed');
                    }
                });
            },


            onPressOffboarding: function(){
                this.oModel.callFunction("/offboardTenant", {
                    method: "GET",
                    success: function() { 
                        console.log(`Offboarding started...`);
                        MessageToast.show('Offboarding started');
                        this._updateStatus();
                    }.bind(this),
                    error: function(oError){ 
                        console.error(`Error during Offboarding - ${oError}`);
                        MessageToast.show('Offboarding failed');
                    }
                });
            },


            _updateStatus: function(){
                this.oModel.callFunction("/status", {
                    method: "GET",
                    success: function(oData) { 
                        this.getModel('viewModel').setProperty('/oStatus', { sProcess: oData.status.process, sStatus: null } );
                        
                        // If process is running, start automatic refresh
                        if(oData.status.process && !this.intStatus){ 
                            this.intStatus = setInterval(() => this._updateStatus(), 10000) 
                        }

                        // If no (more) process is running, update the tenant details and stop refresh (if necessary)
                        if(!oData.status.process){ 
                            this._updateTenant();

                            if(this.intStatus){
                                MessageToast.show('On/Offboarding finished');
                                clearInterval(this.intStatus);
                            }
                        }
                    }.bind(this),
                    error: function(oError){ 
                        console.log(oError);
                        this.getModel('viewModel').setProperty('/oStatus', { sProcess: null, sStatus: null } );

                        // In case of errors, stop automatic refresh
                        this.intStatus ? clearInterval(this.intStatus) : '';
                        this._updateTenant();
                    }.bind(this)
                });
            },


            _updateTenant: function(){
                this.oModel.callFunction("/tenant", {
                    method: "GET",
                    success: function(oData) {                         
                        this.getModel('viewModel').setProperty('/aTenants', Object.keys(oData).length > 0 ? [oData.tenant] : []);
                        this.getModel('viewModel').setProperty('/bHasTenant', Object.keys(oData).length > 0 ? true : false);
                    }.bind(this),
                    error: function(oError){ 
                        console.log(oError);
                    }
                });
            }
        });
    }
);

