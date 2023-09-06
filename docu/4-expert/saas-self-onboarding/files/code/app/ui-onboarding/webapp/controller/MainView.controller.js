sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/library",
    "sap/ui/core/IntervalTrigger",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    mobileLibrary,
    IntervalTrigger
  ) {
    "use strict";
    const URLHelper = mobileLibrary.URLHelper;

    return Controller.extend("sap.susaas.ui.onboarding.controller.MainView", {
      onInit: function () {
        this.oView = this.getView();

        this.oViewModel = new JSONModel({ bAutoRefresh: false });
        this.oView.setModel(this.oViewModel, "viewModel");
        this.oModel = this.getOwnerComponent().getModel();

        this._initRefreshInterval();
        this._refreshData();
      },

      onPressRefreshToggle: function () {
        if (this.oViewModel.getProperty("/bAutoRefresh")) {
          this._triggerStopRefresh();
        } else {
          this._triggerStartRefresh();
        }
      },

      onPressAccessTenant: async function (oEvent) {
        const url = oEvent.getSource().getBindingContext().getProperty("url");
        URLHelper.redirect(url, false);
      },

      onPressOnboarding: async function (oEvent) {
        this.oView.setBusy(true);

        await new Promise((resolve, reject) => {
          this.oModel.callFunction("/onboardTenant", {
            method: "POST",
            success: () => {
              console.log(`Onboarding started`);
              MessageToast.show("Onboarding started - Auto-Refresh enabled");
              this.oModel.attachEventOnce("batchRequestCompleted", () =>
                resolve()
              );
            },
            error: (err) => reject(err),
          });
        })
          .then(() => {
            this.oModel.attachEventOnce("batchRequestCompleted", async () => {
              this._triggerStartRefresh();
              await new Promise((r) => setTimeout(r, 5000));
              this.oView.setBusy(false);
            });
            this._refreshData();
          })
          .catch((err) => {
            console.error(`Error during Onboarding - ${err}`);
            MessageToast.show("Onboarding failed");
            this.oView.setBusy(false);
          });
      },

      onPressOffboarding: async function () {
        this.oView.setBusy(true);

        await new Promise((resolve, reject) => {
          this.oModel.callFunction("/offboardTenant", {
            method: "POST",
            success: () => {
              console.log(`Offboarding started`);
              MessageToast.show("Offboarding started - Auto-Refresh enabled");
              this.oModel.attachEventOnce("batchRequestCompleted", () =>
                resolve()
              );
            },
            error: (err) => reject(err),
          });
        })
          .then(() => {
            this.oModel.attachEventOnce("batchRequestCompleted", async () => {
              this._triggerStartRefresh();
              await new Promise((r) => setTimeout(r, 5000));
              this.oView.setBusy(false);
            });
            this._refreshData();
          })
          .catch((err) => {
            console.error(`Error during Offboarding - ${err}`);
            MessageToast.show("Offboarding failed");
            this.oView.setBusy(false);
          });
      },

      onExit: function () {
        this._triggerStopRefresh();
      },

      _refreshData: async function () {
        this.oModel.refresh();
      },

      _initRefreshInterval: function () {
        this._refreshInterval = new IntervalTrigger(0);
        this._refreshInterval.addListener(() => {
          this._refreshData();
        });
      },

      _triggerStartRefresh: function () {
        this._refreshInterval.setInterval(5000);
        this.oViewModel.setProperty("/bAutoRefresh", true);
      },

      _triggerStopRefresh: function () {
        this._refreshInterval.setInterval(0);
        this.oViewModel.setProperty("/bAutoRefresh", false);
      },
    });
  }
);
