const approuter = require('@sap/approuter');
let ar = approuter();

ar.first.use("/healthz", function myMiddleware(req, res, next) { res.end('Service available') });
ar.start();