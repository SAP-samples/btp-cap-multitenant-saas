sap.ui.define(["sap/ui/core/mvc/ControllerExtension"], function(ControllerExtension) {
	"use strict";

	return ControllerExtension.extend("sap.susaas.ui.public.assessments.ext.controller.OPExtend", {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		// https://sapui5.hana.ondemand.com/#/api/sap.ui.core.mvc.ControllerExtension
		// See all subclasses to find relevant methods additional to standard lifecycle methods

		override: {
			onInit: function() {
				// Access the Fiori elements extensionAPI via this.base.getExtensionAPI
				const oExtensionAPI = this.base.getExtensionAPI();
			},

			onBeforeRendering : function() {},

			onExit : function(){},

			routing: {
				onBeforeBinding : function() {},
				onAfterBinding: function() {}
			},

			paginator: {
				onContextUpdate: function() {}
			},

			share: {
				adaptShareMetadata : function() {}
			},

			editFlow: {
				onBeforeSave: function() {
					return new Promise(function(fnResolve, fnReject) {
						fnResolve();
					});
				},
				onBeforeEdit: function() {
					return new Promise(function(fnResolve, fnReject) {
						fnResolve();
					});
				},
				onBeforeDiscard: function() {
					return new Promise(function(fnResolve, fnReject) {
						fnResolve();
					});
				},
				onBeforeCreate: function() {
					return new Promise(function(fnResolve, fnReject) {
						fnResolve();
					});
				},
				onBeforeDelete: function() {
					return new Promise(function(fnResolve, fnReject) {
						fnResolve();
					});
				}
			},

			viewState: {
				onSuspend: function() {},
			},

			intentBasedNavigation : {
				adaptNavigationContext : function() {}
			}
		}
	});
});