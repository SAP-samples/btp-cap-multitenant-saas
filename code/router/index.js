const approuter = require("@sap/approuter")

const ar = approuter();

ar.first.use("/healthz", function myMiddleware(req, res, next) { res.end('Service available') });

ar.first.use(function myMiddleware(req, res, next) {
    const cookieHeader = req.headers["cookie"] ?? req.headers["Cookie"];
    if(!cookieHeader) { return next() };

    const customHost = cookieHeader.match('(^|;)\\s*' + 'x-custom-host' + '\\s*=\\s*([^;]+)')?.pop();
    if(customHost){ 
        req.headers['x-custom-host']= `${customHost}-${process.env["EXPOSED_HOST"]}`;
    };
    next();
});

ar.start();