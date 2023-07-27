sap.ui.define([
	"sap/ui/core/library"
], function(coreLibrary) {
    "use strict";

    return {
		onPrefillSalesSplits: function() {
			let sActionName = "PublicService.prefillSalesSplits";
			let mParameters = {
				contexts: this.editFlow.getView().getBindingContext(),
				model: this.editFlow.getView().getModel(),
				label: 'Prefill'
			};

			this.editFlow.invokeAction(sActionName, mParameters);

			// Send additional message after action was invoked
			// https://sapui5.hana.ondemand.com/sdk/#/topic/5a9a2a0f2c054b9686acb3497ba32ae2
			/*
				let action = this.editFlow.invokeAction(sActionName, mParameters);
				action.then(() => {
					this.editFlow.securedExecution(() => {
						sap.ui.getCore().getMessageManager().addMessages( 
							new sap.ui.core.message.Message({
								message: "Additional Message", 
								target: "", 
								persistent: true, 
								type: sap.ui.core.MessageType.Success,
								code: "123" 
							}) 
						);
					});
				});
			*/
		},

        onPrefillMaterialSplits: function() {
			let sActionName = "PublicService.prefillMaterialSplits";
			let mParameters = {
				contexts: this.editFlow.getView().getBindingContext(),
                model: this.editFlow.getView().getModel(),
				label: 'Prefill'
			};
			this.editFlow.invokeAction(sActionName, mParameters);
		},

        onPrefillCircularityMetrics: function() {
			let sActionName = "PublicService.prefillCircularityMetrics";
			let mParameters = {
				contexts: this.editFlow.getView().getBindingContext(),
                model: this.editFlow.getView().getModel(),
				label: 'Prefill'
			};
			this.editFlow.invokeAction(sActionName, mParameters);
		}
    }
});