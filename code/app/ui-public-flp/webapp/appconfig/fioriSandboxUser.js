(function() {
  "use strict";

  // If user details can be retrieved, set them for Mock Launchpad
  fetch('/user-api/currentUser')
    .then((res) => {
      if (!res.ok) {
        // Workaround: In case of 401 error, reload the page to re-authenticate
        // https://www.npmjs.com/package/@sap/approuter#session-handling
        if(res.status === 401){
          window.open(window.location.href, "_self");
        }else{
          throw Error(res.statusText);
        }
      }
      // Workaround: If no JSON is returned, reload the page to re-authenticate
      // https://www.npmjs.com/package/@sap/approuter#session-handling
      const contentType = res.headers.get("content-type");
      if (contentType.includes("text/html")) {
        window.open(window.location.href, "_self");
      }
      return res.json()
    })
    .then((data) => {
      if(data) {
        window["sap-ushell-config"].services = {
          ...window["sap-ushell-config"].services,
          Container: {
            adapter: {
              config: {
                id: data.name || 'DefaultUser',
                firstName: data.firstname || 'Default',
                lastName: data.lastname || 'User',
                fullName: `${data.firstname} ${data.lastname}` || 'Default User',
                email: data.email || 'default.user@example.com'
              }
            }
          }
        };
      }else{
        console.error("Error: User infos empty");
      }
    }).catch((error) => {
        console.warn("Error: User infos could not be fetched")
        console.warn(`Error: ${error}`);
    });
}());