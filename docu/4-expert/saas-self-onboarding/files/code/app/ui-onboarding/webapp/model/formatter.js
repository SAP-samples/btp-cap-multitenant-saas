sap.ui.define([
    
], function () {
    "use strict";
    
    return {
        formatTimestamp: function(sTimestamp) {
            // Convert sTimestamp to a JavaScript Date object
            var backendTimestamp = new Date(sTimestamp);

            // Calculate the user's timezone offset (in minutes)
            var userTimezoneOffset = new Date().getTimezoneOffset();

            // Adjust the timestamp to the user's timezone
            var userTimestamp = new Date(backendTimestamp.getTime() - (userTimezoneOffset * 60 * 1000));

            // Format the adjusted timestamp as needed (e.g., toLocaleString())
            return userTimestamp.toLocaleString();
        }
    };
});
