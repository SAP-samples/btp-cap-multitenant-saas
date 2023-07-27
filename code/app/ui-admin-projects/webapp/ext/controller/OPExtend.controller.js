sap.ui.define(
	["sap/ui/core/mvc/ControllerExtension"],
	function (ControllerExtension) {
		"use strict";

		return ControllerExtension.extend("sap.susaas.ui.admin.projects.ext.controller.OPExtend", {
			override: {
				intentBasedNavigation: {
					adaptNavigationContext: function (oSelectionVariant) {
						oSelectionVariant.getSelectOptionsPropertyNames().forEach(function (sSelectOptionName) {
							if (sSelectOptionName !== "ID") {
								oSelectionVariant.removeSelectOption(sSelectOptionName);
							}
						});
					}
				}
			}
		});
	});