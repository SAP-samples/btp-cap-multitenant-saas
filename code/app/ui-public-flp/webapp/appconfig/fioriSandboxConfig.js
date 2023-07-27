(function() {
  "use strict";
  
  const customHost = document.cookie.match('(^|;)\\s*' + 'x-custom-host' + '\\s*=\\s*([^;]+)')?.pop() || ''

  window["sap-ushell-config"] = {
    defaultRenderer: "fiori2",
    renderers: {
      fiori2: {
        componentData: {
          config: {
            search: "hidden",
            enableSearch: false
          },
        },
      },
    },
    services: {
      LaunchPage: {
        adapter: {
          config: {
            catalogs: [],
            groups: [
              {
                id: "MyHome",
                title: "My Home",
                isPreset: false,
                isVisible: true,
                isGroupLocked: false,
                tiles: []
              },
              {
                id: "SusaasUser",
                title: "Susaas User",
                isPreset: false,
                isVisible: true,
                isGroupLocked: false,
                tiles: [
                  {
                    id: "ViewProjects",
                    tileType: "sap.ushell.ui.tile.StaticTile",
                    properties: {
                      title: "View Projects",
                      targetURL: "#Projects-view",
                      icon: "sap-icon://collaborate"
                    }
                  },
                  {
                    id: "ManageAssessments",
                    tileType: "sap.ushell.ui.tile.StaticTile",
                    properties: {
                      title: "Manage Assessments",
                      targetURL: "#Assessments-manage",
                      icon: "sap-icon://simulate"
                    }
                  },
                  {
                    id: "ViewHelp",
                    tileType: "sap.ushell.ui.tile.StaticTile",
                    properties: {
                      title: "View Help",
                      targetURL: "#Help-view",
                      icon: "sap-icon://sys-help",
                      info: "Available soon"
                    }
                  }
                ]
              },
              {
                id: "SusaasAdmin",
                title: "Susaas Admin",
                isPreset: false,
                isVisible: !customHost,
                isGroupLocked: false,
                tiles: [
                  {
                    id: "ManageProjects",
                    tileType: "sap.ushell.ui.tile.StaticTile",
                    properties: {
                      title: "Manage Projects",
                      targetURL: "#Projects-manage",
                      icon: "sap-icon://manager"
                    }
                  },
                  {
                    id: "ManageUsers",
                    tileType: "sap.ushell.ui.tile.StaticTile",
                    properties: {
                      title: "Manage Users",
                      targetURL: "#Users-manage",
                      icon:"sap-icon://user-settings"
                    }
                  }
                ]
              },
              {
                id: "SusaasAdmin",
                title: "Susaas Admin",
                isPreset: false,
                isVisible: !!customHost,
                isGroupLocked: false,
                tiles: [
                  {
                    id: "ManageProjects",
                    tileType: "sap.ushell.ui.tile.StaticTile",
                    properties: {
                      title: "Manage Projects",
                      targetURL: "#Projects-manage",
                      icon: "sap-icon://manager"
                    }
                  },
                  {
                    id: "ManageTenant",
                    tileType: "sap.ushell.ui.tile.StaticTile",
                    properties: {
                      title: "Manage Tenant",
                      targetURL: "#Tenant-manage",
                      icon: "sap-icon://action-settings",
                      info: 'Opens New Tab'
                    }
                  } 
                ]
              }
            ]
          }
        }
      },
      NavTargetResolution: {
        config: {
          enableClientSideTargetResolution: true
        }
      },
      ClientSideTargetResolution: {
        adapter: {
          config: {
            inbounds: {
              ViewProjects: {
                semanticObject: "Projects",
                action: "view",
                title: "View Projects",
                signature: {
                  parameters: {},
                  additionalParameters: "allowed"
                },
                navigationMode: "embedded",
                resolutionResult: {
                  applicationType: "SAPUI5",
                  additionalInformation: "SAPUI5.Component=sap.susaas.ui.public.projects",
                  url: "/sapsusaasuipublicprojects/"
                }
              },
              ManageAssessments: {
                semanticObject: "Assessments",
                action: "manage",
                title: "Manage Assessments",
                signature: {
                  parameters: { id : { renameTo: "ID" } },
                  additionalParameters: "allowed"
                },
                navigationMode: "embedded",
                resolutionResult: {
                  applicationType: "SAPUI5",
                  additionalInformation: "SAPUI5.Component=sap.susaas.ui.public.assessments",
                  url: "/sapsusaasuipublicassessments/"
                }
              },
              CreateAssessments: {
                semanticObject: "Assessments",
                action: "create",
                title: "Create Assessments",
                signature: {
                  parameters: {
                    preferredMode: {
                      defaultValue: {
                          value: "create",
                          format: "plain"
                      }
                    },
                    project_ID: {  renameTo : "project_ID" }
                  },
                  additionalParameters: "allowed"
                },
                navigationMode: "embedded",
                resolutionResult: {
                  applicationType: "SAPUI5",
                  additionalInformation: "SAPUI5.Component=sap.susaas.ui.public.assessments",
                  url: "/sapsusaasuipublicassessments/"
                }
              },
              ManageProjects: {
                semanticObject: "Projects",
                action: "manage",
                title: "Manage Projects",
                signature: {
                  parameters: { },
                  additionalParameters: "allowed"
                },
                navigationMode: "embedded",
                resolutionResult: {
                  applicationType: "SAPUI5",
                  additionalInformation: "SAPUI5.Component=sap.susaas.ui.admin.projects",
                  url: "/sapsusaasuiadminprojects/"
                }
              },
              ManageUsers: {
                semanticObject: "Users",
                action: "manage",
                title: "Manage Users",
                signature: {
                  parameters: { },
                  additionalParameters: "ignored"
                },
                navigationMode: "embedded",
                resolutionResult: {
                  applicationType: "SAPUI5",
                  additionalInformation: "SAPUI5.Component=sap.susaas.ui.admin.users",
                  url: "/sapsusaasuiadminusers/"
                }
              },
              ManageTenant: {
                semanticObject: "Tenant",
                action: "manage",
                title: "Manage Tenant",
                signature: {
                  parameters: {},
                  additionalParameters: "ignored"
                },
                resolutionResult: {
                  applicationType: "URL",
                  url: window.location.protocol + "//" + window.location.host + '/sapsusaasuionboarding/'
                }
              }
            }
          }
        }
      }
    }
  };
}());