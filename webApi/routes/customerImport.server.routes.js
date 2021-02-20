//#region Imports
const customerImportService = require("../services/customerImportService");
const auth = require("../middleware/auth");
require('express-async-errors');
//#endregion

//#region Exports
module.exports = function(app) {
    app.route("/customerImport")
        .post(auth, customerImportService.importCustomers)
        .get(auth, customerImportService.getUploadedExcelStatus);
};
//#endregion