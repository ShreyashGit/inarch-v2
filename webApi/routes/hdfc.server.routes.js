//#region Imports
const hdfcService = require("../services/hdfcService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/hdfcRequest")
        .post(hdfcService.initiateTransaction);

    app.route("/hdfcResponse")
        .post(hdfcService.endTransaction);
};
//#endregion